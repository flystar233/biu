import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";

import { addToast, Link, Pagination } from "@heroui/react";
import { usePagination } from "ahooks";

import { CollectionType } from "@/common/constants/collection";
import { formatDuration } from "@/common/utils";
import GridList from "@/components/grid-list";
import MediaItem from "@/components/media-item";
import { type ScrollRefObject } from "@/components/scroll-container";
import SearchFilter from "@/components/search-filter";
import { VirtualList } from "@/components/virtual-list";
import { getFavResourceList, type FavMedia, type FavResourceListRequestParams } from "@/service/fav-resource";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";
import { useUser } from "@/store/user";

import Info from "./info";
import { getAllFavMedia } from "./utils";

/** 收藏夹详情 */
const Favorites: React.FC = () => {
  const { id: favFolderId } = useParams();
  const ownFolder = useUser(state => state.ownFolder);
  const collectedFolder = useUser(state => state.collectedFolder);
  const displayMode = useSettings(state => state.displayMode);

  const isOwn = ownFolder?.some(item => item.id === Number(favFolderId));
  const isCollected = collectedFolder?.some(item => item.id === Number(favFolderId));
  const play = usePlayList(state => state.play);
  const playList = usePlayList(state => state.playList);
  const addToPlayList = usePlayList(state => state.addList);

  // 搜索和过滤参数
  const [searchParams, setSearchParams] = useState<
    Omit<FavResourceListRequestParams, "media_id" | "ps" | "pn" | "platform">
  >({
    keyword: "",
    tid: 0,
    order: "mtime",
    type: 0,
  });

  // 使用 ref 存储 searchParams，避免 fetchListPage 重建导致的连锁重渲染
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  // 分页模式（卡片模式）
  const {
    data,
    pagination,
    loading,
    runAsync: getPageData,
    refreshAsync,
  } = usePagination(
    async ({ current, pageSize }) => {
      try {
        const res = await getFavResourceList({
          media_id: String(favFolderId ?? ""),
          ps: pageSize,
          pn: current,
          platform: "web",
          ...searchParams,
        });

        return {
          info: res?.data?.info,
          total: res?.data?.info?.media_count,
          list: res?.data?.medias ?? [],
          hasMore: res?.data?.has_more ?? false,
        };
      } catch (error) {
        addToast({
          title: error instanceof Error ? error.message : "获取收藏夹内容失败",
          color: "danger",
        });
        return {
          info: undefined,
          total: 0,
          list: [],
          hasMore: false,
        };
      }
    },
    {
      ready: Boolean(favFolderId) && displayMode === "card",
      refreshDeps: [favFolderId, displayMode, searchParams],
      defaultPageSize: 20,
    },
  );

  // 列表模式：无限下拉分页
  const [listModeData, setListModeData] = useState<{ info: any; list: any[] }>({ info: null, list: [] });
  const [listModeLoading, setListModeLoading] = useState(false);
  const [listModePage, setListModePage] = useState(1);
  const [listModeHasMore, setListModeHasMore] = useState(true);
  const virtualScrollerRef = useRef<ScrollRefObject>(null);

  // 顶部区域收起状态
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const headerCollapsedRef = useRef(false);

  const fetchListPage = useCallback(
    async (page: number, { reset = false } = {}) => {
      if (!favFolderId) return;

      setListModeLoading(true);
      try {
        const res = await getFavResourceList({
          media_id: String(favFolderId),
          ps: 20,
          pn: page,
          platform: "web",
          ...searchParamsRef.current,
        });

        if (res.code === 0 && res.data) {
          const medias = res.data.medias ?? [];

          setListModeData(prev => {
            const baseInfo = res.data?.info ?? prev.info;
            const baseList = reset || page === 1 ? [] : (prev.list ?? []);
            const mergedList = [...baseList, ...medias];
            const totalCount = res.data?.info?.media_count ?? baseInfo?.media_count ?? mergedList.length;
            const nextHasMore =
              typeof res.data?.has_more === "boolean" ? res.data.has_more : mergedList.length < totalCount;
            setListModeHasMore(nextHasMore);
            return { info: baseInfo, list: mergedList };
          });

          setListModePage(page);
        } else {
          setListModeHasMore(false);
        }
      } catch (error) {
        console.error("获取列表数据失败:", error);
        addToast({ title: "获取数据失败", color: "danger" });
      } finally {
        setListModeLoading(false);
      }
    },
    [favFolderId],
  );

  // 使用 ref 存储函数和状态，避免依赖变化导致的连锁重渲染
  const fetchListPageRef = useRef(fetchListPage);
  fetchListPageRef.current = fetchListPage;

  const listModeStateRef = useRef({ hasMore: listModeHasMore, loading: listModeLoading, page: listModePage });
  listModeStateRef.current = { hasMore: listModeHasMore, loading: listModeLoading, page: listModePage };

  // 监听虚拟列表滚动实现下拉加载 + 顶部区域收起
  useEffect(() => {
    if (displayMode !== "list") return;

    const rootEl = virtualScrollerRef.current?.osInstance()?.elements().viewport as HTMLElement | undefined;
    if (!rootEl) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = rootEl;
      const { hasMore, loading, page } = listModeStateRef.current;

      // 滚动超过 50px 时收起顶部区域，只在状态变化时更新
      const shouldCollapse = scrollTop > 50;
      if (shouldCollapse !== headerCollapsedRef.current) {
        headerCollapsedRef.current = shouldCollapse;
        setHeaderCollapsed(shouldCollapse);
      }

      // 如果滚动到底部，强制收起顶部区域
      const isAtBottom = scrollHeight - scrollTop - clientHeight <= 10; // 10px 容差
      if (isAtBottom && !headerCollapsedRef.current) {
        headerCollapsedRef.current = true;
        setHeaderCollapsed(true);
      }

      // 距离底部 200px 时加载更多
      if (scrollHeight - scrollTop - clientHeight < 200) {
        if (hasMore && !loading) {
          fetchListPageRef.current(page + 1);
        }
      }
    };

    rootEl.addEventListener("scroll", handleScroll);
    return () => {
      rootEl.removeEventListener("scroll", handleScroll);
    };
  }, [displayMode, listModeData.list.length]);

  // 根据当前模式获取显示数据
  const currentData = displayMode === "list" ? listModeData : data;
  // 列表模式下用 info 是否存在判断初始加载状态
  const currentLoading = displayMode === "list" ? listModeData.info === null : loading;

  // 缓存 Info 组件需要的数据，避免列表加载更多时触发 Info 重新渲染
  const infoData = useMemo(
    () => ({
      cover: currentData?.info?.cover,
      attr: currentData?.info?.attr,
      title: currentData?.info?.title,
      desc: currentData?.info?.intro,
      upMid: currentData?.info?.upper?.mid,
      upName: currentData?.info?.upper?.name,
      mediaCount: currentData?.info?.media_count,
    }),
    [
      currentData?.info?.cover,
      currentData?.info?.attr,
      currentData?.info?.title,
      currentData?.info?.intro,
      currentData?.info?.upper?.mid,
      currentData?.info?.upper?.name,
      currentData?.info?.media_count,
    ],
  );

  // 刷新当前模式的数据
  const handleRefresh = useCallback(() => {
    if (displayMode === "list") {
      setListModeHasMore(true);
      fetchListPageRef.current(1, { reset: true });
    } else {
      refreshAsync?.();
    }
  }, [displayMode, refreshAsync]);

  // 当收藏夹ID变化时，重置搜索参数和收起状态
  useEffect(() => {
    if (favFolderId) {
      setSearchParams({
        keyword: "",
        tid: 0,
        order: "mtime",
        type: 0,
      });
      setHeaderCollapsed(false);
      headerCollapsedRef.current = false;
    }
  }, [favFolderId]);

  // 统一处理搜索参数变化和模式切换时的数据刷新
  useEffect(() => {
    if (displayMode === "list" && favFolderId) {
      setListModeData({ info: null, list: [] });
      setListModePage(1);
      setListModeHasMore(true);
      fetchListPageRef.current(1, { reset: true });
    }
    // 卡片模式下，usePagination会自动处理searchParams变化
  }, [displayMode, favFolderId, searchParams]);

  // 使用 ref 存储 currentData，避免 useCallback 依赖变化
  const currentDataRef = useRef(currentData);
  currentDataRef.current = currentData;

  const onPlayAll = useCallback(async () => {
    if (!favFolderId) {
      addToast({ title: "收藏夹 ID 无效", color: "danger" });
      return;
    }

    const totalCount = currentDataRef.current?.info?.media_count ?? 0;
    if (!totalCount) {
      addToast({ title: "收藏夹为空", color: "warning" });
      return;
    }

    try {
      const allMedias = await getAllFavMedia({
        id: favFolderId,
        totalCount,
      });

      if (allMedias.length) {
        playList(allMedias);
      } else {
        addToast({ title: "无法获取收藏夹全部歌曲", color: "danger" });
      }
    } catch {
      addToast({ title: "获取收藏夹全部歌曲失败", color: "danger" });
    }
  }, [favFolderId, playList]);

  const addAllMedia = useCallback(async () => {
    if (!favFolderId) {
      addToast({ title: "收藏夹 ID 无效", color: "danger" });
      return;
    }

    const totalCount = currentDataRef.current?.info?.media_count ?? 0;
    if (!totalCount) {
      addToast({ title: "收藏夹为空", color: "warning" });
      return;
    }

    try {
      const allMedias = await getAllFavMedia({
        id: favFolderId,
        totalCount,
      });

      if (allMedias.length) {
        addToPlayList(allMedias);
      } else {
        addToast({ title: "无法获取收藏夹全部歌曲", color: "danger" });
      }
    } catch {
      addToast({ title: "获取收藏夹全部歌曲失败", color: "danger" });
    }
  }, [favFolderId, addToPlayList]);
  const renderMediaItem = useCallback(
    (item: FavMedia) => (
      <MediaItem
        key={item.id}
        displayMode={displayMode}
        type={item.type === 2 ? "mv" : "audio"}
        bvid={item.bvid}
        aid={String(item.id)}
        sid={item.id}
        title={item.title}
        cover={item.cover}
        ownerName={item.upper?.name}
        ownerMid={item.upper?.mid}
        playCount={item.cnt_info.play}
        duration={item.duration as number}
        collectMenuTitle={isOwn ? "修改收藏夹" : "收藏"}
        footer={
          displayMode === "card" &&
          !isCollected && (
            <div className="text-foreground-500 flex w-full items-center justify-between text-sm">
              <Link href={`/user/${item.upper?.mid}`} className="text-foreground-500 text-sm hover:underline">
                {item.upper?.name}
              </Link>
              <span>{formatDuration(item.duration as number)}</span>
            </div>
          )
        }
        onPress={() =>
          play(
            item.type === 2
              ? {
                  type: "mv",
                  bvid: item.bvid,
                  title: item.title,
                  cover: item.cover,
                  ownerName: item.upper?.name,
                  ownerMid: item.upper?.mid,
                }
              : {
                  type: "audio",
                  sid: item.id,
                  title: item.title,
                  cover: item.cover,
                  ownerName: item.upper?.name,
                  ownerMid: item.upper?.mid,
                },
          )
        }
        onChangeFavSuccess={handleRefresh}
      />
    ),
    [displayMode, handleRefresh, isCollected, isOwn, play],
  );

  // 列表模式使用 flex 布局让 VirtualList 占满剩余高度
  if (displayMode === "list") {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-none transition-all duration-300">
          <Info
            loading={currentLoading}
            type={CollectionType.Favorite}
            cover={infoData.cover}
            attr={infoData.attr}
            title={infoData.title}
            desc={infoData.desc}
            upMid={infoData.upMid}
            upName={infoData.upName}
            mediaCount={infoData.mediaCount}
            collapsed={headerCollapsed}
            afterChangeInfo={handleRefresh}
            onPlayAll={onPlayAll}
            onAddToPlayList={addAllMedia}
          />

          {/* 收起时隐藏搜索过滤器 */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              headerCollapsed ? "max-h-0 opacity-0" : "max-h-20 opacity-100"
            }`}
          >
            <SearchFilter
              keyword={searchParams.keyword}
              order={searchParams.order}
              placeholder="请输入关键词"
              searchIcon="search2"
              orderOptions={[
                { value: "mtime", label: "收藏时间" },
                { value: "view", label: "播放量" },
                { value: "pubtime", label: "投稿时间" },
              ]}
              onKeywordChange={keyword => setSearchParams(prev => ({ ...prev, keyword }))}
              onOrderChange={order => setSearchParams(prev => ({ ...prev, order }))}
              containerClassName="mb-4 flex flex-wrap items-center gap-4"
            />
          </div>
        </div>

        {/* 虚拟列表 */}
        {listModeData?.list?.length > 0 && (
          <div className="min-h-0 flex-1">
            <VirtualList
              scrollerRef={virtualScrollerRef}
              className="h-full"
              data={listModeData.list}
              itemHeight={64}
              overscan={8}
              renderItem={renderMediaItem}
            />
          </div>
        )}

        {/* 加载状态 */}
        {listModeLoading && <div className="text-foreground-500 flex-none py-2 text-center text-sm">加载中...</div>}
        {!listModeHasMore && !listModeLoading && listModeData?.list?.length > 0 && (
          <div className="text-foreground-500 flex-none py-2 text-center text-sm">没有更多了</div>
        )}
      </div>
    );
  }

  // 卡片模式
  return (
    <>
      <Info
        loading={currentLoading}
        type={CollectionType.Favorite}
        cover={infoData.cover}
        attr={infoData.attr}
        title={infoData.title}
        desc={infoData.desc}
        upMid={infoData.upMid}
        upName={infoData.upName}
        mediaCount={infoData.mediaCount}
        afterChangeInfo={handleRefresh}
        onPlayAll={onPlayAll}
        onAddToPlayList={addAllMedia}
      />

      <SearchFilter
        keyword={searchParams.keyword}
        order={searchParams.order}
        placeholder="请输入关键词"
        searchIcon="search2"
        orderOptions={[
          { value: "mtime", label: "收藏时间" },
          { value: "view", label: "播放量" },
          { value: "pubtime", label: "投稿时间" },
        ]}
        onKeywordChange={keyword => setSearchParams(prev => ({ ...prev, keyword }))}
        onOrderChange={order => setSearchParams(prev => ({ ...prev, order }))}
        containerClassName="mb-4 flex flex-wrap items-center gap-4"
      />

      <GridList data={data?.list ?? []} loading={loading} itemKey="id" renderItem={renderMediaItem} />
      {pagination.totalPage > 1 && (
        <div className="flex w-full items-center justify-center py-6">
          <Pagination
            initialPage={1}
            total={pagination.totalPage}
            page={pagination.current}
            onChange={next => getPageData({ current: next, pageSize: 20 })}
          />
        </div>
      )}
    </>
  );
};

export default Favorites;

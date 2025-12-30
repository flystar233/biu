import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";

import { Link, Pagination, Skeleton } from "@heroui/react";
import { useRequest } from "ahooks";

import { CollectionType } from "@/common/constants/collection";
import { formatDuration } from "@/common/utils";
import GridList from "@/components/grid-list";
import MediaItem from "@/components/media-item";
import { type ScrollRefObject } from "@/components/scroll-container";
import SearchFilter from "@/components/search-filter";
import { VirtualList } from "@/components/virtual-list";
import { getUserVideoArchivesList } from "@/service/user-video-archives-list";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";
import { useUser } from "@/store/user";

import Info from "./info";

/** 视频合集 */
const VideoSeries = () => {
  const { id } = useParams();
  const collectedFolder = useUser(state => state.collectedFolder);

  const isCollected = collectedFolder?.some(item => item.id === Number(id));
  const displayMode = useSettings(state => state.displayMode);
  const play = usePlayList(state => state.play);
  const playList = usePlayList(state => state.playList);
  const addList = usePlayList(state => state.addList);

  const [page, setPage] = useState(1);
  const pageSize = 20;

  // 用于避免切换合集时短暂渲染上一个合集的数据
  const [loadedId, setLoadedId] = useState<string | undefined>(undefined);

  // 搜索和过滤参数
  const [searchParams, setSearchParams] = useState({
    keyword: "",
    order: "", // 默认排序（按原顺序显示）
  });

  // 顶部区域收起状态
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const headerCollapsedRef = useRef(false);
  const virtualScrollerRef = useRef<ScrollRefObject>(null);

  const { data, loading, refreshAsync } = useRequest(
    async () => {
      const res = await getUserVideoArchivesList({
        season_id: Number(id),
      });
      return res?.data;
    },
    {
      ready: Boolean(id),
      refreshDeps: [id],
      onSuccess: () => {
        setLoadedId(id);
      },
    },
  );

  useEffect(() => {
    setPage(1);
  }, [id, displayMode, searchParams]);

  // 当合集ID变化时，重置搜索参数和收起状态
  useEffect(() => {
    if (id) {
      setSearchParams({
        keyword: "",
        order: "",
      });
      setHeaderCollapsed(false);
      headerCollapsedRef.current = false;
    }
  }, [id]);

  // 过滤和排序媒体数据
  const filteredMedias = useMemo(() => {
    const medias = data?.medias ?? [];

    // 根据搜索关键词过滤title
    let result = medias;
    if (searchParams.keyword) {
      const lowercaseKeyword = searchParams.keyword.toLowerCase();
      result = medias.filter(item => item.title.toLowerCase().includes(lowercaseKeyword));
    }

    // 根据排序条件排序
    switch (searchParams.order) {
      case "play":
        result = [...result].sort((a, b) => (b.cnt_info?.play || 0) - (a.cnt_info?.play || 0));
        break;
      case "collect":
        result = [...result].sort((a, b) => (b.cnt_info?.collect || 0) - (a.cnt_info?.collect || 0));
        break;
      case "time":
        result = [...result].sort((a, b) => (b.pubtime || 0) - (a.pubtime || 0));
        break;
      default:
        break;
    }

    return result;
  }, [data?.medias, searchParams]);

  // 监听虚拟列表滚动实现顶部区域收起
  useEffect(() => {
    if (displayMode !== "list") return;

    const rootEl = virtualScrollerRef.current?.osInstance()?.elements().viewport as HTMLElement | undefined;
    if (!rootEl) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = rootEl;

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
    };

    rootEl.addEventListener("scroll", handleScroll);
    return () => {
      rootEl.removeEventListener("scroll", handleScroll);
    };
  }, [displayMode, filteredMedias.length]);

  const total = filteredMedias.length;
  const totalPage = useMemo(() => Math.ceil(total / pageSize), [total, pageSize]);
  const pagedMedias = useMemo(() => {
    return filteredMedias.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredMedias, page, pageSize]);

  const showSkeleton = loading || (id && loadedId !== id);

  const onPlayAll = () => {
    if (filteredMedias.length > 0) {
      playList(
        filteredMedias.map(item => ({
          type: "mv",
          bvid: item.bvid,
          title: item.title,
          cover: item.cover,
          ownerMid: item.upper?.mid,
          ownerName: item.upper?.name,
        })),
      );
    }
  };

  const addToPlayList = () => {
    if (filteredMedias.length > 0) {
      addList(
        filteredMedias.map(item => ({
          type: "mv",
          bvid: item.bvid,
          title: item.title,
          cover: item.cover,
          ownerMid: item.upper?.mid,
          ownerName: item.upper?.name,
        })),
      );
    }
  };

  const renderMediaItem = useCallback(
    (item: any) => (
      <MediaItem
        key={item.bvid}
        displayMode={displayMode}
        type="mv"
        bvid={item.bvid}
        aid={String(item.id)}
        title={item.title}
        playCount={item.cnt_info.play}
        cover={item.cover}
        ownerName={item.upper?.name}
        ownerMid={item.upper?.mid}
        duration={item.duration as number}
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
          play({
            type: "mv",
            bvid: item.bvid,
            title: item.title,
            cover: item.cover,
            ownerName: item.upper?.name,
            ownerMid: item.upper?.mid,
          })
        }
      />
    ),
    [displayMode, isCollected, play],
  );

  // 列表模式使用虚拟列表
  if (displayMode === "list") {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-none transition-all duration-300">
          <Info
            loading={loading}
            type={CollectionType.VideoSeries}
            title={data?.info?.title}
            desc={data?.info?.intro}
            cover={data?.info?.cover}
            upMid={data?.info?.upper?.mid}
            upName={data?.info?.upper?.name}
            mediaCount={data?.info?.media_count}
            collapsed={headerCollapsed}
            afterChangeInfo={refreshAsync}
            onPlayAll={onPlayAll}
            onAddToPlayList={addToPlayList}
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
                { value: "", label: "默认排序" },
                { value: "play", label: "播放量" },
                { value: "collect", label: "收藏数" },
                { value: "time", label: "发布时间" },
              ]}
              onKeywordChange={keyword => setSearchParams(prev => ({ ...prev, keyword }))}
              onOrderChange={order => setSearchParams(prev => ({ ...prev, order }))}
              containerClassName="mb-4 flex flex-wrap items-center gap-4"
            />
          </div>
        </div>

        {/* 虚拟列表 */}
        {filteredMedias.length > 0 && (
          <div className="min-h-0 flex-1">
            <VirtualList
              scrollerRef={virtualScrollerRef}
              className="h-full"
              data={filteredMedias}
              itemHeight={64}
              overscan={8}
              renderItem={renderMediaItem}
            />
          </div>
        )}

        {showSkeleton && filteredMedias.length === 0 && (
          <div className="space-y-2">
            {Array.from({ length: 10 }, (_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 卡片模式
  return (
    <>
      <Info
        loading={loading}
        type={CollectionType.VideoSeries}
        title={data?.info?.title}
        desc={data?.info?.intro}
        cover={data?.info?.cover}
        upMid={data?.info?.upper?.mid}
        upName={data?.info?.upper?.name}
        mediaCount={data?.info?.media_count}
        afterChangeInfo={refreshAsync}
        onPlayAll={onPlayAll}
        onAddToPlayList={addToPlayList}
      />

      {/* 搜索和过滤区域 */}
      <SearchFilter
        keyword={searchParams.keyword}
        order={searchParams.order}
        placeholder="请输入关键词"
        searchIcon="search2"
        orderOptions={[
          { value: "", label: "默认排序" },
          { value: "play", label: "播放量" },
          { value: "collect", label: "收藏数" },
          { value: "time", label: "发布时间" },
        ]}
        onKeywordChange={keyword => setSearchParams(prev => ({ ...prev, keyword }))}
        onOrderChange={order => setSearchParams(prev => ({ ...prev, order }))}
        containerClassName="mb-6 flex flex-wrap items-center gap-4"
      />

      <GridList data={pagedMedias} loading={loading} itemKey="bvid" renderItem={renderMediaItem} />
      {totalPage > 1 && (
        <div className="flex w-full items-center justify-center py-6">
          <Pagination initialPage={1} page={page} total={totalPage} onChange={setPage} />
        </div>
      )}
    </>
  );
};

export default VideoSeries;

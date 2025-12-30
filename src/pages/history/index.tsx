import { useEffect, useRef, useState } from "react";

import { addToast, Button, Link } from "@heroui/react";
import { RiRefreshLine } from "@remixicon/react";
import moment from "moment";

import { formatDuration } from "@/common/utils";
import Empty from "@/components/empty";
import GridList from "@/components/grid-list";
import MediaItem from "@/components/media-item";
import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import { VirtualList } from "@/components/virtual-list";
import {
  getWebInterfaceHistoryCursor,
  type HistoryBusinessType,
  type HistoryListItem,
} from "@/service/web-interface-history-cursor";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

const HISTORY_PAGE_SIZE = 30;
const LIST_ITEM_HEIGHT = 64;

const History = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [list, setList] = useState<HistoryListItem[]>([]);
  const [cursor, setCursor] = useState<{ max: number; business: HistoryBusinessType | ""; view_at: number } | null>(
    null,
  );
  const [hasMore, setHasMore] = useState(true);
  const play = usePlayList(s => s.play);
  const displayMode = useSettings(state => state.displayMode);
  const scrollerRef = useRef<ScrollRefObject>(null);
  const virtualScrollerRef = useRef<ScrollRefObject>(null);

  const fetchHistory = async (isLoadMore = false, resetCursor = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      }
      // 首次加载时 initialLoading 已经在 useEffect 中设置为 true，刷新时不设置

      const currentCursor = resetCursor ? null : cursor;
      const res = await getWebInterfaceHistoryCursor({
        type: "archive",
        ps: HISTORY_PAGE_SIZE,
        max: currentCursor ? currentCursor.max : 0,
        business: currentCursor?.business || undefined,
        view_at: currentCursor ? currentCursor.view_at : 0,
      });

      if (res.code !== 0) {
        if (res.code === -101) {
          throw new Error("请先登录");
        }
        throw new Error(res.message || "获取历史记录失败");
      }

      const newList = res.data?.list || [];
      if (isLoadMore) {
        setList(prev => [...prev, ...newList]);
      } else {
        setList(newList);
      }

      if (newList.length > 0 && res.data.cursor) {
        setCursor({
          max: res.data.cursor.max,
          business: res.data.cursor.business || "",
          view_at: res.data.cursor.view_at,
        });
      }
      setHasMore(!!(newList.length > 0 && res.data.cursor));
    } catch (error: any) {
      addToast({
        title: error?.message || "获取历史记录失败",
        color: "danger",
      });
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setInitialLoading(false);
      }
    }
  };

  const handleLoadMore = () => {
    fetchHistory(true);
  };

  const handleRefresh = () => {
    setCursor(null);
    setHasMore(true);
    fetchHistory(false, true);
  };

  useEffect(() => {
    const initData = async () => {
      setInitialLoading(true);
      await fetchHistory(false);
    };
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 列表模式下的无限滚动
  useEffect(() => {
    if (displayMode !== "list") return;

    const rootEl = virtualScrollerRef.current?.osInstance()?.elements().viewport as HTMLElement | undefined;
    if (!rootEl) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = rootEl;
      // 距离底部 200px 时加载更多
      if (scrollHeight - scrollTop - clientHeight < 200) {
        if (hasMore && !loadingMore && !initialLoading) {
          handleLoadMore();
        }
      }
    };

    rootEl.addEventListener("scroll", handleScroll);
    return () => {
      rootEl.removeEventListener("scroll", handleScroll);
    };
  }, [displayMode, hasMore, loadingMore, initialLoading]);

  const handlePlay = (item: HistoryListItem) => {
    if (item.history.bvid) {
      play({
        type: "mv",
        bvid: item.history.bvid,
        title: item.title,
        cover: item.cover,
        ownerName: item.author_name,
        ownerMid: item.author_mid,
      });
    } else {
      addToast({
        title: "无法播放此类型内容",
        color: "warning",
      });
    }
  };

  // 提取MediaItem公共渲染函数，避免重复代码
  const renderMediaItem = (item: HistoryListItem) => {
    const commonProps = {
      displayMode,
      type: "mv" as const, // 音频播放不会出现在历史记录中
      bvid: item.history.bvid || "",
      aid: String(item.history.oid),
      title: item.title,
      cover: item.cover,
      ownerName: item.author_name,
      ownerMid: item.author_mid,
      onPress: () => handlePlay(item),
    };

    // 卡片模式下添加额外属性
    if (displayMode === "card") {
      return (
        <MediaItem
          key={`${item.history.oid}-${item.view_at}`}
          {...commonProps}
          coverHeight={200}
          footer={
            <div className="flex w-full flex-col space-y-1 text-sm">
              <div className="text-foreground-500 flex w-full items-center justify-between text-sm">
                {item.author_mid ? (
                  <Link href={`/user/${item.author_mid}`} className="text-foreground-500 text-sm hover:underline">
                    {item.author_name}
                  </Link>
                ) : (
                  <span>{item.author_name}</span>
                )}
                {item.duration && <span>{formatDuration(item.duration)}</span>}
              </div>
              <div className="text-foreground-400 flex w-full items-center justify-between text-xs">
                <span>{moment.unix(item.view_at).format("YYYY-MM-DD HH:mm")}</span>
                {item.progress !== undefined && item.duration && (
                  <span>
                    观看进度: {formatDuration(item.progress)} / {formatDuration(item.duration)}
                  </span>
                )}
              </div>
            </div>
          }
        />
      );
    }

    // 列表模式下直接返回
    return <MediaItem {...commonProps} />;
  };

  // 列表模式使用虚拟列表
  if (displayMode === "list") {
    return (
      <div className="flex h-full w-full flex-col">
        <div className="flex flex-none items-center justify-between p-4 pb-0">
          <h1>历史记录</h1>
          <Button isIconOnly variant="light" size="sm" onPress={handleRefresh}>
            <RiRefreshLine size={18} />
          </Button>
        </div>

        {/* 初始加载骨架屏 */}
        {initialLoading && (
          <div className="space-y-4 p-4">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div key={idx} className="flex space-x-4">
                <div className="h-12 w-12 animate-pulse rounded bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 空数据 */}
        {!initialLoading && list.length === 0 && <Empty className="min-h-[40vh]" />}

        {/* 虚拟列表 */}
        {!initialLoading && list.length > 0 && (
          <div className="min-h-0 flex-1">
            <VirtualList
              scrollerRef={virtualScrollerRef}
              className="h-full px-4"
              data={list}
              itemHeight={LIST_ITEM_HEIGHT}
              overscan={8}
              renderItem={renderMediaItem}
            />
          </div>
        )}

        {/* 加载更多按钮 */}
        {hasMore && !initialLoading && (
          <div className="flex w-full flex-none items-center justify-center py-6">
            <Button
              variant="flat"
              color="primary"
              isLoading={loadingMore}
              onPress={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? "加载中..." : "加载更多"}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // 卡片模式
  return (
    <ScrollContainer ref={scrollerRef} className="h-full w-full p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1>历史记录</h1>
        <Button isIconOnly variant="light" size="sm" onPress={handleRefresh}>
          <RiRefreshLine size={18} />
        </Button>
      </div>
      <GridList
        loading={initialLoading}
        data={list}
        itemKey={item => `${item.history.oid}-${item.view_at}`}
        renderItem={renderMediaItem}
      />
      {hasMore && (
        <div className="flex w-full items-center justify-center py-6">
          <Button
            variant="flat"
            color="primary"
            isLoading={loadingMore}
            onPress={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "加载中..." : "加载更多"}
          </Button>
        </div>
      )}
    </ScrollContainer>
  );
};

export default History;

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Alert, Button, Spinner, addToast } from "@heroui/react";

import Empty from "@/components/empty";
import ImageCard from "@/components/image-card";
import MediaItem from "@/components/media-item";
import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import { VirtualList } from "@/components/virtual-list";
import { getMusicComprehensiveWebRank, type Data as MusicItem } from "@/service/music-comprehensive-web-rank";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

const PAGE_SIZE = 20;
const LIST_ITEM_HEIGHT = 64;

const MusicRecommend = () => {
  const scrollerRef = useRef<ScrollRefObject>(null);
  const virtualScrollerRef = useRef<ScrollRefObject>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [list, setList] = useState<MusicItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const play = usePlayList(state => state.play);
  const displayMode = useSettings(state => state.displayMode);

  const deDupConcat = useCallback((prev: MusicItem[], next: MusicItem[]) => {
    const seen = new Set(prev.map(i => i.id));
    const merged = [...prev];
    for (const item of next) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push(item);
      }
    }
    return merged;
  }, []);

  const fetchPage = useCallback(
    async (pn: number) => {
      setError(null);
      const res = await getMusicComprehensiveWebRank({ pn, ps: PAGE_SIZE, web_location: "333.1351" });
      const items = res?.data?.list ?? [];
      setHasMore(items.length === PAGE_SIZE);
      setList(prev => deDupConcat(prev, items));
    },
    [deDupConcat],
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      await fetchPage(nextPage);
      setPage(nextPage);
    } catch (e: any) {
      const msg = e?.message || "加载更多失败";
      setError(msg);
      addToast({ title: msg, color: "danger" });
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore, fetchPage]);

  const retryInitial = useCallback(async () => {
    setInitialLoading(true);
    setList([]);
    setPage(1);
    try {
      await fetchPage(1);
    } catch (e: any) {
      const msg = e?.message || "加载失败";
      setError(msg);
      addToast({ title: msg, color: "danger" });
    } finally {
      setInitialLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    // 首次加载
    retryInitial();
  }, [retryInitial]);

  // 卡片模式下的无限滚动
  useEffect(() => {
    if (displayMode !== "card") return;

    const rootEl = scrollerRef.current?.osInstance()?.elements().viewport as HTMLElement | undefined;
    if (!rootEl) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !loadingMore && !initialLoading && !error) {
          loadMore();
        }
      },
      { root: rootEl, rootMargin: "0px 0px 200px 0px", threshold: 0.1 },
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observerRef.current.observe(sentinel);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [displayMode, hasMore, loadingMore, initialLoading, error, loadMore]);

  // 列表模式下的无限滚动
  useEffect(() => {
    if (displayMode !== "list") return;

    const rootEl = virtualScrollerRef.current?.osInstance()?.elements().viewport as HTMLElement | undefined;
    if (!rootEl) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = rootEl;
      // 距离底部 200px 时加载更多
      if (scrollHeight - scrollTop - clientHeight < 200) {
        if (hasMore && !loadingMore && !initialLoading && !error) {
          loadMore();
        }
      }
    };

    rootEl.addEventListener("scroll", handleScroll);
    return () => {
      rootEl.removeEventListener("scroll", handleScroll);
    };
  }, [displayMode, hasMore, loadingMore, initialLoading, error, loadMore]);

  const renderMediaItem = (item: MusicItem) => (
    <MediaItem
      displayMode={displayMode}
      type="mv"
      bvid={item.bvid}
      aid={item.aid || item.related_archive.aid}
      key={item.id}
      cover={item.cover}
      title={item.music_title}
      ownerName={item.author}
      ownerMid={item.related_archive.uid}
      playCount={item.related_archive.vv_count}
      footer={
        displayMode === "card" && <div className="w-full truncate text-left text-sm text-zinc-400">{item.author}</div>
      }
      onPress={() =>
        play({
          type: "mv",
          bvid: item.bvid,
          title: item.music_title,
          cover: item.cover,
          ownerName: item.author,
          ownerMid: item.related_archive.uid,
        })
      }
    />
  );

  const isEmpty = useMemo(() => !initialLoading && list.length === 0 && !error, [initialLoading, list, error]);

  // 列表模式使用虚拟列表
  if (displayMode === "list") {
    return (
      <div className="flex h-full w-full flex-col">
        <div className="flex-none p-4 pb-0">
          <h1 className="mb-4">音乐推荐</h1>
        </div>

        {/* 错误提示 */}
        {error && list.length === 0 && (
          <div className="flex h-[40vh] flex-col items-center justify-center space-y-3 p-4">
            <Alert color="danger" title="加载失败">
              出错了：{error}
            </Alert>
            <Button color="primary" onPress={retryInitial}>
              重试
            </Button>
          </div>
        )}

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
        {isEmpty && <Empty className="min-h-[40vh]" />}

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

        {/* 加载更多提示 */}
        {loadingMore && (
          <div className="text-default-500 flex flex-none items-center justify-center space-x-2 py-4 text-sm">
            <Spinner size="sm" />
            <span>加载更多中...</span>
          </div>
        )}
        {!hasMore && list.length > 0 && (
          <div className="text-default-400 flex-none py-4 text-center text-sm">没有更多了</div>
        )}
      </div>
    );
  }

  // 卡片模式
  return (
    <ScrollContainer ref={scrollerRef} className="h-full w-full p-4">
      <h1 className="mb-4">音乐推荐</h1>
      <div className="w-full">
        {/* 错误提示（整页） */}
        {error && list.length === 0 && (
          <div className="flex h-[40vh] flex-col items-center justify-center space-y-3">
            <Alert color="danger" title="加载失败">
              出错了：{error}
            </Alert>
            <Button color="primary" onPress={retryInitial}>
              重试
            </Button>
          </div>
        )}

        {/* 初始加载骨架屏 */}
        {initialLoading && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
            {Array.from({ length: 10 }).map((_, idx) => (
              <ImageCard.Skeleton key={idx} />
            ))}
          </div>
        )}

        {/* 空数据 */}
        {isEmpty && <Empty className="min-h-[40vh]" />}

        {/* 数据网格 */}
        {!initialLoading && list.length > 0 && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
            {list.map(renderMediaItem)}
          </div>
        )}

        {/* 加载更多/无更多 提示区 & 作为 sentinel */}
        <div ref={sentinelRef} className="flex w-full items-center justify-center py-6">
          {loadingMore && (
            <div className="text-default-500 flex items-center space-x-2 text-sm">
              <Spinner size="sm" />
              <span>加载更多中...</span>
            </div>
          )}
          {!hasMore && list.length > 0 && <div className="text-default-400 text-sm">没有更多了</div>}
        </div>
      </div>
    </ScrollContainer>
  );
};

export default MusicRecommend;

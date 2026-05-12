import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { addToast, Spinner, Tab, Tabs } from "@heroui/react";
import { useSize } from "ahooks";

import ScrollContainer from "@/components/scroll-container";
import { getMusicComprehensiveWebRank, type Data as MusicItem } from "@/service/music-comprehensive-web-rank";
import { usePlayList } from "@/store/play-list";

import type { MusicGridItemData } from "./grid-item";

import MusicGridItem from "./grid-item";
import NewMusicTop from "./new-music-top";

const PAGE_SIZE = 20;

type TabKey = "rank" | "new";

interface RecommendItem extends MusicGridItemData {
  id: number;
  aid?: number;
  bvid?: string;
  authorMid?: number;
  duration?: number;
}

const normalizeRankItem = (item: MusicItem): RecommendItem => {
  const archive = item.related_archive;
  return {
    id: item.id,
    key: String(item.id),
    aid: Number(item.aid) || undefined,
    bvid: archive?.bvid || item.bvid,
    title: archive?.title || item.music_title,
    cover: archive?.cover || item.cover,
    author: archive?.username || item.author,
    authorMid: archive?.uid,
    playCount: archive?.vv_count,
    duration: archive?.duration,
  };
};

const MusicRecommend = () => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentSize = useSize(contentRef);
  const contentWidth = contentSize?.width || 0;

  const [list, setList] = useState<RecommendItem[]>([]);
  const [, setHasMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1);
  const [activeTab, setActiveTab] = useState<TabKey>("rank");
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(false);

  const columns = useMemo(() => {
    if (!contentWidth) return 2;
    if (contentWidth >= 1536) return 6;
    if (contentWidth >= 1280) return 5;
    if (contentWidth >= 1024) return 4;
    if (contentWidth >= 768) return 3;
    return 2;
  }, [contentWidth]);

  const fetchPage = useCallback(async (pn: number = 1) => {
    const res = await getMusicComprehensiveWebRank({ pn, ps: PAGE_SIZE, web_location: "333.1351" });
    const items = res?.data?.list ?? [];
    if (res.code === 0) {
      const normalized = items.map(normalizeRankItem);
      setList(prev => (pn === 1 ? normalized : [...prev, ...normalized]));
      const more = items.length === PAGE_SIZE;
      setHasMore(more);
      hasMoreRef.current = more;
    } else {
      if (pn === 1) {
        setList([]);
      }
      setHasMore(false);
      hasMoreRef.current = false;
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (initialLoading || loadingMoreRef.current || !hasMoreRef.current) return;
    try {
      loadingMoreRef.current = true;
      setLoadingMore(true);
      pageRef.current += 1;
      await fetchPage(pageRef.current);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [initialLoading, fetchPage]);

  const init = useCallback(async () => {
    try {
      pageRef.current = 1;
      setHasMore(true);
      hasMoreRef.current = true;
      loadingMoreRef.current = false;
      setLoadingMore(false);
      await fetchPage(1);
    } finally {
      setInitialLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    setInitialLoading(true);
    init();
  }, [init]);

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const handlePlay = useCallback((item: MusicGridItemData) => {
    const recItem = item as RecommendItem;
    if (!recItem.bvid) {
      addToast({ title: "暂无可播放内容", color: "warning" });
      return;
    }
    usePlayList.getState().play({
      type: "mv",
      bvid: recItem.bvid,
      title: recItem.title,
      cover: recItem.cover,
      ownerName: recItem.author,
      ownerMid: recItem.authorMid,
    });
  }, []);

  return (
    <ScrollContainer enableBackToTop className="h-full w-full px-4">
      <div className="mb-2 flex items-center justify-between">
        <Tabs
          variant="solid"
          size="lg"
          radius="md"
          classNames={{ cursor: "rounded-medium" }}
          selectedKey={activeTab}
          onSelectionChange={key => setActiveTab(key as TabKey)}
        >
          <Tab key="rank" title="推荐音乐" />
          <Tab key="new" title="新歌速递" />
        </Tabs>
      </div>
      <div ref={contentRef}>
        <div style={{ display: activeTab === "rank" ? "block" : "none" }}>
          {initialLoading && list.length === 0 ? (
            <div className="flex h-[40vh] items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : list.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center">
              <span className="text-foreground-500">暂无数据</span>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                gap: "16px",
              }}
            >
              {list.map(item => (
                <MusicGridItem key={item.key} item={item} onPlay={handlePlay} />
              ))}
            </div>
          )}
          <div ref={sentinelRef} className="flex h-16 items-center justify-center">
            {loadingMore && <Spinner size="sm" />}
          </div>
        </div>
        <div style={{ display: activeTab === "new" ? "block" : "none" }}>
          <NewMusicTop columns={columns} />
        </div>
      </div>
    </ScrollContainer>
  );
};

export default MusicRecommend;

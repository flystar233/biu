import React, { useEffect, useMemo, useRef, useState } from "react";

import { Card, Spinner, addToast } from "@heroui/react";
import { useSize } from "ahooks";
import log from "electron-log/renderer";

import { getNewMusic } from "@/service/web-interface-new-music";
import { getNewMusicBanner } from "@/service/web-interface-new-music-banner";
import { usePlayList } from "@/store/play-list";

import MusicGridItem, { type MusicGridItemData } from "./grid-item";

type UnifiedItem = MusicGridItemData & {
  bvid?: string;
  jump_url?: string;
  wish_count?: number;
  playCount?: number;
};

const NewMusicTop = () => {
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const wrapperSize = useSize(wrapperRef);
  const containerWidth = wrapperSize?.width || 0;

  const columns = useMemo(() => {
    if (!containerWidth) return 2;
    if (containerWidth >= 1536) return 6;
    if (containerWidth >= 1280) return 5;
    if (containerWidth >= 1024) return 4;
    if (containerWidth >= 768) return 3;
    return 2;
  }, [containerWidth]);

  const handlePlay = React.useCallback((item: MusicGridItemData) => {
    const uniItem = item as UnifiedItem;
    usePlayList
      .getState()
      .play({
        type: "mv",
        bvid: uniItem.bvid,
        title: uniItem.title,
        cover: uniItem.cover,
        ownerName: uniItem.author,
      })
      .catch(error => {
        log.error("[new-music-top] play error", error);
        addToast({ title: "播放失败", color: "danger" });
      });
  }, []);

  useEffect(() => {
    const fetchNewMusic = async () => {
      try {
        const [bannerRes, listRes] = await Promise.all([getNewMusicBanner(), getNewMusic()]);
        const bannerList = bannerRes?.data?.list ?? [];
        const musicList = listRes?.data?.list ?? [];

        const normalizedBanner: UnifiedItem[] = bannerList.map(b => ({
          key: b.bvid || b.music_id || b.jump_url || (b.cover ? `cover:${b.cover}` : `banner:${Math.random()}`),
          title: b.archive_title || "",
          cover: b.cover,
          bvid: b.bvid,
          jump_url: b.jump_url,
          author: b.author,
          date: b.publish_time ? String(b.publish_time).slice(0, 10) : undefined,
        }));

        const normalizedMusic: UnifiedItem[] = musicList.map(m => ({
          key:
            m.bvid ||
            (typeof m.id === "number" ? String(m.id) : "") ||
            m.music_id ||
            m.jump_url ||
            (m.cover ? `cover:${m.cover}` : `music:${Math.random()}`),
          title: m.music_title || "",
          cover: m.cover,
          bvid: m.bvid,
          jump_url: m.jump_url,
          playCount: m.total_vv,
          wish_count: m.wish_count,
          author: m.author,
          date: m.publish_time || undefined,
        }));

        const seen = new Set<string>();
        const merged: UnifiedItem[] = [];
        [...normalizedBanner, ...normalizedMusic].forEach(it => {
          const k = it.key || Math.random().toString();
          if (!seen.has(k)) {
            seen.add(k);
            merged.push(it);
          }
        });

        setItems(merged);
      } catch (error) {
        log.error("[new-music-top] fetchNewMusic error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNewMusic();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: "16px",
      }}
    >
      {items.length === 0 ? (
        <Card className="rounded-medium col-span-full flex h-[200px] items-center justify-center">
          <span className="text-foreground-500">暂无数据</span>
        </Card>
      ) : (
        items.map(item => <MusicGridItem key={item.key} item={item} onPlay={handlePlay} />)
      )}
    </div>
  );
};

export default NewMusicTop;

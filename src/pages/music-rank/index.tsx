import { useCallback, useRef } from "react";

import { Skeleton } from "@heroui/react";
import { useRequest } from "ahooks";

import GridList from "@/components/grid-list";
import MediaItem from "@/components/media-item";
import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import { VirtualList } from "@/components/virtual-list";
import { getMusicHotRank } from "@/service/music-hot-rank";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

const MusicRank = () => {
  const play = usePlayList(s => s.play);
  const displayMode = useSettings(state => state.displayMode);
  const virtualScrollerRef = useRef<ScrollRefObject>(null);

  const { loading, data } = useRequest(async () => {
    const res = await getMusicHotRank({
      plat: 2,
      web_location: "333.1351",
    });

    return res?.data?.list || [];
  });

  const renderMediaItem = useCallback(
    (item: any) => (
      <MediaItem
        key={item.bvid}
        displayMode={displayMode}
        type="mv"
        bvid={item.bvid}
        aid={item.aid}
        title={item.music_title}
        cover={item.cover}
        ownerName={item.author}
        playCount={item.total_vv}
        footer={
          displayMode === "card" && <div className="w-full truncate text-left text-sm text-zinc-400">{item.author}</div>
        }
        onPress={() =>
          play({
            type: "mv",
            bvid: item.bvid,
            title: item.music_title,
          })
        }
      />
    ),
    [displayMode, play],
  );

  // 列表模式使用虚拟列表
  if (displayMode === "list") {
    return (
      <div className="flex h-full w-full flex-col">
        <div className="flex-none p-4 pb-0">
          <h1 className="mb-4">热歌精选</h1>
        </div>

        {/* 加载骨架屏 */}
        {loading && (
          <div className="space-y-4 p-4">
            {Array.from({ length: 10 }).map((_, idx) => (
              <Skeleton key={idx} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        )}

        {/* 虚拟列表 */}
        {!loading && data && data.length > 0 && (
          <div className="min-h-0 flex-1">
            <VirtualList
              scrollerRef={virtualScrollerRef}
              className="h-full px-4"
              data={data}
              itemHeight={64}
              overscan={8}
              renderItem={renderMediaItem}
            />
          </div>
        )}
      </div>
    );
  }

  // 卡片模式
  return (
    <ScrollContainer className="h-full p-4">
      <h1 className="mb-4">热歌精选</h1>
      <GridList
        data={data}
        loading={loading}
        skeletonCoverHeight={240}
        enablePagination
        itemKey="bvid"
        renderItem={renderMediaItem}
      />
    </ScrollContainer>
  );
};

export default MusicRank;

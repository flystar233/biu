import React from "react";

import { RiMusic2Line } from "@remixicon/react";

import { formatNumber } from "@/common/utils/number";
import Image from "@/components/image";

export interface MusicGridItemData {
  key: string;
  title: string;
  cover?: string;
  author?: string;
  playCount?: number;
  date?: string;
}

interface MusicGridItemProps {
  item: MusicGridItemData;
  onPlay: (item: MusicGridItemData) => void;
}

const MusicGridItem = React.memo(({ item, onPlay }: MusicGridItemProps) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onPlay(item)}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPlay(item);
        }
      }}
      className="group w-full cursor-pointer select-none"
    >
      <div className="rounded-medium relative aspect-video overflow-hidden transition-transform duration-300 ease-out group-hover:scale-[1.03]">
        <Image
          radius="md"
          removeWrapper
          src={item.cover || ""}
          width="100%"
          height="100%"
          params="672w_378h_1c.avif"
          emptyPlaceholder={<RiMusic2Line />}
          className="rounded-medium shadow-md"
        />
        {typeof item.playCount === "number" && (
          <div className="absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/80 via-black/40 to-transparent p-2 text-white">
            <div className="line-clamp-1 text-xs">{`${formatNumber(item.playCount ?? 0)}播放`}</div>
          </div>
        )}
      </div>
      <div className="mt-2 text-left">
        <div className="group-hover:text-primary line-clamp-1 text-base font-medium transition-colors">
          {item.title}
        </div>
        {(item.author || item.date) && (
          <div className="text-foreground-500 group-hover:text-primary mt-1 text-xs transition-colors">
            {`${item.author ?? ""}${item.author && item.date ? " · " : ""}${item.date ?? ""}`}
          </div>
        )}
      </div>
    </div>
  );
});

export default MusicGridItem;

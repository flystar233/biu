import React from "react";

import { Image } from "@heroui/react";
import { RiPauseFill, RiPlayFill } from "@remixicon/react";
import clx from "classnames";

import { formatDuration } from "@/common/utils";
import { usePlayList, type PlayData } from "@/store/play-list";

import Menus from "./menu";
import { getDisplayCover, getDisplayTitle } from "./utils";

interface Props {
  data: PlayData;
  isActive: boolean;
}

const ListItem = ({ data, isActive }: Props) => {
  const playListItem = usePlayList(state => state.playListItem);
  const isAudioPlaying = usePlayList(s => s.isPlaying);
  const togglePlay = usePlayList(s => s.togglePlay);

  const handlePlay = () => {
    playListItem(data.id);
  };

  const handleCoverClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive) {
      togglePlay();
    } else {
      handlePlay();
    }
  };

  return (
    <div
      key={data.id}
      onDoubleClick={handlePlay}
      className={clx(
        "group hover:bg-default/40 flex h-auto min-h-auto w-full min-w-auto cursor-pointer items-center justify-between space-y-2 rounded-md p-2 transition-colors duration-150",
        { "text-primary bg-primary/20": isActive },
      )}
    >
      <div className="m-0 flex min-w-0 flex-1 items-center">
        <div className="relative h-12 w-12 flex-none cursor-pointer" onClick={handleCoverClick}>
          <Image
            removeWrapper
            radius="md"
            src={getDisplayCover(data)}
            alt={getDisplayTitle(data)}
            width="100%"
            height="100%"
            className="m-0 object-cover"
          />
          {isActive ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-md bg-[rgba(0,0,0,0.35)] opacity-0 group-hover:opacity-100">
              {isAudioPlaying ? (
                <RiPauseFill size={20} className="text-white transition-transform duration-200 group-hover:scale-110" />
              ) : (
                <RiPlayFill size={20} className="text-white transition-transform duration-200 group-hover:scale-110" />
              )}
            </div>
          ) : (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-md bg-[rgba(0,0,0,0.35)] opacity-0 group-hover:opacity-100">
              <RiPlayFill size={20} className="text-white transition-transform duration-200 group-hover:scale-110" />
            </div>
          )}
        </div>
        <div className="ml-2 flex min-w-0 flex-auto flex-col items-start space-y-1">
          <span className="w-full min-w-0 truncate text-base">{getDisplayTitle(data)}</span>
        </div>
        <Menus data={data} />
        {Boolean(data.duration) && (
          <span className="text-foreground-500 ml-2 flex-none shrink-0 text-right text-sm whitespace-nowrap tabular-nums">
            {formatDuration(data.duration as number)}
          </span>
        )}
      </div>
    </div>
  );
};

export default ListItem;

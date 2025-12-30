import { useNavigate } from "react-router";

import { Image } from "@heroui/react";
import { RiPauseFill, RiPlayFill } from "@remixicon/react";
import clx from "classnames";

import { formatBiliImageUrl } from "@/common/utils/url";
import { type PlayData, usePlayList } from "@/store/play-list";

import Menus from "./menu";

interface Props {
  data: PlayData;
  isPlaying?: boolean;
  onClose: VoidFunction;
  onPress?: VoidFunction;
}

const ListItem = ({ data, isPlaying, onPress, onClose }: Props) => {
  const navigate = useNavigate();
  const isAudioPlaying = usePlayList(s => s.isPlaying);
  const togglePlay = usePlayList(s => s.togglePlay);

  const handleCoverClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      togglePlay();
    } else {
      onPress?.();
    }
  };

  return (
    <div
      key={data.id}
      onDoubleClick={onPress}
      className={clx(
        "group hover:bg-default/40 flex h-auto min-h-auto w-full min-w-auto cursor-pointer items-center justify-between space-y-2 rounded-md p-2 transition-colors duration-150",
        { "text-primary bg-primary/20": isPlaying },
      )}
    >
      <div className="m-0 flex min-w-0 flex-1 items-center">
        <div className="relative h-12 w-12 flex-none cursor-pointer" onClick={handleCoverClick}>
          <Image
            removeWrapper
            radius="md"
            loading="lazy"
            src={formatBiliImageUrl(data.cover, 96)}
            alt={data.title}
            width="100%"
            height="100%"
            className="object-cover"
          />
          {isPlaying ? (
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
          <span className="w-full min-w-0 truncate text-base">{data.title}</span>
          <span
            className={clx("text-foreground-500 w-fit truncate text-sm hover:underline", {
              "cursor-pointer": Boolean(data?.ownerMid),
            })}
            onClick={e => {
              e.stopPropagation();
              if (!data?.ownerMid) return;
              navigate(`/user/${data?.ownerMid}`);
              onClose();
            }}
          >
            {data?.ownerName || "未知"}
          </span>
        </div>
        <Menus data={data} />
      </div>
    </div>
  );
};

export default ListItem;

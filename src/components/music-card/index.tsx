import { memo, useMemo, type ReactNode } from "react";

import { Link } from "@heroui/react";
import { RiUserLine, RiYoutubeLine } from "@remixicon/react";

import { formatNumber } from "@/common/utils/number";
import { formatDuration, formatSecondsToDate } from "@/common/utils/time";
import ContextMenu, { type ContextMenuItem } from "@/components/context-menu";
import Image from "@/components/image";

export interface MusicCardProps {
  cover: string;
  title: ReactNode;
  playCount?: number;
  duration?: number | string;
  ownerName?: string;
  ownerMid?: number;
  time?: number;
  menus: ContextMenuItem[];
  onMenuAction: (key: string) => void;
  onPress?: () => void;
}

const MusicCard = memo(
  ({ title, cover, playCount, duration, ownerName, ownerMid, time, menus, onMenuAction, onPress }: MusicCardProps) => {
    const durationText = useMemo(() => {
      if (typeof duration === "number") return formatDuration(duration);
      if (typeof duration === "string") return duration;
      return undefined;
    }, [duration]);

    return (
      <div onClick={onPress} className="group rounded-medium flex w-full cursor-pointer flex-col">
        <ContextMenu items={menus} onAction={onMenuAction}>
          <div className="flex flex-col">
            <div className="rounded-medium relative aspect-video overflow-hidden transition-transform duration-300 ease-out group-hover:scale-[1.03]">
              <Image radius="md" removeWrapper src={cover} width="100%" height="100%" params="672w_378h_1c.avif" />
              {(playCount ?? 0) > 0 || durationText ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-center justify-between bg-linear-to-t from-black/90 via-black/60 to-transparent p-2 text-xs text-white">
                  {(playCount ?? 0) > 0 && (
                    <div className="flex items-center gap-1">
                      <RiYoutubeLine size={14} />
                      <span>{formatNumber(playCount)}</span>
                    </div>
                  )}
                  {durationText && <span className="tabular-nums">{durationText}</span>}
                </div>
              ) : null}
            </div>
            <div className="group-hover:text-primary mt-2 line-clamp-2 w-full overflow-hidden wrap-break-word text-ellipsis transition-colors">
              {title}
            </div>
          </div>
        </ContextMenu>
        {ownerName && (
          <div className="text-foreground-500 mt-1 flex items-center justify-between text-sm leading-none">
            {ownerMid ? (
              <Link
                href={`/user/${ownerMid}`}
                className="text-foreground-500 flex min-w-0 items-center gap-1 text-sm hover:underline"
              >
                <RiUserLine size={14} className="shrink-0" />
                <span className="truncate">{ownerName}</span>
              </Link>
            ) : (
              <span className="flex min-w-0 items-center gap-1 text-sm">
                <RiUserLine size={14} className="shrink-0" />
                <span className="truncate">{ownerName}</span>
              </span>
            )}
            {time && <span className="text-tiny text-foreground-500 shrink-0">{formatSecondsToDate(time)}</span>}
          </div>
        )}
      </div>
    );
  },
);

export default MusicCard;

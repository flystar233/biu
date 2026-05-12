import React, { useState } from "react";

import { addToast, Tooltip, Listbox, ListboxItem } from "@heroui/react";
import { RiDownload2Fill, RiFileMusicLine, RiFileVideoLine } from "@remixicon/react";

import AsyncButton from "@/components/async-button";
import IconButton from "@/components/icon-button";
import { usePlayList } from "@/store/play-list";

const MusicDownloadButton = () => {
  const list = usePlayList(s => s.list);
  const playId = usePlayList(s => s.playId);
  const playItem = list.find(item => item.id === playId);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const downloadAudio = async () => {
    await window.electron.addMediaDownloadTask({
      outputFileType: "audio",
      title: playItem?.pageTitle || playItem?.title || `audio-${Date.now()}`,
      cover: playItem?.pageCover || playItem?.cover,
      duration: playItem?.duration,
      bvid: playItem?.bvid,
      cid: playItem?.cid,
      sid: playItem?.type === "audio" ? playItem?.sid : undefined,
    });

    addToast({
      title: "已添加下载任务",
      color: "success",
    });
  };

  const downloadVideo = async () => {
    await window.electron.addMediaDownloadTask({
      outputFileType: "video",
      title: playItem?.pageTitle || playItem?.title || `video-${Date.now()}`,
      cover: playItem?.pageCover || playItem?.cover,
      duration: playItem?.duration,
      bvid: playItem?.bvid,
      cid: playItem?.cid,
    });

    addToast({
      title: "已添加下载任务",
      color: "success",
    });
  };

  if (playItem?.sid) {
    return (
      <AsyncButton isIconOnly size="sm" variant="light" className="hover:text-primary" onPress={downloadAudio}>
        <RiDownload2Fill size={18} />
      </AsyncButton>
    );
  }

  return (
    <Tooltip
      triggerScaleOnOpen={false}
      isOpen={isTooltipOpen}
      onOpenChange={setIsTooltipOpen}
      disableAnimation
      radius="md"
      placement="top"
      closeDelay={500}
      showArrow={false}
      classNames={{
        content: "p-2",
      }}
      content={
        <Listbox
          aria-label="下载选项"
          selectionMode="none"
          onAction={key => {
            if (key === "audio") {
              void downloadAudio();
            } else if (key === "video") {
              void downloadVideo();
            }
            setIsTooltipOpen(false);
          }}
        >
          <ListboxItem
            className="rounded-medium"
            key="audio"
            textValue="下载音频"
            startContent={<RiFileMusicLine size={16} />}
          >
            下载音频
          </ListboxItem>
          <ListboxItem
            className="rounded-medium"
            key="video"
            textValue="下载视频"
            startContent={<RiFileVideoLine size={16} />}
          >
            下载视频
          </ListboxItem>
        </Listbox>
      }
    >
      <IconButton>
        <RiDownload2Fill size={18} />
      </IconButton>
    </Tooltip>
  );
};

export default MusicDownloadButton;

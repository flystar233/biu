import { useEffect, useState } from "react";

import { addToast, Button } from "@heroui/react";
import { RiDeleteBinLine, RiExternalLinkLine, RiFolderLine } from "@remixicon/react";
import { filesize } from "filesize";

import { formatDuration, formatMillisecond } from "@/common/utils/time";
import { getBiliVideoLink } from "@/common/utils/url";
import Empty from "@/components/empty";
import Image from "@/components/image";
import ScrollContainer from "@/components/scroll-container";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import DownloadActions from "./actions";
import DownloadProgress from "./progress";

const FILE_TYPE_OPTIONS = [
  { key: "all", label: "全部" },
  { key: "audio", label: "音频" },
  { key: "video", label: "视频" },
] as const;

const DownloadList = () => {
  const downloadPath = useSettings(s => s.downloadPath);
  const [downloadList, setDownloadList] = useState<MediaDownloadTask[]>([]);
  const [fileType, setFileType] = useState<string>("all");

  useEffect(() => {
    const initList = async () => {
      const list = await window.electron.getMediaDownloadTaskList();
      if (list.length) {
        setDownloadList(list);
      }
    };

    initList();

    const removeListener = window.electron.syncMediaDownloadTaskList(payload => {
      if (payload?.type === "full") {
        setDownloadList(payload.data as MediaDownloadTask[]);
      } else if (payload?.type === "update") {
        setDownloadList(prev => {
          const updateTasks = payload.data;
          return prev.map(item => {
            const updateTask = updateTasks.find(t => t.id === item.id);
            return updateTask ? { ...item, ...updateTask } : item;
          });
        });
      }
    });

    return () => {
      removeListener();
    };
  }, []);

  const clearDownloadList = async () => {
    await window.electron.clearMediaDownloadTaskList();
  };

  const openDownloadDir = async () => {
    await window.electron.openDirectory(downloadPath);
  };

  const getFileQuality = (item: MediaDownloadTask) => {
    if (item.outputFileType === "video") {
      return item.videoResolution
        ? `${item.videoResolution}${item.videoFrameRate ? `@${item.videoFrameRate}` : ""}`
        : "";
    }
    if (item.audioCodecs === "flac") return "flac";
    if (item.audioCodecs?.includes("ec-3")) return "杜比音频";
    if (item.audioBandwidth) return `${Math.round(item.audioBandwidth / 1000)} kbps`;
    return "";
  };

  const filteredList = downloadList
    .filter(item => fileType === "all" || item.outputFileType === fileType)
    .sort((a, b) => (b.createdTime || 0) - (a.createdTime || 0));

  return (
    <ScrollContainer enableBackToTop className="h-full w-full px-4">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="flex items-center space-x-1">下载记录</h1>
        <div className="flex items-center space-x-1">
          <Button variant="flat" size="sm" onPress={openDownloadDir} startContent={<RiFolderLine size={18} />}>
            {downloadPath}
          </Button>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div className="bg-default-100 flex items-center gap-1 rounded-lg p-0.5">
          {FILE_TYPE_OPTIONS.map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setFileType(opt.key)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                fileType === opt.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-foreground-500 hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {Boolean(downloadList.length) && (
          <Button
            size="sm"
            variant="light"
            color="danger"
            onPress={clearDownloadList}
            startContent={<RiDeleteBinLine size={16} />}
          >
            清空记录
          </Button>
        )}
      </div>

      {!filteredList.length ? (
        <Empty />
      ) : (
        <>
          <div className="text-foreground-500 grid w-full grid-cols-[32px_minmax(0,1fr)_140px_80px_64px_80px_100px_40px] items-center gap-4 rounded-md px-2 py-1 text-xs">
            <div className="text-center">#</div>
            <div>文件</div>
            <div className="text-center">状态</div>
            <div className="text-center">码率</div>
            <div className="text-center">时长</div>
            <div className="text-right">大小</div>
            <div className="text-right">下载时间</div>
            <div />
          </div>

          <div className="flex flex-col">
            {filteredList.map((item, index) => {
              const quality = getFileQuality(item);

              const toFileUrl = (p: string) => `file://${p.replace(/\\/g, "/")}`;

              return (
                <div
                  key={item.id}
                  className="hover:bg-content2 grid w-full grid-cols-[32px_minmax(0,1fr)_140px_80px_64px_80px_100px_40px] items-center gap-4 rounded-md px-2 py-1.5 transition-colors"
                  onDoubleClick={() => {
                    if (item.status === "completed" && item.savePath) {
                      usePlayList.getState().play({
                        type: item.sid ? "audio" : "mv",
                        source: "local" as const,
                        id: item.id,
                        title: item.title,
                        audioUrl: toFileUrl(item.savePath),
                      });
                    }
                  }}
                >
                  <div className="text-foreground-500 text-center text-xs tabular-nums">{index + 1}</div>

                  <div className="flex min-w-0 items-center gap-2">
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md">
                      <Image
                        removeWrapper
                        radius="md"
                        src={item.cover}
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      className="group flex min-w-0 cursor-pointer items-center gap-1 hover:underline"
                      onClick={async () => {
                        const link = getBiliVideoLink({
                          type: item.sid ? "audio" : "mv",
                          bvid: item.bvid,
                          sid: item.sid,
                        });
                        await navigator.clipboard.writeText(link);
                        addToast({ title: "链接已复制", color: "success" });
                      }}
                    >
                      <span className="truncate text-sm">{item.title}</span>
                      <RiExternalLinkLine className="hidden w-0 flex-none group-hover:inline-block group-hover:w-3.5" />
                    </button>
                  </div>

                  <div className="flex justify-center">
                    <DownloadProgress data={item} />
                  </div>

                  <div className="text-foreground-500 text-center text-xs tabular-nums">{quality || "-"}</div>

                  <div className="text-foreground-500 text-center text-xs tabular-nums">
                    {item.duration ? formatDuration(item.duration) : "-"}
                  </div>

                  <div className="text-foreground-500 text-right text-xs tabular-nums">
                    {item.totalBytes ? filesize(item.totalBytes) : "-"}
                  </div>

                  <div className="text-foreground-500 text-right text-xs">
                    {item.createdTime ? formatMillisecond(item.createdTime) : "-"}
                  </div>

                  <div className="flex justify-end">
                    <DownloadActions data={item} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </ScrollContainer>
  );
};

export default DownloadList;

import { useEffect, useRef, useState } from "react";

import { addToast, Button, Listbox, ListboxItem, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import {
  RiDeleteBinLine,
  RiFileMusicLine,
  RiFileVideoLine,
  RiMore2Line,
  RiPauseLine,
  RiPlayLine,
  RiRefreshLine,
} from "@remixicon/react";

import { useModalStore } from "@/store/modal";

interface Props {
  data: MediaDownloadTask;
}

type ActionKey = "open" | "pause" | "resume" | "retry" | "delete";

interface ActionItem {
  key: ActionKey;
  label: string;
  icon: React.ReactNode;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  show: boolean;
}

const DownloadActions = ({ data }: Props) => {
  const onOpenConfirmModal = useModalStore(s => s.onOpenConfirmModal);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<ActionKey | null>(null);
  const pendingTimeoutRef = useRef<number | null>(null);

  const clearPendingTimeout = () => {
    if (pendingTimeoutRef.current) {
      window.clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = null;
    }
  };

  const lockAction = (key: ActionKey) => {
    setPendingAction(key);
    clearPendingTimeout();
    pendingTimeoutRef.current = window.setTimeout(() => {
      setPendingAction(null);
      pendingTimeoutRef.current = null;
    }, 2000);
  };

  useEffect(() => {
    if (!pendingAction) {
      clearPendingTimeout();
      return;
    }
    if (pendingAction === "pause" && data.status !== "downloading") {
      setPendingAction(null);
      return;
    }
    if (pendingAction === "resume" && !["downloadPaused", "mergePaused", "convertPaused"].includes(data.status)) {
      setPendingAction(null);
      return;
    }
    if (pendingAction === "retry" && data.status !== "failed") {
      setPendingAction(null);
    }
  }, [data.status, pendingAction]);

  useEffect(() => {
    return () => {
      clearPendingTimeout();
    };
  }, []);

  const handleOpen = async () => {
    if (!data.savePath) {
      addToast({ title: "文件路径不存在", color: "danger" });
      return;
    }
    try {
      await window.electron.showFileInFolder(data.savePath);
    } catch (err) {
      addToast({ title: `${err instanceof Error ? err.message : String(err)}`, color: "danger" });
    }
  };

  const handlePause = async () => {
    if (pendingAction) return;
    lockAction("pause");
    await window.electron.pauseMediaDownloadTask(data.id);
  };

  const handleResume = async () => {
    if (pendingAction) return;
    lockAction("resume");
    await window.electron.resumeMediaDownloadTask(data.id);
  };

  const handleRetry = async () => {
    if (pendingAction) return;
    lockAction("retry");
    await window.electron.retryMediaDownloadTask(data.id);
  };

  const handleDelete = async () => {
    if (pendingAction) return;
    if (
      ["downloading", "downloadPaused", "merging", "mergePaused", "converting", "convertPaused"].includes(data.status)
    ) {
      onOpenConfirmModal({
        title: "确认删除吗？",
        description: "当前任务未下载完成，确认删除后将无法恢复",
        confirmText: "删除",
        onConfirm: async () => {
          if (pendingAction) return false;
          lockAction("delete");
          await window.electron.cancelMediaDownloadTask(data.id);
          return true;
        },
      });
      return;
    }
    lockAction("delete");
    await window.electron.cancelMediaDownloadTask(data.id);
  };

  const allActions: ActionItem[] = [
    {
      key: "open",
      label: "打开文件",
      icon: data.outputFileType === "audio" ? <RiFileMusicLine size={16} /> : <RiFileVideoLine size={16} />,
      show: data.status === "completed",
    },
    {
      key: "pause",
      label: "暂停",
      icon: <RiPauseLine size={16} />,
      color: "warning",
      show: data.status === "downloading",
    },
    {
      key: "resume",
      label: "继续",
      icon: <RiPlayLine size={16} />,
      color: "success",
      show: ["downloadPaused", "mergePaused", "convertPaused"].includes(data.status),
    },
    {
      key: "retry",
      label: "重试",
      icon: <RiRefreshLine size={16} />,
      show: data.status === "failed",
    },
    {
      key: "delete",
      label: "删除",
      icon: <RiDeleteBinLine size={16} />,
      color: "danger",
      show: true,
    },
  ];

  const visibleActions = allActions.filter(a => a.show);

  const onAction = (key: string) => {
    setIsOpen(false);
    if (key === "open") handleOpen();
    if (key === "pause") handlePause();
    if (key === "resume") handleResume();
    if (key === "retry") handleRetry();
    if (key === "delete") handleDelete();
  };

  return (
    <Popover
      radius="md"
      isOpen={isOpen}
      onOpenChange={open => setIsOpen(open)}
      placement="bottom-end"
      offset={4}
      disableAnimation
    >
      <PopoverTrigger>
        <Button isIconOnly variant="light" size="sm" aria-label="操作菜单">
          <RiMore2Line size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[140px] p-0"
        data-no-contextmenu="true"
        onContextMenuCapture={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onContextMenu={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Listbox aria-label="操作菜单" selectionMode="none" items={visibleActions} onAction={onAction} className="p-2">
          {item => (
            <ListboxItem key={item.key} startContent={item.icon} className="rounded-medium" color={item.color}>
              {item.label}
            </ListboxItem>
          )}
        </Listbox>
      </PopoverContent>
    </Popover>
  );
};

export default DownloadActions;

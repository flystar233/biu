import { useMemo } from "react";

import { Progress } from "@heroui/react";
import { RiCheckboxCircleLine } from "@remixicon/react";

import { StatusDesc } from "./status-desc";

interface Props {
  data: MediaDownloadTask;
}

const StageProgress = ({ data }: Props) => {
  if (data.status === "waiting") {
    return <span className="text-foreground-500 text-xs">等待下载...</span>;
  }

  if (data.status === "completed") {
    return (
      <div className="text-success flex items-center gap-1 text-xs">
        <RiCheckboxCircleLine size={14} />
        <span>下载完成</span>
      </div>
    );
  }

  const progressValue = useMemo(() => {
    if (data.status === "merging" || data.status === "mergePaused") {
      return data.mergeProgress;
    }
    if (data.status === "converting" || data.status === "convertPaused") {
      return data.convertProgress;
    }
    return data.downloadProgress;
  }, [data.downloadProgress, data.status, data.mergeProgress, data.convertProgress]);

  return (
    <div className="flex items-center gap-2">
      <Progress
        aria-label={StatusDesc[data.status]}
        value={progressValue}
        maxValue={100}
        showValueLabel={false}
        size="sm"
        radius="md"
        className="max-w-[160px]"
        classNames={{
          indicator: data.status === "failed" ? "bg-danger" : "bg-blue-500",
        }}
      />
      {data.status === "failed" ? (
        <span title={data.error} className="text-danger truncate text-xs">
          {data.error}
        </span>
      ) : (
        <span className="text-foreground-500 text-xs text-nowrap">
          {StatusDesc[data.status]} {progressValue || 0}%
        </span>
      )}
    </div>
  );
};

export default StageProgress;

import React, { useMemo } from "react";
import { useSearchParams } from "react-router";

import { CollectionType } from "@/common/constants/collection";
import ScrollContainer from "@/components/scroll-container";
import { useSettings } from "@/store/settings";

import Favorites from "./favorites";
import VideoCollectionInfo from "./video-series";

const Folder = () => {
  const [searchParams] = useSearchParams();
  const displayMode = useSettings(state => state.displayMode);

  const collectionType = useMemo(
    () => Number(searchParams.get("type") || CollectionType.Favorite) as CollectionType,
    [searchParams],
  );

  // 列表模式下不使用外层 ScrollContainer，让子组件的 VirtualList 管理滚动
  if (displayMode === "list") {
    return (
      <div className="flex h-full w-full flex-col">
        <div className="w-full flex-1 overflow-hidden p-4">
          {collectionType === CollectionType.Favorite && <Favorites />}
          {collectionType === CollectionType.VideoSeries && <VideoCollectionInfo />}
        </div>
      </div>
    );
  }

  return (
    <ScrollContainer className="h-full w-full">
      <div className="w-full p-4">
        {collectionType === CollectionType.Favorite && <Favorites />}
        {collectionType === CollectionType.VideoSeries && <VideoCollectionInfo />}
      </div>
    </ScrollContainer>
  );
};

export default Folder;

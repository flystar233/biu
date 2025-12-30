import React, { useMemo } from "react";

import { Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, Tooltip } from "@heroui/react";
import { RiDeleteBinLine } from "@remixicon/react";
import { uniqBy } from "es-toolkit/array";

import Empty from "@/components/empty";
import If from "@/components/if";
import { VirtualList } from "@/components/virtual-list";
import { usePlayList } from "@/store/play-list";

import ListItem from "./list-item";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const PlayListDrawer = ({ isOpen, onOpenChange }: Props) => {
  const list = usePlayList(s => s.list);
  const playId = usePlayList(s => s.playId);
  const clear = usePlayList(s => s.clear);
  const playListItem = usePlayList(state => state.playListItem);

  const playItem = useMemo(() => list.find(item => item.id === playId), [list, playId]);
  const pureList = useMemo(() => {
    return uniqBy(list, item => item.bvid);
  }, [list]);
  const currentIndex = useMemo(() => {
    if (!playItem) return undefined;
    return pureList.findIndex(item => item.bvid === playItem.bvid);
  }, [pureList, playItem]);

  return (
    <Drawer
      radius="md"
      shadow="none"
      backdrop="opaque"
      size="sm"
      hideCloseButton
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{
        base: "theme-aware-modal data-[placement=right]:mb-[88px] data-[placement=right]:mr-3 data-[placement=right]:mt-3",
      }}
    >
      <DrawerContent className="rounded-xl">
        <DrawerHeader className="border-b-content2 flex flex-row items-center justify-between space-x-2 border-b px-4 py-3">
          <h3>播放列表</h3>
          <If condition={Boolean(pureList?.length)}>
            <Tooltip closeDelay={0} content="清空播放列表">
              <Button isIconOnly size="sm" variant="light" onPress={clear}>
                <RiDeleteBinLine size={16} />
              </Button>
            </Tooltip>
          </If>
        </DrawerHeader>
        <DrawerBody className="overflow-hidden px-0">
          <VirtualList
            className="px-2"
            data={pureList}
            itemHeight={64}
            overscan={8}
            initialScrollIndex={currentIndex}
            empty={
              <div className="flex flex-col items-center justify-center px-4">
                <Empty className="min-h-[180px]" />
              </div>
            }
            renderItem={item => {
              const isPlaying = item.bvid === playItem?.bvid;
              return (
                <ListItem
                  isPlaying={isPlaying}
                  data={item}
                  onClose={() => onOpenChange(false)}
                  onPress={isPlaying ? undefined : () => playListItem(item.id)}
                />
              );
            }}
          />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default PlayListDrawer;

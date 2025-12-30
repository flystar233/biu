import { useEffect, useRef, useState } from "react";

import { addToast, Button, Link, Pagination } from "@heroui/react";
import { RiDeleteBinLine, RiRefreshLine } from "@remixicon/react";
import { usePagination } from "ahooks";

import { formatDuration } from "@/common/utils";
import Empty from "@/components/empty";
import GridList from "@/components/grid-list";
import MediaItem from "@/components/media-item";
import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import { VirtualList } from "@/components/virtual-list";
import { postHistoryToViewDel } from "@/service/history-toview-del";
import { getHistoryToViewList } from "@/service/history-toview-list";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

const LIST_ITEM_HEIGHT = 64;

const Later = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  const play = usePlayList(s => s.play);
  const displayMode = useSettings(state => state.displayMode);
  const scrollerRef = useRef<ScrollRefObject>(null);

  const {
    data,
    error,
    pagination,
    runAsync: getData,
    refreshAsync,
  } = usePagination(
    async ({ current = 1, pageSize }) => {
      const res = await getHistoryToViewList({
        pn: current,
        ps: pageSize,
        viewed: 0,
      });
      return {
        total: res?.data?.count ?? 0,
        list: res?.data?.list ?? [],
      };
    },
    {
      defaultPageSize: 20,
      manual: true,
    },
  );

  const initData = async () => {
    try {
      setInitialLoading(true);
      await getData({ current: 1, pageSize: 20 });
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const onOpenConfirmModal = useModalStore(s => s.onOpenConfirmModal);

  const handleOpenDeleteModal = (item: any) => {
    onOpenConfirmModal({
      title: "确认删除吗？",
      confirmText: "删除",
      onConfirm: async () => {
        const res = await postHistoryToViewDel({
          aid: item.aid,
        });

        if (res.code === 0) {
          addToast({
            title: "删除成功",
            color: "success",
          });
          setTimeout(() => {
            refreshAsync();
          }, 500);
        }

        return res.code === 0;
      },
    });
  };

  const renderMediaItem = (item: any) => (
    <MediaItem
      displayMode={displayMode}
      type="mv"
      bvid={item.bvid}
      aid={String(item.aid)}
      title={item.title}
      cover={item.pic}
      coverHeight={200}
      playCount={item.stat.view}
      ownerName={item.owner?.name}
      ownerMid={item.owner?.mid}
      menus={[
        {
          key: "delete",
          title: "删除",
          icon: <RiDeleteBinLine size={16} />,
          onPress: () => handleOpenDeleteModal(item),
        },
      ]}
      footer={
        displayMode === "card" && (
          <div className="text-foreground-500 flex w-full items-center justify-between text-sm">
            <Link href={`/user/${item.owner?.mid}`} className="text-foreground-500 text-sm hover:underline">
              {item.owner?.name}
            </Link>
            <span>{formatDuration(item.duration as number)}</span>
          </div>
        )
      }
      onPress={() =>
        play({
          type: "mv",
          bvid: item.bvid,
          title: item.title,
          cover: item.pic,
          ownerName: item.owner?.name,
          ownerMid: item.owner?.mid,
        })
      }
    />
  );

  const renderPagination = () => {
    if (error || pagination?.totalPage <= 1) return null;
    return (
      <div className="flex w-full items-center justify-center py-6">
        <Pagination
          initialPage={1}
          total={pagination?.totalPage}
          page={pagination?.current}
          onChange={next => getData({ current: next, pageSize: pagination?.pageSize })}
        />
      </div>
    );
  };

  // 列表模式使用虚拟列表
  if (displayMode === "list") {
    return (
      <div className="flex h-full w-full flex-col">
        <div className="flex flex-none items-center justify-between p-4 pb-0">
          <h1>稍后再看</h1>
          <Button isIconOnly variant="light" size="sm" onPress={refreshAsync}>
            <RiRefreshLine size={18} />
          </Button>
        </div>

        {/* 初始加载骨架屏 */}
        {initialLoading && (
          <div className="space-y-4 p-4">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div key={idx} className="flex space-x-4">
                <div className="h-12 w-12 animate-pulse rounded bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 空数据 */}
        {!initialLoading && !data?.list?.length && <Empty className="min-h-[40vh]" />}

        {/* 虚拟列表 */}
        {!initialLoading && data?.list?.length > 0 && (
          <div className="min-h-0 flex-1">
            <VirtualList
              scrollerRef={scrollerRef}
              className="h-full px-4"
              data={data.list}
              itemHeight={LIST_ITEM_HEIGHT}
              overscan={8}
              renderItem={renderMediaItem}
            />
          </div>
        )}

        {/* 分页 */}
        <div className="flex-none">{renderPagination()}</div>
      </div>
    );
  }

  // 卡片模式
  return (
    <ScrollContainer className="h-full w-full p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1>稍后再看</h1>
        <Button isIconOnly variant="light" size="sm" onPress={refreshAsync}>
          <RiRefreshLine size={18} />
        </Button>
      </div>
      <GridList
        loading={initialLoading}
        data={data?.list}
        itemKey="bvid"
        renderItem={item => <div className="mb-4">{renderMediaItem(item)}</div>}
      />
      {renderPagination()}
    </ScrollContainer>
  );
};

export default Later;

import React from "react";

import { Image, Link, Skeleton, User } from "@heroui/react";
import { RiPlayFill } from "@remixicon/react";
import { useRequest } from "ahooks";
import clx from "classnames";

import FallbackImage from "@/assets/images/fallback.png";
import { CollectionType } from "@/common/constants/collection";
import { isPrivateFav } from "@/common/utils/fav";
import AsyncButton from "@/components/async-button";
import Ellipsis from "@/components/ellipsis";
import { getWebInterfaceCard } from "@/service/user-account";
import { useUser } from "@/store/user";

import Menu from "./menu";

interface Props {
  type: CollectionType;
  loading?: boolean;
  attr?: number;
  cover?: string;
  title?: string;
  desc?: string;
  upMid?: number;
  upName?: string;
  mediaCount?: number;
  /** 是否收起状态（滚动时触发） */
  collapsed?: boolean;
  afterChangeInfo: VoidFunction;
  onPlayAll: VoidFunction;
  onAddToPlayList: VoidFunction;
}

const Info = ({
  type,
  loading,
  attr,
  cover,
  title,
  desc,
  upMid,
  upName,
  mediaCount,
  collapsed = false,
  afterChangeInfo,
  onPlayAll,
  onAddToPlayList,
}: Props) => {
  // 只选择需要的字段，避免 user 对象变化导致重渲染
  const userMid = useUser(s => s.user?.mid);

  const isOwn = upMid === userMid;

  const { data: upInfo } = useRequest(
    async () => {
      const res = await getWebInterfaceCard({
        mid: upMid as number,
      });

      return res?.data;
    },
    {
      ready: Boolean(upMid) && upMid !== userMid,
      refreshDeps: [upMid],
    },
  );

  if (loading) {
    return (
      <div className="mb-4 flex space-x-4">
        <Skeleton className="h-[230px] w-[230px] rounded-lg" />
        <div className="flex flex-col items-start justify-start space-y-4">
          <Skeleton className="h-12 w-48 rounded-lg" />
          <Skeleton className="h-4 w-24 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={clx("flex items-start space-x-4 transition-all duration-300 ease-out", {
        "mb-6": !collapsed,
        "mb-4": collapsed,
      })}
    >
      {/* 封面图 - 使用 CSS 过渡实现缩放 */}
      <div
        className="flex-none overflow-hidden rounded-lg transition-all duration-300 ease-out"
        style={{
          width: collapsed ? 64 : 230,
          height: collapsed ? 64 : 230,
        }}
      >
        <Image
          key={cover}
          isBlurred
          radius="md"
          src={cover || FallbackImage}
          fallbackSrc={FallbackImage}
          alt={title}
          width="100%"
          height="100%"
          className={clx("h-full w-full object-cover transition-all duration-300", {
            "border-content3 border": !cover,
          })}
          classNames={{
            wrapper: "w-full h-full",
            img: "w-full h-full",
          }}
        />
      </div>

      {/* 右侧内容区 */}
      <div className="flex min-w-0 flex-1 flex-col transition-all duration-300">
        {/* 收起时：标题和按钮在同一行 */}
        <div
          className={clx("flex items-center justify-between transition-all duration-300", {
            "flex-col items-start": !collapsed,
            "flex-row": collapsed,
          })}
        >
          {/* 左侧：标题和视频数量 */}
          <div className="min-w-0 flex-1">
            <h1
              className={clx("transition-all duration-300 ease-out", {
                "mb-4 text-3xl": !collapsed,
                "truncate text-xl": collapsed,
              })}
            >
              {title}
            </h1>

            {/* 视频数量 - 收起时显示在标题下方 */}
            <span
              className={clx("text-foreground-500 text-sm transition-all duration-300", {
                "hidden opacity-0": !collapsed,
                "block opacity-100": collapsed,
              })}
            >
              {mediaCount} 条视频
            </span>
          </div>

          {/* 右侧：收起时的按钮 */}
          <div
            className={clx("flex flex-none items-center space-x-2 transition-all duration-300", {
              "h-0 w-0 overflow-hidden opacity-0": !collapsed,
              "ml-4 opacity-100": collapsed,
            })}
          >
            {(mediaCount ?? 0) > 0 && (
              <AsyncButton
                size="sm"
                color="primary"
                startContent={<RiPlayFill size={16} className="text-inherit" />}
                onPress={onPlayAll}
              >
                播放全部
              </AsyncButton>
            )}
            <Menu
              type={type}
              isOwn={isOwn}
              mediaCount={mediaCount}
              afterChangeInfo={afterChangeInfo}
              onAddToPlayList={onAddToPlayList}
            />
          </div>
        </div>

        {/* 描述、UP主信息、类型标签 - 展开时显示 */}
        <div
          className={clx("overflow-hidden transition-all duration-300 ease-out", {
            "max-h-40 opacity-100": !collapsed,
            "max-h-0 opacity-0": collapsed,
          })}
        >
          <div className="flex flex-col items-start space-y-4">
            {Boolean(desc) && <Ellipsis className="text-sm text-zinc-500">{desc}</Ellipsis>}
            {!isOwn && (
              <User
                avatarProps={{
                  size: "sm",
                  src: upInfo?.card?.face,
                }}
                name={
                  <Link color="foreground" href={`/user/${upMid}`} className="hover:underline">
                    {upName}
                  </Link>
                }
              />
            )}
            <div className="flex items-center space-x-2 text-sm text-zinc-400">
              <span>
                {type === CollectionType.Favorite
                  ? `${isOwn && Boolean(attr) ? (isPrivateFav(attr as number) ? "私密" : "公开") : ""}收藏夹`
                  : "视频合集"}
              </span>
              <span>•</span>
              <span>{mediaCount} 条视频</span>
            </div>
          </div>
        </div>

        {/* 操作按钮区 - 展开时显示在底部 */}
        <div
          className={clx("flex items-center space-x-2 transition-all duration-300", {
            "mt-auto pt-4 opacity-100": !collapsed,
            "h-0 overflow-hidden opacity-0": collapsed,
          })}
        >
          {(mediaCount ?? 0) > 0 && (
            <AsyncButton
              color="primary"
              startContent={<RiPlayFill size={20} className="text-inherit" />}
              onPress={onPlayAll}
            >
              播放全部
            </AsyncButton>
          )}
          <Menu
            type={type}
            isOwn={isOwn}
            mediaCount={mediaCount}
            afterChangeInfo={afterChangeInfo}
            onAddToPlayList={onAddToPlayList}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(Info);

import React from "react";
import { Controller, useWatch } from "react-hook-form";
import type { Control, UseFormSetValue } from "react-hook-form";

import { Button, Divider, Form, Input, Select, SelectItem, Switch } from "@heroui/react";
import { RiArrowRightLongLine } from "@remixicon/react";

import ColorPicker from "@/components/color-picker";
import FontSelect from "@/components/font-select";
import UpdateCheckButton from "@/components/update-check-button";

type SystemSettingsTabProps = {
  appVersion: string;
  audioQuality: AudioQuality;
  control: Control<AppSettings>;
  isUpdateAvailable: boolean;
  latestVersion?: string;
  setValue: UseFormSetValue<AppSettings>;
  handleReset: () => void;
};

export const SystemSettingsTab = ({
  appVersion,
  audioQuality,
  control,
  isUpdateAvailable,
  latestVersion,
  setValue,
  handleReset,
}: SystemSettingsTabProps) => {
  return (
    <Form className="space-y-6">
      <h2>外观</h2>
      {/* 显示模式 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">数据显示样式</div>
          <div className="text-sm text-zinc-500">选择媒体内容的显示样式</div>
        </div>
        <div className="w-[180px]">
          <Controller
            control={control}
            name="displayMode"
            render={({ field }) => (
              <Select
                disallowEmptySelection
                aria-label="数据显示样式"
                selectedKeys={field.value ? new Set([field.value]) : new Set()}
                onSelectionChange={keys => {
                  const value = Array.from(keys)[0] as "list" | "card" | "compact";
                  field.onChange(value);
                }}
              >
                <SelectItem key="list">列表</SelectItem>
                <SelectItem key="card">网格</SelectItem>
                <SelectItem key="compact">紧凑</SelectItem>
              </Select>
            )}
          />
        </div>
      </div>
      {/* 主题模式 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">主题</div>
          <div className="text-sm text-zinc-500">选择浅色或深色主题</div>
        </div>

        <div className="w-[180px]">
          <Controller
            control={control}
            name="themeMode"
            render={({ field }) => (
              <Select
                disallowEmptySelection
                aria-label="主题"
                selectedKeys={field.value ? new Set([field.value]) : new Set()}
                onSelectionChange={keys => {
                  const value = Array.from(keys)[0] as ThemeMode;
                  field.onChange(value);
                }}
              >
                <SelectItem key="system">跟随系统</SelectItem>
                <SelectItem key="light">浅色</SelectItem>
                <SelectItem key="dark">深色</SelectItem>
              </Select>
            )}
          />
        </div>
      </div>
      {/* 字体选择 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">字体</div>
          <div className="text-sm text-zinc-500">选择界面显示的字体</div>
        </div>
        <div className="w-[180px]">
          <Controller
            control={control}
            name="fontFamily"
            render={({ field }) => <FontSelect value={field.value} onChange={field.onChange} />}
          />
        </div>
      </div>

      {/* 页面切换动画 FIXME:暂时移除，该功能会导致页面切换时重复渲染，数据请求double */}
      {/* <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">页面切换动画</div>
          <div className="text-sm text-zinc-500">选择页面切换时的过渡效果</div>
        </div>
        <div className="w-[180px]">
          <Controller
            control={control}
            name="pageTransition"
            render={({ field }) => (
              <Select
                aria-label="页面切换动画"
                selectedKeys={field.value ? new Set([field.value]) : new Set()}
                onSelectionChange={keys => {
                  const value = Array.from(keys)[0] as PageTransition;
                  field.onChange(value);
                }}
              >
                <SelectItem key="none">无动画</SelectItem>
                <SelectItem key="fade">淡入淡出</SelectItem>
                <SelectItem key="slide">滑动</SelectItem>
                <SelectItem key="scale">缩放</SelectItem>
                <SelectItem key="slideUp">上浮</SelectItem>
              </Select>
            )}
          />
        </div>
      </div> */}
      <Divider />
      <h2>播放</h2>
      {/* 音质选择 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">音质偏好</div>
          <div className="text-sm text-zinc-500">
            {audioQuality === "auto" && "自动选择最高音质"}
            {audioQuality === "lossless" && "FLAC / Hi-Res"}
            {audioQuality === "high" && "180-320 kbps"}
            {audioQuality === "medium" && "100-140 kbps"}
            {audioQuality === "low" && "60-80 kbps"}
          </div>
        </div>
        <div className="w-[180px]">
          <Controller
            control={control}
            name="audioQuality"
            render={({ field }) => (
              <Select
                disallowEmptySelection
                aria-label="音质偏好"
                selectedKeys={field.value ? new Set([field.value]) : new Set()}
                onSelectionChange={keys => {
                  const value = Array.from(keys)[0] as AudioQuality;
                  field.onChange(value);
                }}
              >
                <SelectItem key="auto">自动</SelectItem>
                <SelectItem key="lossless">无损</SelectItem>
                <SelectItem key="high">高品质</SelectItem>
                <SelectItem key="medium">中等</SelectItem>
                <SelectItem key="low">低品质</SelectItem>
              </Select>
            )}
          />
        </div>
      </div>
      <Divider />
      <h2>全屏播放器</h2>
      <FullScreenPlayerSettings control={control} />
      <Divider />
      <h2>下载</h2>
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">下载目录</div>
          <div className="text-sm text-zinc-500">选择音视频保存的位置</div>
        </div>
        <div className="w-[360px]">
          <Controller
            control={control}
            name="downloadPath"
            render={({ field }) => (
              <div className="flex items-center space-x-1">
                <Input isDisabled placeholder="选择文件夹" value={field.value} onValueChange={field.onChange} />
                <Button
                  variant="flat"
                  onPress={async () => {
                    const path = await window.electron.selectDirectory();
                    if (path) setValue("downloadPath", path, { shouldDirty: true, shouldTouch: true });
                  }}
                >
                  选择
                </Button>
              </div>
            )}
          />
        </div>
      </div>

      {/* FFmpeg 路径配置 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">FFmpeg 路径</div>
          <div className="text-sm text-zinc-500">手动指定 FFmpeg 可执行文件路径</div>
        </div>
        <div className="w-[360px]">
          <Controller
            control={control}
            name="ffmpegPath"
            render={({ field }) => (
              <div className="flex items-center space-x-1">
                <Input isDisabled placeholder="自动检测" value={field.value} onValueChange={field.onChange} />
                <Button
                  variant="flat"
                  onPress={async () => {
                    const path = await window.electron.selectFile();
                    if (path) setValue("ffmpegPath", path, { shouldDirty: true, shouldTouch: true });
                  }}
                >
                  选择
                </Button>
              </div>
            )}
          />
        </div>
      </div>
      <Divider />
      <h2>搜索</h2>
      {/* 仅音乐分区 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">仅音乐分区</div>
          <div className="text-sm text-zinc-500">搜索视频时默认仅显示音乐分区内容</div>
        </div>
        <Controller
          control={control}
          name="searchMusicOnly"
          render={({ field }) => <Switch disableAnimation isSelected={field.value} onValueChange={field.onChange} />}
        />
      </div>
      {/* 显示搜索历史 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">显示搜索历史</div>
          <div className="text-sm text-zinc-500">在搜索框中显示搜索历史记录</div>
        </div>
        <Controller
          control={control}
          name="showSearchHistory"
          render={({ field }) => <Switch disableAnimation isSelected={field.value} onValueChange={field.onChange} />}
        />
      </div>

      <Divider />
      <h2>系统</h2>
      {/* 窗口关闭选项 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">窗口关闭</div>
          <div className="text-sm text-zinc-500">选择窗口关闭时的行为</div>
        </div>
        <div className="w-[180px]">
          <Controller
            control={control}
            name="closeWindowOption"
            render={({ field }) => (
              <Select
                disallowEmptySelection
                aria-label="窗口关闭"
                selectedKeys={field.value ? new Set([field.value]) : new Set()}
                onSelectionChange={keys => {
                  const value = Array.from(keys)[0] as "hide" | "exit";
                  field.onChange(value);
                }}
              >
                <SelectItem key="hide">隐藏到托盘</SelectItem>
                <SelectItem key="exit">直接退出</SelectItem>
              </Select>
            )}
          />
        </div>
      </div>

      {/* 开机自启动开关 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">开机自启动</div>
          <div className="text-sm text-zinc-500">系统登录后自动启动应用</div>
        </div>
        <div className="flex w-[360px] justify-end">
          <Controller
            control={control}
            name="autoStart"
            render={({ field }) => <Switch disableAnimation isSelected={field.value} onValueChange={field.onChange} />}
          />
        </div>
      </div>

      <Divider />
      <h2>关于应用</h2>
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 flex items-center space-x-1">
          <span>当前版本 {appVersion}</span>
          {isUpdateAvailable && Boolean(latestVersion) && (
            <>
              <RiArrowRightLongLine size={16} />
              <span className="text-primary">{latestVersion}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="flat" onPress={handleReset}>
            恢复默认
          </Button>
          <UpdateCheckButton />
        </div>
      </div>
    </Form>
  );
};

const ColorTrigger = ({ color, ...rest }: { color?: string } & Record<string, unknown>) => (
  <Button
    {...rest}
    isIconOnly
    size="sm"
    variant="bordered"
    className="border-default h-8 w-8 min-w-0 rounded-md"
    style={{ backgroundColor: color || "#ffffff" }}
  />
);

const FullScreenPlayerSettings = ({ control }: { control: Control<AppSettings> }) => {
  const showBlurredBackground = useWatch({ control, name: "showBlurredBackground" });

  return (
    <>
      {/* 显示歌词 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">显示歌词</div>
          <div className="text-sm text-zinc-500">在全屏播放器中显示歌词</div>
        </div>
        <Controller
          control={control}
          name="showLyrics"
          render={({ field }) => <Switch disableAnimation isSelected={field.value} onValueChange={field.onChange} />}
        />
      </div>
      {/* 显示频谱图 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">显示频谱图</div>
          <div className="text-sm text-zinc-500">在全屏播放器中显示音频频谱动画</div>
        </div>
        <Controller
          control={control}
          name="showSpectrum"
          render={({ field }) => <Switch disableAnimation isSelected={field.value} onValueChange={field.onChange} />}
        />
      </div>
      {/* 显示封面 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">显示封面</div>
          <div className="text-sm text-zinc-500">在全屏播放器中显示歌曲封面</div>
        </div>
        <Controller
          control={control}
          name="showCover"
          render={({ field }) => <Switch disableAnimation isSelected={field.value} onValueChange={field.onChange} />}
        />
      </div>
      {/* 显示虚化背景 */}
      <div className="flex w-full items-center justify-between">
        <div className="mr-6 space-y-1">
          <div className="text-medium font-medium">显示虚化背景</div>
          <div className="text-sm text-zinc-500">在全屏播放器中使用虚化封面作为背景</div>
        </div>
        <Controller
          control={control}
          name="showBlurredBackground"
          render={({ field }) => <Switch disableAnimation isSelected={field.value} onValueChange={field.onChange} />}
        />
      </div>
      {!showBlurredBackground && (
        <div className="flex w-full items-center justify-between">
          <div className="mr-6 space-y-1">
            <div className="text-medium font-medium">背景颜色</div>
            <div className="text-sm text-zinc-500">设置全屏播放器的纯色背景</div>
          </div>
          <Controller
            control={control}
            name="fullScreenBackgroundColor"
            render={({ field }) => (
              <ColorPicker
                value={field.value}
                onChange={field.onChange}
                presets={["#000000", "#1a1a2e", "#16213e", "#0f3460", "#533483"]}
              >
                <ColorTrigger color={field.value} />
              </ColorPicker>
            )}
          />
        </div>
      )}
    </>
  );
};

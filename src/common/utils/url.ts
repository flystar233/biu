export const getUrlParams = (url: string) => {
  const urlParams = new URLSearchParams(url.split("?")[1]);
  return Object.fromEntries(urlParams.entries());
};

export const formatUrlProtocal = (url?: string) => {
  if (url && !url.startsWith("http")) {
    return `https:${url}`;
  }

  return url;
};

/**
 * 为 B站图片 URL 添加缩放参数，减少图片大小和内存占用
 * @param url 原始图片 URL
 * @param width 目标宽度，默认 600
 */
export const formatBiliImageUrl = (url?: string, width = 600) => {
  const formattedUrl = formatUrlProtocal(url);
  if (!formattedUrl) return formattedUrl;

  // 如果已经有缩放参数，直接返回
  if (formattedUrl.includes("@")) return formattedUrl;

  // 只对 B站图片添加缩放参数
  if (formattedUrl.includes("hdslb.com") || formattedUrl.includes("bilivideo.com")) {
    return `${formattedUrl}@${width}w.webp`;
  }

  return formattedUrl;
};

export const getBiliVideoLink = (data: {
  type: "mv" | "audio";
  bvid?: string;
  sid?: string | number;
  pageIndex?: number;
}) => {
  return `https://www.bilibili.com/${data?.type === "mv" ? `video/${data?.bvid}${(data.pageIndex ?? 0) > 1 ? `?p=${data.pageIndex}` : ""}` : `audio/au${data?.sid}`}`;
};

export const openBiliVideoLink = (data: {
  type: "mv" | "audio";
  bvid?: string;
  sid?: string | number;
  pageIndex?: number;
}) => {
  window.electron.openExternal(getBiliVideoLink(data));
};

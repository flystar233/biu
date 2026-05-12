type AudioQuality = "auto" | "lossless" | "high" | "medium" | "low";
type ThemeMode = "system" | "light" | "dark";
type PageTransition = "none" | "fade" | "slide" | "scale" | "slideUp";

type ProxyType = "none" | "http" | "socks4" | "socks5";

interface ProxySettings {
  type: ProxyType;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
}

interface AppSettings {
  fontFamily: string;
  primaryColor: string;
  /** 自定义背景色（为空表示使用主题默认） */
  backgroundColor: string;
  borderRadius: number;
  downloadPath?: string;
  closeWindowOption: "hide" | "exit";
  autoStart: boolean;
  audioQuality: AudioQuality;
  hiddenMenuKeys: string[];
  displayMode: "card" | "list" | "compact";
  ffmpegPath?: string;
  themeMode: ThemeMode;
  pageTransition: PageTransition;
  showSearchHistory: boolean;
  proxySettings: ProxySettings;
  sideMenuCollapsed: boolean;
  sideMenuWidth: number;
  sideMenuCollectionFolded: {
    created: boolean;
    collected: boolean;
  };
  /** 本地音乐目录列表 */
  localMusicDirs: string[];
  /** 全屏播放器：显示歌词 */
  showLyrics: boolean;
  /** 全屏播放器：歌词字体颜色 */
  lyricsColor: string;
  /** 全屏播放器：显示频谱图 */
  showSpectrum: boolean;
  /** 全屏播放器：频谱图颜色 */
  spectrumColor: string;
  /** 全屏播放器：显示封面 */
  showCover: boolean;
  /** 全屏播放器：显示虚化背景 */
  showBlurredBackground: boolean;
  /** 全屏播放器：背景颜色 */
  fullScreenBackgroundColor: string;
  /** 搜索：仅音乐分区 */
  searchMusicOnly: boolean;
}

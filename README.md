# Biu 音乐播放器

基于哔哩哔哩（B 站）公开接口的跨平台桌面音乐播放器 🎧🎶

非官方项目，与哔哩哔哩无任何官方关联或背书

> 原仓库长期未维护，现由 [@flystar233](https://github.com/flystar233) 继续维护。本 Fork 专注于纯粹的 B 站音乐播放体验，不包含任何社交互动功能。

[![Latest Version](https://badgen.net/github/tag/flystar233/biu?label=%E6%9C%80%E6%96%B0%E7%89%88%E6%9C%AC&color=blueviolet)](https://github.com/flystar233/biu/releases)
[![License](https://img.shields.io/badge/license-PolyForm%20Noncommercial%201.0.0-orange.svg)](LICENSE)

---

## ✨ 特色功能
- 🎼 支持登录 Bilibili 并获取收藏夹、稍后再看、历史记录等信息
- 🎧 高品质音频播放，优先拉取更高码率音频流（如无损 Flac，192K/Hi-Res）
- 🔥 支持视频文件以及提取视频中的音频下载；支持收藏夹视频批量下载
- 🧩 轻量界面，内置浅色和深色主题，同时可自定义部分主题样式，细腻的滚动与动效体验
- 💿 系统托盘与最小化隐藏，便捷控制播放
- 🍃 支持 mini 播放器模式，占用系统资源少，同时保留主窗口功能
- ♻️ 安装包支持自动检测更新，始终保持最新体验

## 下载和使用
- 下载页面：[GitHub Releases](https://github.com/wood3n/biu/releases/latest)
- 快速选择：
  - <img alt="Windows" src="https://img.shields.io/badge/Windows-0078D6?logo=windows&logoColor=white" /> 优先选安装包 `win-setup`；需要免安装/无管理员权限选 `win-portable`
  - <img alt="macOS" src="https://img.shields.io/badge/macOS-000000?logo=apple&logoColor=white" /> 优先选 `dmg`；需要脚本/自动化分发可选 `zip`
  - <img alt="Linux" src="https://img.shields.io/badge/Linux-FCC624?logo=linux&logoColor=000000" /> 优先选 `AppImage`；偏好包管理器可选 `deb`/`rpm`；Arch Linux 用户可选 AUR

- 系统要求（建议）
  - <img alt="Windows" src="https://img.shields.io/badge/Windows-10%2F11-0078D6?logo=windows&logoColor=white" /> Windows 10 / 11（`x64` / `arm64`）
  - <img alt="macOS" src="https://img.shields.io/badge/macOS-12%2B-000000?logo=apple&logoColor=white" /> macOS 12+（`x64` / `arm64`）
  - <img alt="Linux" src="https://img.shields.io/badge/Linux-x64%2Farm64-FCC624?logo=linux&logoColor=000000" /> 主流 Linux 发行版（`x64` / `arm64`）
- 架构怎么选
  - Windows：设置 → 系统 → 关于 → “系统类型”（ARM 设备选 `arm64`，其余多为 `x64`）
  - macOS：Apple 芯片选 `arm64`，Intel 芯片选 `x64`
  - Linux：执行 `uname -m`，常见 `x86_64` 对应 `x64`，`aarch64` 对应 `arm64`
- 自动更新说明
  - 应用会定期检查 GitHub Releases，下载安装更新（多数安装方式均支持）。
  - Windows 免安装版（portable）在应用内下载更新受限，建议前往 Releases 手动下载替换。
- `*.yml`、`*.blockmap` 为自动更新辅助文件，手动下载时无需关注。
- 使用注意
  - 部分音频清晰度与解析可能需要登录或大会员权限。
  - 请遵循 Bilibili 使用条款，合理合规使用。

## 📄 许可证
本项目以 PolyForm Noncommercial License 1.0.0（非商业许可）发布，禁止任何商业用途。详情参见 [`LICENSE`](LICENSE)（SPDX：`PolyForm-Noncommercial-1.0.0`）。

---

如果你喜欢这个项目，欢迎 ⭐️ Star 支持！也欢迎提出 Issue 交流与反馈 🙌

## 🙏 鸣谢
- 特别感谢 [SocialSisterYi/bilibili-API-collect](https://github.com/SocialSisterYi/bilibili-API-collect) 对哔哩哔哩 API 的长期收集与整理，为本项目相关接口的使用提供了重要参考。
- 感谢 [@cjlworld](https://github.com/cjlworld) 为 Arch Linux 用户创建并维护了 [AUR 软件包](https://aur.archlinux.org/packages/biu-bin)，方便 Arch 用户通过 `paru -S biu-bin` 命令安装与更新。
- 在引用与使用相关资料时，我们遵循其许可条款（`CC-BY-NC 4.0`），仅用于学习与研究，不涉及任何商业用途。

## ⚖️ 法律声明与使用限制
- 本项目仅供学习与研究使用，禁止任何形式的商业用途（包括但不限于销售、收费服务、广告变现、商业集成等）。
- 本项目与 Bilibili 无任何官方关联或背书，不使用其商标与标识；涉及的名称与商标归其权利人所有。
- 数据来源于用户调用的公开接口与个人账户授权；使用时需遵守 Bilibili 的《用户协议》《社区规则》及相关法律法规。
- 禁止绕过登录/会员权限、DRM/加密措施，或进行批量爬取、恶意抓取等违反平台规则的行为。
- 如需商业授权或调整许可，请联系作者；如涉及权利或合规问题，请通过 Issues 反馈以便及时处理。
---

## 🤝 贡献指南
非常欢迎社区贡献！你可以按以下流程参与：

1. Fork 本仓库并创建分支：`feature/your-feature` / `fix/your-fix`
2. 开发并通过本地构建与基本自测（如：`pnpm dev`、`pnpm build`）
3. 提交 PR，详述改动点与影响范围
4. 通过 CI 的构建与审查后合入主分支

建议：
- 使用 ESLint/Prettier 保持代码风格一致（ESLint/Prettier 已配置）
- 提交信息简洁规范（推荐使用 `feat: ...`、`fix: ...` 等约定式格式）
- PR 中附上必要的截图或说明

## ♥️ Contributors

<a href="https://github.com/wood3n/biu/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=wood3n/biu" />
</a>

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=wood3n/biu&type=date&legend=top-left)](https://www.star-history.com/#wood3n/biu&type=date&legend=top-left)

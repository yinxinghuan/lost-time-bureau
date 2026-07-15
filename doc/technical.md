# 《时间遗失处》技术文档

## 1. 技术栈

- 框架：React 18；语言：TypeScript 5；构建：Vite 5，`base: './'`，产物为 `dist/`。
- 样式：Less；组件和 keyframes 统一使用 `ltb-` 前缀。
- 渲染：响应式 DOM。倒计时由 `requestAnimationFrame` 读取真实时间差，不运行持续物理模拟。
- 音频：Web Audio API 合成短音效；静音保存于 `lost-time-bureau-muted`。
- 素材：7 张来客肖像和 1 张海报，均为 Aigram transit 接口生成的 1024×1024 PNG；CSS 人像仅作加载失败回退。

## 2. 目录结构

```text
lost-time-bureau/
  doc/                         # requirements / visual / technical
  public/
    poster.png                 # meta 与列表封面
    portraits/                 # 7 位来客正式肖像
  src/LostTimeBureau/
    LostTimeBureau.tsx         # 屏幕组合、预载、暂停与反馈触发
    LostTimeBureau.less        # 视觉系统和响应式布局
    types.ts                   # 案件、证据、裁定类型
    data/cases.ts              # 7 案双语内容、资源变化与历史旗标
    hooks/useLostTimeBureau.ts # 状态机、计时、资源、分数、最佳分
    components/                # 统一 SVG 图标
    i18n/index.ts              # zh / en 固定界面文案
    utils/sounds.ts            # Web Audio 合成
  _assets/                     # transit 制作脚本与来源记录
  _qa/                         # Playwright 全流程脚本、截图和报告
```

## 3. 核心模块

### 状态与计时

- `useLostTimeBureau()` 管理 `start → case → reveal → result`，暂停是独立布尔状态。
- 每案从 24 秒开始。证据抽屉、暂停和页面进入后台都会冻结计时，恢复时补偿暂停时长。
- 裁定由 `resolveVerdict()` 计算资源与历史后果，`resolveProtocol()` 计算协议成败和关键理由；结果写入 `history`，旗标写入 `flags`。第四案读取第二案的 `future_map`，动态改变协议答案、稳定代价与揭晓文案。
- `reveal` 至少锁定 1.4 秒，之后才开放归档；不会自动跳过。

### 适配、资源与计分

- `.ltb` 使用 `min(100vw, 430px)` 和 `100dvh`；短屏媒体查询覆盖 320×568。
- 所有操作目标至少 44×44 CSS px，顶部与底部避让系统安全区。
- 因果稳定、人道信用均为 0–100；任一归零后在揭晓结束时进入失败结算。
- 三项证据均可直接打开，不设校准点或阅读门槛。
- 单案基础 100，证据完整 +25，剩余 8 秒以上 +20，协议判定成功 +35；总评再加 `min(双资源) × 10`。
- 最佳总评使用专属键 `lost-time-bureau-best`。

### 素材、音频与多语言

- 当前与下一案肖像会预载；换案时旧节点卸载。图片失败保留 CSS 回退，不阻塞证据和裁定。
- 音效覆盖开始、仪器、关闭抽屉、两类裁定与归档；音频失败不改变游戏状态。
- 固定 UI 通过轻量 `t()` 输出；案件正文使用 `LocalizedText` 提供 zh/en。语言写入 `game_locale`。

## 4. 扩展点

- **改案件 / 加案件**：编辑 `src/LostTimeBureau/data/cases.ts`，肖像放入 `public/portraits/`。
- **加跨案因果**：在裁定结果写入 `flag`，并在 `resolveVerdict()` 读取 `flags`。
- **调数值**：计时、资源和计分在 `hooks/useLostTimeBureau.ts`；协议答案与理由在 `data/cases.ts`。
- **换素材 / 视觉**：样式在 `LostTimeBureau.less`，图标在 `components/LineIcon.tsx`，制作提示词在 `_assets/generate_assets.py`。
- **调声音**：编辑 `utils/sounds.ts` 的频率、波形、时长和音量。
- **接排行榜 / 云存档**：以 `totalScore`、`history` 和最终双资源为载荷，以项目 UUID 为 `session_id`；当前版本仅保存本地最佳分。

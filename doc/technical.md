# 《时间遗失处》技术文档

## 1. 技术栈

- React 18 + TypeScript 5，Vite 5 构建，`base: './'`，产物输出到 `dist/`。
- Less 负责响应式竖屏布局；所有样式与 keyframes 使用 `ltb-` 前缀。
- 游戏以 DOM 状态界面渲染；倒计时使用 `requestAnimationFrame` 和真实时间差。
- Web Audio API 合成短音效，震动通过 `navigator.vibrate` 可选触发。
- 7 张人物肖像与海报为本地 PNG；不依赖运行时生图或网络资源。

## 2. 目录结构

```text
lost-time-bureau/
  doc/                         # 需求、视觉与技术文档
  public/
    poster.png                 # 开始页与游戏 meta 海报
    portraits/                 # 7 位来客肖像
  src/LostTimeBureau/
    LostTimeBureau.tsx         # 开始、判断、分层线索、三层揭晓、状态资讯、暂停与结算
    LostTimeBureau.less        # 深夜人物窗口视觉系统与响应式规则
    data/cases.ts              # 7 案双语内容、答案、后果与跨案旗标
    hooks/useLostTimeBureau.ts # 状态机、倒计时、内部资源、分数与历史最佳
    components/LineIcon.tsx    # 同线宽 SVG 图标
    i18n/index.ts              # zh / en 固定界面文案
    utils/sounds.ts            # Web Audio 与震动反馈
    types.ts                   # 案件、证据、裁定和本地化类型
  _qa/                         # Playwright 双尺寸全流程脚本、截图与报告
```

## 3. 核心模块

- `useLostTimeBureau()` 管理 `start → case → reveal → result`。线索和暂停会补偿倒计时，页面进入后台自动暂停。
- 判断页只消费人物姓名、对白和 3 个证据入口；职业、时间术语、内部资源与后果不常驻显示。
- `PortraitImage` 以案件 ID 重新挂载；当前与下一张图预载。新图在 `load/error` 或 1.2 秒保险任一路解除遮罩，失败时显示姓名首字剪影。
- 线索抽屉一次渲染一项证据，并把原有技术标签映射为“随身物品 / 他说的过去 / 会发生什么”。`ClueVisual` 分别绘制日期环、记忆轨迹和去留分叉；本地 `clueExpanded` 决定是否继续挂载文字细节。
- `resolveProtocol()` 计算判断对错与决定性理由；`resolveVerdict()` 计算叙事后果和内部两项城市状态。第 4 案读取第 2 案的 `future_map` 改变答案与后果。
- 揭晓使用本地 `revealStep` 分三层：人物上的对错印章；“你的选择 / 线索指向”对照；“原来 / 后来”双节点时间线。每层都由玩家主动推进。
- 顶部进度与倒计时合并为可点击状态入口。打开时复用暂停逻辑冻结计时，关闭后恢复；状态页显示当前人物缩略图、自然语言城市状态与三步规则。
- 单案分数为基础 100、全线索 +25、剩余至少 8 秒 +20、判断正确 +35；最终分加内部两项城市状态较低值的 10 倍。
- 最佳分保存在 `lost-time-bureau-best`；语言使用 `game_locale`，静音使用游戏专属键。

## 4. 扩展点

- **增加或修改人物**：编辑 `data/cases.ts`，并将同名图片放入 `public/portraits/`。
- **调整答案与跨案影响**：编辑 `resolveProtocol()`、`resolveVerdict()` 和案件 `flag`。
- **调整计时、得分和内部城市状态**：编辑 `hooks/useLostTimeBureau.ts`。
- **移动线索热点**：修改 `LostTimeBureau.tsx` 的 `cluePositions`。
- **改主界面、抽屉或双层揭晓**：编辑 `LostTimeBureau.tsx` 与 `LostTimeBureau.less`。
- **改自然语言 UI**：编辑 `i18n/index.ts`；案件对白与后果仍在 `data/cases.ts`。
- **改音效与震动**：编辑 `utils/sounds.ts`。
- **接排行榜或云存档**：以 `totalScore` 和 `history` 为载荷，使用项目永久 UUID 作为 `session_id`；当前版本仅保存本地最佳分。

# 《时间遗失处》技术文档

## 1. 技术栈

- React 18 + TypeScript 5，Vite 5 构建，`base: './'`，产物输出到 `dist/`。
- Less 负责 Modern Civic System 视觉层、窗口高度适配与安全区处理；所有样式和 keyframes 使用 `ltb-` 前缀。
- 游戏以 DOM 状态界面渲染；倒计时使用 `requestAnimationFrame` 和真实时间差。
- Web Audio API 合成短音效，震动通过 `navigator.vibrate` 可选触发。
- 7 张人物肖像、21 张说明书插画与英文海报均为本地资源；游戏运行不依赖网络生图。

## 2. 目录结构

```text
lost-time-bureau/
  doc/
    requirements.md            # 玩法与功能需求
    visual.md                  # Modern Civic System 视觉圣经
    technical.md               # 本文档
  public/
    poster.png                 # 开始页与游戏 meta 海报
    portraits/                 # 7 位来客肖像
    manual/                    # 7 案 × 3 类线索插画
    ui-review/                 # A/B/C 初始方向评审页
    ui-review-c/               # C 方向七状态垂直切片
  src/LostTimeBureau/
    LostTimeBureau.tsx         # 开始、判断、线索、揭晓、状态、地图、暂停与结算
    LostTimeBureau.less        # 正式 Modern Civic UI 与高度响应规则
    data/cases.ts              # 7 案双语内容、答案、后果与跨案旗标
    hooks/useLostTimeBureau.ts # 状态机、倒计时、分数与历史最佳
    components/LineIcon.tsx    # 同线宽 SVG 图标
    i18n/index.ts              # zh / en 固定界面文案
    utils/sounds.ts            # Web Audio 与震动反馈
    types.ts                   # 案件、证据、裁定和本地化类型
  _qa/
    vertical_slice_qa.cjs      # 双语言、双尺寸、七案件全流程测试
    height_adaptation_qa.cjs   # 四种窗口高度的几何与裁切测试
    visual-qa-report.md        # 正式界面视觉验收记录
```

## 3. 核心模块

- `useLostTimeBureau()` 管理 `start → case → reveal → result`。线索、状态、地图和暂停都会补偿倒计时，页面进入后台时自动暂停。
- `LostTimeBureau.tsx` 保持人物优先的交互结构：顶部当前人物/进度/倒计时入口，中部人物和 3 个线索热点，底部对白与两个裁定按钮。
- 开始页在海报上叠加 DOM 系统栏、案件色块和当晚来客信息；海报资源本身只包含英文标题。下半部使用游戏名、简短说明、三步玩法和唯一开始按钮。
- `LostTimeBureau.less` 以 `#101820` 结构黑、`#F1F2EF` 系统白、`#2E61D5` 公共蓝、`#F14D32` 警示红和 `#16856F` 成功绿构成统一硬网格；全界面只使用现代无衬线字体。
- 根容器固定为 `height: 100dvh` 且 `min-height: 0`。开始、判断、线索、揭晓、地图与结果页各自拥有独立的 `grid-template-rows`，而非复用一个通用弹窗比例；`minmax(0, 1fr)` 只分配给人物、说明或路线等指定伸缩区。`max-height: 700px` 时压缩标题、间距、按钮和插画，`min-height: 900px` 时把额外高度优先分配给人物与海报。
- 页面级滚动被关闭。地图节点和展开后的长说明分别在 `.ltb-map-route` 与 `.ltb-sheet__detail` 内部滚动；底部主操作始终留在视口内。顶部、底部间距使用 `env(safe-area-inset-*)`。
- `PortraitImage` 以案件 ID 重新挂载；当前与下一张人物图预载。新图在 `load/error` 或 1.2 秒保险任一路解除遮罩，失败时显示姓名首字占位。
- `ClueVisual` 优先展示 `public/manual/<case>-<evidence>.jpg`，加载前或失败时保留日期环、记忆轨迹和去留分叉 SVG 图示。线索页以整屏模式固定显示标题、图片、双事实格、说明和返回操作；因果回声用送回/留在现世两条时间线填充事实格。
- `resolveProtocol()` 计算判断对错与决定性理由；`resolveVerdict()` 计算叙事后果和两项城市状态。第 4 案读取第 2 案的 `future_map` 改变答案与后果。
- 揭晓使用本地 `revealStep` 分三层：绿/红结果横幅；“你的选择 / 线索指向”对照；后果插画与原来/后来时间线。每层都由玩家主动推进。
- 状态页读取当前人物、`stability` 与 `humanity`；时空图读取 `history`、`caseIndex` 和两项城市状态，7 个节点实时显示已留下、已送回、当前或尚未抵达。
- 单案分数为基础 100、全线索 +25、剩余至少 8 秒 +20、判断正确 +35；最终分加两项城市状态较低值的 10 倍。
- 最佳分保存在 `lost-time-bureau-best`；语言使用 `game_locale`，静音使用游戏专属键。

## 4. 扩展点

- **增加或修改人物**：编辑 `data/cases.ts`，将人物图放入 `public/portraits/`，并在 `public/manual/` 补齐 `<case>-object.jpg`、`<case>-memory.jpg`、`<case>-echo.jpg`。
- **调整答案与跨案影响**：编辑 `resolveProtocol()`、`resolveVerdict()` 和案件 `flag`。
- **调整计时、得分和城市状态**：编辑 `hooks/useLostTimeBureau.ts`。
- **移动线索热点**：修改 `LostTimeBureau.tsx` 的 `cluePositions`。
- **改 Modern Civic 配色、排版、窗口高度策略或状态布局**：编辑 `LostTimeBureau.less`；颜色变量集中在文件顶部，高度压缩与扩展规则集中在末尾媒体查询。
- **改开始页、HUD、线索层、揭晓层或地图结构**：编辑 `LostTimeBureau.tsx`，同步更新 `doc/visual.md` 与视觉 QA。
- **改自然语言 UI**：编辑 `i18n/index.ts`；案件对白与后果仍在 `data/cases.ts`。
- **改音效与震动**：编辑 `utils/sounds.ts`。
- **接排行榜或云存档**：以 `totalScore` 和 `history` 为载荷，使用项目永久 UUID 作为 `session_id`；当前版本仅保存本地最佳分。

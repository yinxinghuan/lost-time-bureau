# 《时间遗失处》技术文档

## 1. 技术栈

- React 18 + TypeScript 5，Vite 5 构建，`base: './'`，产物输出到 `dist/`。
- Less 负责响应式竖屏布局与“旧式内部档案”视觉层；所有样式与 keyframes 使用 `ltb-` 前缀。
- 游戏以 DOM 状态界面渲染；倒计时使用 `requestAnimationFrame` 和真实时间差。
- Web Audio API 合成短音效，震动通过 `navigator.vibrate` 可选触发。
- 7 张人物肖像与海报为本地 PNG，21 张说明书插画为本地 JPEG；不依赖运行时生图或网络资源。

## 2. 目录结构

```text
lost-time-bureau/
  doc/                         # 需求、视觉与技术文档
  public/
    poster.png                 # 开始页与游戏 meta 海报
    portraits/                 # 7 位来客肖像
    manual/                    # 7 案 × 3 类线索的说明书插画
  src/LostTimeBureau/
    LostTimeBureau.tsx         # 开始、判断、分层线索、三层揭晓、状态资讯、暂停与结算
    LostTimeBureau.less        # 深夜人物窗口 × 旧式官僚档案视觉系统与响应式规则
    data/cases.ts              # 7 案双语内容、答案、后果与跨案旗标
    hooks/useLostTimeBureau.ts # 状态机、倒计时、内部资源、分数与历史最佳
    components/LineIcon.tsx    # 同线宽 SVG 图标
    i18n/index.ts              # zh / en 固定界面文案
    utils/sounds.ts            # Web Audio 与震动反馈
    types.ts                   # 案件、证据、裁定和本地化类型
  _qa/                         # Playwright 双尺寸全流程脚本、截图与报告
  _assets/
    generate_assets.py         # 平台 transit 人物/英文海报生成与来源记录
    generate_manual_plates.py  # 平台 transit 生图、裁切、压缩与来源记录
    manual-generation.json     # 每张插画的接口、来源 URL 和完整 prompt
```

## 3. 核心模块

- `useLostTimeBureau()` 管理 `start → case → reveal → result`。线索和暂停会补偿倒计时，页面进入后台自动暂停。
- 判断页只消费人物姓名、对白和 3 个证据入口；职业、时间术语、内部资源与后果不常驻显示。顶部人物状态入口复用当前肖像缩略图，并把进度、倒计时与进入箭头合并成一个 44 px 高触控区。
- `LostTimeBureau.less` 使用纯 CSS 构成统一档案材料层：暖灰纸、暗蓝打字墨、暗红登记线、方格表、装订边与打孔；主界面仅在 HUD、人物窗口边框、口述记录和裁定按钮上使用这套语言，弹窗、揭晓和结算则完整采用档案页结构。纸纹由低对比度渐变生成，不增加图片请求。
- `generate_assets.py --poster --force` 使用线上旧海报作为公开 `ref_url`，通过 Aigram transit 重做英文海报并记录请求来源；请求和下载均调用系统 `curl`，避免本机 Python 证书链差异。
- 主人物窗口通过 `data-file="PSB-<case>"` 显示案卷编号；对白和裁定区通过本地化 `data-label` 生成“来客口述记录 / 裁定签署栏”等档案栏头，英文界面使用对应英文标签。
- `PortraitImage` 以案件 ID 重新挂载；当前与下一张人物图预载。新图在 `load/error` 或 1.2 秒保险任一路解除遮罩，失败时显示姓名首字剪影。每案开始时也并行预载该人物的 3 张说明书插画，但不阻塞人物和按钮。
- 线索抽屉一次渲染一项证据，并把原有技术标签映射为“随身物品 / 他说的过去 / 会发生什么”。`ClueVisual` 优先展示 `public/manual/<case>-<evidence>.jpg`，加载前或失败时保留日期环、记忆轨迹和去留分叉线稿；DOM 叠加真实读数，本地 `clueExpanded` 决定是否继续挂载文字细节。
- `resolveProtocol()` 计算判断对错与决定性理由；`resolveVerdict()` 计算叙事后果和内部两项城市状态。第 4 案读取第 2 案的 `future_map` 改变答案与后果。
- 揭晓使用本地 `revealStep` 分三层：人物上的对错印章；“你的选择 / 线索指向”对照；说明书后果图与“原来 / 后来”双节点时间线。每层都由玩家主动推进，后果图读取对应案件的 `echo` 插画并在失败时无缝省略。
- 顶部进度与倒计时合并为可点击状态入口。打开时复用暂停逻辑冻结计时，关闭后恢复；状态页显示当前人物缩略图、自然语言城市状态与三步规则。
- 独立“时空图”入口同样复用暂停/恢复逻辑。地图直接读取 `history`、`caseIndex`、`stability` 与 `humanity`：7 个节点分别推导为已留下、已送回、当前或尚未抵达，路线颜色与城市双流向会随每次裁定即时更新。
- 单案分数为基础 100、全线索 +25、剩余至少 8 秒 +20、判断正确 +35；最终分加内部两项城市状态较低值的 10 倍。
- 最佳分保存在 `lost-time-bureau-best`；语言使用 `game_locale`，静音使用游戏专属键。

## 4. 扩展点

- **增加或修改人物**：编辑 `data/cases.ts`，将同名人物图放入 `public/portraits/`，并在 `public/manual/` 补齐 `<case>-object.jpg`、`<case>-memory.jpg`、`<case>-echo.jpg`。
- **重做说明书插画**：修改 `_assets/generate_manual_plates.py` 的场景描述，通过 `--only <case>-<evidence> --force` 单张重做；脚本会调用 Aigram transit、裁掉易产生伪字的页眉页脚、压缩到 768×560，并把制作来源追加到 `manual-generation.json`。
- **调整答案与跨案影响**：编辑 `resolveProtocol()`、`resolveVerdict()` 和案件 `flag`。
- **调整计时、得分和内部城市状态**：编辑 `hooks/useLostTimeBureau.ts`。
- **移动线索热点**：修改 `LostTimeBureau.tsx` 的 `cluePositions`。
- **改主界面、档案材料、抽屉或三层揭晓**：编辑 `LostTimeBureau.tsx` 与 `LostTimeBureau.less`；档案纸、登记红线、蓝墨与红墨集中定义在 Less 文件的 `@file`、`@rule`、`@blueInk`、`@redInk` 等变量中。
- **改顶部人物入口或时空图**：在 `LostTimeBureau.tsx` 调整 `MiniPortrait`、HUD 与地图节点结构，在 `LostTimeBureau.less` 调整 `ltb-hud-*`、`ltb-map-*`；地图状态来自现有 `history`，无需新增存储。
- **改自然语言 UI**：编辑 `i18n/index.ts`；案件对白与后果仍在 `data/cases.ts`。
- **改音效与震动**：编辑 `utils/sounds.ts`。
- **接排行榜或云存档**：以 `totalScore` 和 `history` 为载荷，使用项目永久 UUID 作为 `session_id`；当前版本仅保存本地最佳分。

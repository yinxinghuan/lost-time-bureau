# Modern Civic System 垂直切片视觉 QA

## Context

- 范围：独立 HTML 评审切片，不替换当前线上游戏 UI。
- 状态：Start、Decision、Clue、Correct、Incorrect、Map、Result。
- 尺寸：桌面评审容器、390×844、320×568。
- 语言：英文优先。
- 证据：`_qa/ui/c-slice-*.png`。

## Executive assessment

- Decision：可交用户评审。
- P0 / P1 / P2：0 / 0 / 0。
- 主判定页人物仍为第一焦点；HUD、对白与按钮使用同一硬网格。
- `CORRECT / INCORRECT` 同时使用明确文字、勾/叉 SVG、绿/红色块和选择对照，不依赖长文案或单一颜色。

## Scorecard

| Category | Score |
|---|---:|
| Hierarchy | 4.8 |
| Coherence | 4.8 |
| Readability | 4.8 |
| Game feel | 4.5 |
| Asset quality | 4.5 |
| Responsive UX | 4.7 |
| Polish | 4.6 |

平均 4.67 / 5；无类别低于 3。

## Foundation audit

- 功能 Emoji：0；地图、关闭、搜索、正确与错误均为同族 SVG。
- 字体：只使用 Helvetica Neue / Arial / Noto Sans SC 无衬线回退。
- 触控目标：全部可见按钮在三种尺寸均 ≥44×44 px。
- 横向溢出：桌面、390 px 与 320 px 均为 0。
- 控制台：三种尺寸、七个状态均 `errors: []`。
- 状态覆盖：开始、主判断、线索、成功、失败、地图与结算均有真实截图。

## Iteration evidence

- 第一轮问题 P1：状态切换时隐藏页仍参与可见按钮与高度计算，暗色方案曾出现旧页面叠层。C 切片从一开始采用 `visibility + opacity + pointer-events` 三重隔离。
- 第一轮问题 P1：320×568 的开始页正文高度超过设备容器，开始按钮不可见。
- 修复：短屏开始页改为 48% / 52% 画面分区，缩短标题、步骤和间距；按钮恢复在首屏底部。
- 第一轮问题 P2：现有海报的英文标题会与现代案件编号栏重叠，形成残缺字样。
- 修复：海报上缘增加纯黑系统栏，完整遮住素材标题，只显示 DOM 的 `CITY ROUTING · NIGHT SHIFT`；游戏名在下方现代排版中输出。
- 匹配复验：320×568 的 Start、Decision、Clue、Correct、Result 均重新截图；所有主操作可达且无文本裁切。

## Final recommendation

等待用户确认方向 C 的完整切片；确认前不迁移游戏本体。

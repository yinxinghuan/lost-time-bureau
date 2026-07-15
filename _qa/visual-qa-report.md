# 《时间遗失处》视觉 QA 报告

## Context

- 范围：整套 UI 重做；保留现有海报和 7 张人物肖像。
- 对照目标：《午夜验客》的“人物优先、热点查看、分层揭晓”交互。
- 尺寸：390×844、320×568；中文、正常动态。
- 证据：`_qa/ui/*.png` 与 `_qa/ui/report.json`。

## Executive assessment

- Decision：Pass。
- P0 / P1 / P2：0 / 0 / 0。
- 主判断页已移除资源条、三张仪器卡、职业年代字段、操作说明标题与按钮副标题。
- 常驻内容只剩人物、姓名、对白、3 个热点、可点击状态栏和两个判断按钮；线索细节、判断依据与后果均逐层展开。

## Scorecard

| Category | Score |
|---|---:|
| Hierarchy | 4.8 |
| Coherence | 4.6 |
| Readability | 4.7 |
| Game feel | 4.7 |
| Asset quality | 4.5 |
| Responsive UX | 4.7 |
| Polish | 4.7 |

平均 4.67 / 5；无类别低于 3。

## Foundation audit

- 功能 Emoji：0；放大镜、对错、暂停、关闭与声音均使用同一组 SVG。
- 触控目标：两种尺寸所有可见按钮均 ≥44×44 px。
- 颜色独立性：判断按钮有文字；结果同时使用图标、巨大文字与颜色。
- 溢出：两尺寸均满足 `body.scrollWidth === clientWidth`。
- 控制台：两次完整 7 人流程均 `errors: []`。
- 状态：开始、判断、状态资讯、暂停、线索图形、线索细节、判对、判错、选择对照、后果时间线和结算均有真实截图。

## Iteration evidence

- 初版问题：高屏开始页使用 `object-fit: cover`，海报上方英文标题被横向裁切。
- 修复：海报改为固定上限高度与 `object-fit: contain`，高屏和短屏均保留完整标题和主体。
- 第二轮问题：线索与判定弹窗仍以纯文字为主，用户必须阅读长段落才能理解。
- 修复：三类线索加入日期环、记忆轨迹与去留分叉；线索细节改为可选第二层；判定改为“对错 → 选择对照 → 双节点时间线”三层；顶部状态栏可展开人物资料、城市状态与规则。
- 结构复验：`stillReveal: true`、`compareVisible: true`、`reportVisible: true`、`failureVisible: true`；每一层均由玩家主动推进。
- 小屏复验：320×568 展开细节后“看完了”仍在当前视口；所有可见触控目标 ≥44 px，横向溢出为 0。

## Final recommendation

允许进入发布门禁。

# 《时间遗失处》视觉 QA 报告

## Context

- Build: `lost-time-bureau` production build。
- 范围：完整 7 案、暂停、证据抽屉、直接裁定、成功与失败揭晓、历史回响、结算。
- 依据：`doc/requirements.md`、`doc/visual.md`。
- 尺寸：390×844、320×568；中文、正常动态。
- 证据：`_qa/ui/*.png`、`_qa/ui/report.json`、`_qa/ui/poster-160.png`。

## Executive assessment

- Decision: Pass。
- P0 / P1 / P2: 0 / 0 / 0。首轮“正式肖像仍使用占位尺寸”的 P1 已修复并匹配复验。
- 最大优势：深蓝、黄铜、档案窗与正式肖像形成同一机构世界；“关键证据—判定成败—时间后果”的阅读层级明确。
- 主要成本：肖像总量约 7 MB；已限制为只预载当前与下一案。

## Scorecard

| Category | Score |
|---|---:|
| Hierarchy | 4.5 |
| Coherence | 4.5 |
| Readability | 4.7 |
| Game feel | 4.5 |
| Asset quality | 4.3 |
| Responsive UX | 4.5 |
| Polish | 4.3 |

平均 4.47 / 5；无类别低于 3。

## Foundation audit

- 功能 Emoji：0；图标均为同线宽 SVG。
- 触控目标：`report.json` 所有可见按钮宽高均 ≥44px。
- 颜色独立性：资源变化同时使用文字、正负号、数值和颜色。
- 状态覆盖：start / case / evidence / pause / success reveal / failure reveal / result 均有真实截图。
- 溢出：两尺寸均满足 `body.scrollWidth === clientWidth`。
- 控制台：两次全流程 `errors: []`。

## Art-direction audit

- 蓝、铜、琥珀、米白色盘与宋体标题符合视觉圣经。
- 7 张肖像共享档案窗、冷暖灯光和统一裁切；CSS 人像只作回退。
- 常态动效克制，分线和撕裂只在揭晓升级。
- 海报 1024 原图与 160×160 缩略图均能识别标题、来客、档案员和双历史冲突。

## Iteration evidence

- 首轮：人物以 190×230 显示，在高屏观察窗中过小。
- 修复：肖像改为响应式正方形并在观察窗垂直居中；揭晓态单独限宽。
- 第二轮反馈：文字层级繁复，玩家无法快速确认裁定成功或失败。
- 修复：移除校准额度与长按预演；开屏加入三步上岗提示；裁定改为直接点按；揭晓顶部加入大字号成功/失败结果牌与关键证据理由；结算加入 `成功数 / 7`。
- 复验：390×844 与 320×568 完整 7 案均通过，`failureVisible: true`、`echoVisible: true`、`stillReveal: true`，过小触控目标与横向溢出均为 0。

## Final recommendation

允许进入发布门禁。

# 《时间遗失处》Modern Civic 正式界面视觉 QA

## Context

- 范围：将已确认的 C / Modern Civic System 从 HTML 垂直切片迁移到正式 React 游戏。
- 覆盖：开始、判断、线索、线索细节、状态、暂停、时空图、判对、判错、选择对照、后果时间线与结算。
- 尺寸：320×568、390×844、430×932、844×390。
- 语言：中文完整七案件流程；英文 320×568 主判断与地图；高度测试使用英文。
- 证据：`_qa/ui/*.png`、`_qa/ui/report.json`、`_qa/ui/height-report.json`。

## Executive assessment

- Decision：Pass。
- P0 / P1 / P2：0 / 0 / 0。
- 正式游戏已移除旧纸、登记线、装订孔、手写批注、衬线和打字机字体。
- 人物仍是判断页第一焦点；正确与错误用文字、勾/叉、绿/红色块和选择对照共同说明。
- 页面高度由 `100dvh` 与内部 Grid 驱动；短屏压缩、长屏扩展，不使用固定设备高度或整页 transform。

## Scorecard

| Category | Score |
|---|---:|
| Hierarchy | 4.9 |
| Coherence | 4.9 |
| Readability | 4.8 |
| Game feel | 4.7 |
| Asset quality | 4.8 |
| Responsive UX | 4.9 |
| Polish | 4.8 |

平均 4.83 / 5；无类别低于 3。

## Foundation audit

- 功能 Emoji：0；地图、关闭、搜索、暂停、声音、正确与错误均使用同族 SVG。
- 字体：正式 Less 只使用 Helvetica Neue / Arial / Noto Sans SC / PingFang SC 无衬线回退。
- 触控目标：完整流程中所有可见按钮均 ≥44×44 px。
- 横向溢出：320 px 与 390 px 完整流程均满足 `body.scrollWidth === clientWidth`。
- 控制台：中文两次完整七案件流程与英文短屏流程均 `errors: []`。
- 状态覆盖：开始、判断、状态、暂停、线索、判对、判错、选择对照、后果图、实时地图和结算均有真实截图。
- 本地化：英文 320×568 的 `CURRENT`、`MAP`、`LET STAY`、`SEND BACK`、`BACK TO VISITOR` 无裁切。
- 颜色独立性：判断结果同时包含图标、明确文字和色块；选择对照也显示双方文字。
- 海报：正式资源维持英文标题；开始页上的语言内容由 DOM 根据当前语言渲染，不写入海报位图。

## Window-height audit

`height_adaptation_qa.cjs` 对每个尺寸依次进入 Start、Case、Clue 和 Map，并检查根容器高度、页面滚动高度、按钮裁切与最小触控尺寸。

| Viewport | Root height | Page scroll height | Clipped buttons |
|---|---:|---:|---:|
| 320×568 | 568 | 568 | 0 |
| 390×844 | 844 | 844 | 0 |
| 430×932 | 932 | 932 | 0 |
| 844×390 | 390 | 390 | 0 |

- 四种窗口均满足根容器高度等于 `innerHeight`。
- `body` 与 `documentElement` 没有页面级纵向溢出。
- 地图列表在内容区内部滚动，底部 `BACK TO VISITOR` 始终固定在当前视口。
- 320×568 的人物、对白、线索计数和两个裁定按钮全部同屏可见。
- 430×932 的额外高度分配给海报与人物，不产生大段无意义空白。

## 设计稿对齐复验（2026-07-16）

- 发现：首轮正式迁移只同步了 Modern Civic 的颜色、字体和边框，没有把 C 垂直切片的页面网格同步到 React 组件；后果线索页、详细理由层、地图和结算因此出现比例漂移或无意义留白。
- 修复：线索页改为“标题栏 / 插画 / 双事实格 / 说明 / 返回”五段式；判定改为顶部 `CORRECT / INCORRECT` 横幅、人物、选择对照和下一步；地图改为中央时间线；结算改为顶部得分、居中结局和底部操作。
- 响应式策略：固定信息区保留自身高度，只让说明区、人物图和路线区在可用高度内弹性伸缩；短屏进入明确的 60 px 标题栏、145 px 最低插画和 46 px 按钮规格。
- 复验：同一套 390×844 与 320×568 全流程截图均无控制台错误、横向溢出或小于 44 px 的可见操作；四种高度检查均 `failures: []`。

## Interaction and state evidence

- `stillReveal: true`：第一次结果冲击不会自动消失，玩家主动点击“看看为什么”后才进入下一层。
- `compareVisible: true`：选择对照层明确显示“你的选择 / 线索指向”。
- `reportVisible: true`：后果插画和时间线保持到玩家主动继续。
- `failureVisible: true`：错误态同样完整展示，不与成功态混淆。
- `mapInitialVisible: true`、`mapLiveVisible: true`：初始与完成三次裁定后的地图均可读，节点状态会实时变化。

## Final recommendation

允许构建、提交、发布并进行线上缓存绕过复验。

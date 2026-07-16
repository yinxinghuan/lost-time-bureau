# Modern Civic System 垂直切片合同

## Global environment

- 类型：响应式竖屏 DOM；评审页外层允许桌面说明，真实界面保持 390×844。
- 输入：鼠标、触控与键盘；所有操作均有可见焦点。
- 安全区：顶部预留 24 px，底部主按钮距 home indicator 至少 16 px。
- 本地化：评审切片使用英文；正式迁移继续支持 zh / en。

## Screen contract

| 状态 | 玩家问题 | 第一焦点 | 主操作 | 次操作 | 恢复路径 |
|---|---|---|---|---|---|
| Start | 这是什么、怎么玩？ | 海报中的时间裂缝 | START NIGHT SHIFT | 查看简短规则 | 无 |
| Decision | 这个人该留下还是送回？ | 人物与 3 个热点 | LET STAY / SEND BACK | 线索、地图 | 暂停菜单 |
| Clue | 这条线索说明什么？ | 图示与 2 个事实 | BACK TO VISITOR | 无 | 关闭按钮 |
| Correct | 我的判定成功了吗？ | CORRECT 与选择关系 | SEE CONSEQUENCE | 查看原因 | 下一层 |
| Incorrect | 我的判定失败了吗？ | INCORRECT 与关键线索 | SEE CONSEQUENCE | 查看原因 | 下一层 |
| Map | 今晚的选择如何改变路线？ | 7 节点路线 | BACK TO VISITOR | 无 | 关闭按钮 |
| Result | 这一局结果如何？ | 5 / 7 与结局 | RUN ANOTHER SHIFT | 无 | 重新开始 |

## Component state matrix

| Component | Default | Pressed | Focus | Disabled | Loading | Success/error |
|---|---|---|---|---|---|---|
| Primary button | 蓝底黑边 | 下移 3 px | 蓝色 3 px 外框 | 灰底 + UNAVAILABLE | 顶部线性进度 | 绿/红色块 + 文字 |
| Secondary button | 白底黑边 | 下移 3 px | 蓝色 3 px 外框 | 灰底 | 保留尺寸 | 不适用 |
| Clue hotspot | 白底方形 | 阴影归零 | 蓝色外框 | 斜线灰底 | 细线扫过 | 已读显示蓝色编号 |
| Route node | 黑边圆点 | 不可操作 | 不适用 | 低对比 | 不适用 | 蓝=留下，红=送回，并带文字 |

## Feedback matrix

| Event | 即时反馈 | 结果反馈 | 强度 | 下一步 | Reduced motion |
|---|---|---|---:|---|---|
| 点线索 | 热点下移 2 px | 160 ms 切入事实页 | 1 | 返回人物 | 100 ms 淡入 |
| 提交裁定 | 按钮锁定、阴影归零 | 220 ms 显示 CORRECT / INCORRECT | 4 | 查看后果 | 立即显示结果 |
| 打开地图 | 图标反色 | 320 ms 路线依次出现 | 2 | 返回人物 | 路线直接出现 |
| 完成一局 | 数字从 0 到 5 | 结局条变为公共蓝 | 3 | 再来一局 | 数字直接显示 |

## QA evidence

- 390×844：Start、Decision、Clue、Correct、Incorrect、Map、Result。
- 320×568：Decision、Clue、Correct、Result。
- 验证无横向溢出、可见按钮 ≥44 px、无控制台错误、状态切换不叠层。

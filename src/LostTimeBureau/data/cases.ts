import type { CaseFile, LocalizedText, ProtocolDecision, Verdict, VerdictResult } from '../types'

const tx = (zh: string, en: string): LocalizedText => ({ zh, en })

export const caseFiles: CaseFile[] = [
  {
    id: 'lin-mo',
    name: tx('林默', 'LIN MO'),
    meta: tx('电车检票员 · 申报年代 1937', 'Tram conductor · Declared era 1937'),
    quote: tx('“我只是穿过隧道。出站以后，所有人都在看手里的发光玻璃。”', '“I only walked through the tunnel. At the exit, everyone was staring into glowing glass.”'),
    portrait: 'lin-mo.png',
    evidence: [
      { id: 'object', label: tx('物证年代', 'Material Date'), value: tx('1937.08.12', '1937.08.12'), detail: tx('铜质票钳磨损 12 年，合金比例符合 1920 年代工艺；证件并非仿造。', 'The brass punch shows twelve years of wear and a 1920s alloy profile. The papers are authentic.') },
      { id: 'memory', label: tx('记忆连续', 'Memory Continuity'), value: tx('连续 / 无断层', 'CONTINUOUS'), detail: tx('主观时间只过去 11 分钟。他记得隧道停电、车厢倾斜，以及一名尚未获救的孩子。', 'Only eleven subjective minutes passed. He remembers the blackout, the tilting carriage, and a child not yet rescued.') },
      { id: 'echo', label: tx('因果回声', 'Causal Echo'), value: tx('双重锚点', 'DUAL ANCHOR'), detail: tx('送回原线可使 17 人避开事故；林默会在救援中死亡。留下则事故按旧记录发生。', 'Returning him saves seventeen people. Lin Mo dies during the rescue. Keeping him preserves the recorded disaster.') },
    ],
    verdicts: {
      stay: { stabilityDelta: -12, humanityDelta: 10, title: tx('裁定：留在现世', 'RULING: KEEP IN PRESENT'), summary: tx('林默获得新的身份。旧事故仍发生，但他此后用余生寻找那名未能救出的孩子。', 'Lin Mo receives a new identity. The old crash remains, and he spends his life searching for the child he failed to save.'), timelinePast: tx('1937 · 原事故未改变', '1937 · The crash remains'), timelineFuture: tx('2049 · 一名迟到的幸存者', '2049 · A survivor who arrived late'), flag: 'lin_stayed' },
      return: { stabilityDelta: 13, humanityDelta: -15, title: tx('裁定：送回原线', 'RULING: RETURN TO LINE'), summary: tx('他回到停电后的第 43 秒，打开变形车门。17 人获救；档案里从此多出一位无名死者。', 'He returns forty-three seconds after the blackout and forces open the door. Seventeen survive; one nameless casualty enters the archive.'), timelinePast: tx('1937 · 17 人获救', '1937 · Seventeen rescued'), timelineFuture: tx('2049 · 城市记住了无名者', '2049 · The city remembers a nameless man'), flag: 'tram_memorial' },
    },
  },
  {
    id: 'ada-voss',
    name: tx('艾达·沃斯', 'ADA VOSS'),
    meta: tx('水文制图师 · 申报年代 2096', 'Hydrographic cartographer · Declared era 2096'),
    quote: tx('“你们把河道盖住了。它没有消失，只是在等这座城忘记它。”', '“You paved over the river. It did not vanish. It is waiting for the city to forget it.”'),
    portrait: 'ada-voss.png',
    evidence: [
      { id: 'object', label: tx('物证年代', 'Material Date'), value: tx('聚合纸 / 2091', 'POLYMER SHEET / 2091'), detail: tx('地图使用尚未发明的盐析墨水；标注的地下水位与本局今日实测完全一致。', 'The map uses an uninvented salt-precipitation ink. Its groundwater marks match today’s Bureau reading.') },
      { id: 'memory', label: tx('记忆连续', 'Memory Continuity'), value: tx('47 年 / 稳定', '47 YEARS / STABLE'), detail: tx('她能准确回忆尚未发生的三次洪水，也记得童年住在今天仍是一座车站的区域。', 'She accurately recalls three future floods and a childhood home where a station still stands today.') },
      { id: 'echo', label: tx('因果回声', 'Causal Echo'), value: tx('知识污染', 'KNOWLEDGE LEAK'), detail: tx('留下地图可提前疏浚旧河道，但会让 2096 年的制图任务失去发生原因。', 'Keeping the map enables early dredging, but removes the reason her 2096 survey was ever commissioned.') },
    ],
    verdicts: {
      stay: { stabilityDelta: -9, humanityDelta: 12, title: tx('裁定：留在现世', 'RULING: KEEP IN PRESENT'), summary: tx('艾达把未来洪线交给城市。旧河道重新出现，2096 年却第一次变成一片空白。', 'Ada gives the city its future flood lines. The buried river reappears; for the first time, 2096 becomes blank.'), timelinePast: tx('2049 · 旧河道被重新标记', '2049 · The old river is marked again'), timelineFuture: tx('2096 · 一张未被绘制的地图', '2096 · A map never drawn'), flag: 'future_map' },
      return: { stabilityDelta: 8, humanityDelta: -8, title: tx('裁定：送回原线', 'RULING: RETURN TO LINE'), summary: tx('地图随她回到洪水后的年代。城市保持无知，也保持了时间上的干净。', 'The map returns with her to the years after the flood. The city keeps its ignorance—and its clean chronology.'), timelinePast: tx('2049 · 河道继续沉睡', '2049 · The river stays buried'), timelineFuture: tx('2096 · 洪水后的第一张图', '2096 · The first map after the flood'), flag: 'future_flood' },
    },
  },
  {
    id: 'zhen-ye',
    name: tx('甄野', 'ZHEN YE'),
    meta: tx('急诊医生 · 申报年代 1986 / 实际年龄 34', 'Emergency doctor · Declared era 1986 / physical age 34'),
    quote: tx('“病历说我出生六分钟后死亡。可我记得是谁把保温箱的电重新接上了。”', '“The chart says I died six minutes after birth. I remember who reconnected the incubator.”'),
    portrait: 'zhen-ye.png',
    evidence: [
      { id: 'object', label: tx('物证年代', 'Material Date'), value: tx('身份冲突 / 真', 'IDENTITY CONFLICT / TRUE'), detail: tx('出生记录与死亡记录都通过纸张老化验证；此人 DNA 也与记录中的婴儿完全一致。', 'Both birth and death records pass paper-aging tests. His DNA also matches the recorded infant exactly.') },
      { id: 'memory', label: tx('记忆连续', 'Memory Continuity'), value: tx('34 年 / 借入', '34 YEARS / BORROWED'), detail: tx('他的童年记忆来自一条本城从未经历的历史，但其中 11 名患者如今真实存在。', 'His childhood belongs to a history this city never lived, yet eleven of his former patients exist here.') },
      { id: 'echo', label: tx('因果回声', 'Causal Echo'), value: tx('生命债 11', 'LIFE DEBT 11'), detail: tx('留下他会创造一名“没有出生却救过人”的医生；送回则 11 名患者失去被救的原因。', 'Keeping him creates a doctor who was never born. Returning him removes the reason eleven patients survived.') },
    ],
    verdicts: {
      stay: { stabilityDelta: -14, humanityDelta: 14, title: tx('裁定：留在现世', 'RULING: KEEP IN PRESENT'), summary: tx('甄野成为本局第一名“死后公民”。11 名患者的病历开始长出新的签名。', 'Zhen Ye becomes the Bureau’s first posthumous citizen. Eleven medical charts grow a new signature.'), timelinePast: tx('1986 · 一名婴儿仍被记录为死亡', '1986 · An infant remains recorded dead'), timelineFuture: tx('2049 · 11 份病历出现同一医生', '2049 · Eleven charts gain one doctor'), flag: 'posthumous_citizen' },
      return: { stabilityDelta: 11, humanityDelta: -13, title: tx('裁定：送回原线', 'RULING: RETURN TO LINE'), summary: tx('甄野回到那条救活他的历史。这里的 11 名患者仍活着，却再也说不出是谁救了他们。', 'Zhen Ye returns to the history that saved him. Eleven patients remain alive here, but can no longer name their rescuer.'), timelinePast: tx('1986 · 保温箱重新通电', '1986 · The incubator powers on'), timelineFuture: tx('2049 · 11 段无主的幸存', '2049 · Eleven ownerless survivals'), flag: 'orphaned_survivals' },
    },
  },
  {
    id: 'armand-kline',
    name: tx('阿尔芒·克莱因', 'ARMAND KLINE'),
    meta: tx('城市结构工程师 · 申报年代 2124', 'Urban structural engineer · Declared era 2124'),
    quote: tx('“我设计的不是避难所，是你们脚下这座城市的第二层。”', '“I did not design a shelter. I designed the second layer of the city beneath your feet.”'),
    portrait: 'armand-kline.png',
    evidence: [
      { id: 'object', label: tx('物证年代', 'Material Date'), value: tx('自修复混凝土 / 2118', 'SELF-HEALING CONCRETE / 2118'), detail: tx('样本含有在未来洪水后才出现的菌群；其结构可承受旧河道回流。', 'The sample contains a bacterial strain that appears only after the future flood. Its structure survives the old river’s return.') },
      { id: 'memory', label: tx('记忆连续', 'Memory Continuity'), value: tx('城市记忆 76%', 'CITY MEMORY 76%'), detail: tx('他的个人记忆大量由建筑空间构成；其中部分街区会随当前裁定实时改变。', 'His memory is largely architectural. Several districts change inside it as rulings alter the present.') },
      { id: 'echo', label: tx('因果回声', 'Causal Echo'), value: tx('依赖前案', 'PRIOR FILE DEPENDENCY'), detail: tx('若本局已保留未来洪图，他的工程可被验证；否则蓝图可能正是洪灾发生的诱因。', 'If the Bureau kept the future flood map, his work can be verified. Without it, the blueprint may itself cause the flood.') },
    ],
    verdicts: {
      stay: { stabilityDelta: -8, humanityDelta: 9, title: tx('裁定：留在现世', 'RULING: KEEP IN PRESENT'), summary: tx('阿尔芒开始建造城市的第二层。若未来洪图仍在，这是预防；若不在，这可能是预言。', 'Armand begins the city’s second layer. With Ada’s map, it is prevention. Without it, it may be prophecy.'), timelinePast: tx('2049 · 地下工程提前开工', '2049 · The undercity begins early'), timelineFuture: tx('2124 · 建造者失去原始委托', '2124 · The builder loses his original commission'), flag: 'undercity' },
      return: { stabilityDelta: 9, humanityDelta: -7, title: tx('裁定：送回原线', 'RULING: RETURN TO LINE'), summary: tx('蓝图被封入未来。眼下的城市维持原样，只把洪水风险留给尚未出生的人。', 'The plans are sealed in the future. Today’s city stays unchanged and leaves its flood risk to the unborn.'), timelinePast: tx('2049 · 城市地基保持原样', '2049 · Foundations stay unchanged'), timelineFuture: tx('2124 · 灾后重建仍会发生', '2124 · Reconstruction still follows disaster'), flag: 'deferred_city' },
    },
    echoFlag: 'future_map',
    echoText: tx('前案回响：艾达的洪图已与此蓝图吻合，留置的稳定代价减少 6。', 'PRIOR ECHO: Ada’s map matches this blueprint. Keeping him costs 6 less stability.'),
  },
  {
    id: 'qiu-lan',
    name: tx('邱岚', 'QIU LAN'),
    meta: tx('街区护士 · 申报年代 1967', 'District nurse · Declared era 1967'),
    quote: tx('“你们说没有青石街。那为什么每个雨夜，我都听见那里的人敲窗？”', '“You say Bluestone Street never existed. Then who knocks on my window every rainy night?”'),
    portrait: 'qiu-lan.png',
    evidence: [
      { id: 'object', label: tx('物证年代', 'Material Date'), value: tx('地址不存在', 'ADDRESS DOES NOT EXIST'), detail: tx('药箱、钥匙和门牌都来自同一街区；城市所有正式地图却从未记录过它。', 'Her medical bag, key, and house plate share one address. No official city map has ever recorded it.') },
      { id: 'memory', label: tx('记忆连续', 'Memory Continuity'), value: tx('418 人共享', 'SHARED BY 418'), detail: tx('418 名市民梦见同一条街，其细节与邱岚记忆一致；他们彼此没有亲缘关系。', 'Four hundred eighteen citizens dream of the same street in exact detail. They are unrelated.') },
      { id: 'echo', label: tx('因果回声', 'Causal Echo'), value: tx('集体抹除', 'COLLECTIVE ERASURE'), detail: tx('留下她会使街区重新进入历史，取代现有车站；送回会让 418 人在一夜间忘记同一个梦。', 'Keeping her restores the district and replaces an existing station. Returning her makes 418 people forget the same dream overnight.') },
    ],
    verdicts: {
      stay: { stabilityDelta: -16, humanityDelta: 15, title: tx('裁定：留在现世', 'RULING: KEEP IN PRESENT'), summary: tx('青石街在凌晨 3:12 重新出现在地图上。车站消失，418 户人家亮起灯。', 'Bluestone Street returns to the map at 3:12 AM. A station vanishes and 418 homes turn on their lights.'), timelinePast: tx('1967 · 街区逃过一次抹除', '1967 · The district escapes erasure'), timelineFuture: tx('2049 · 418 户重新拥有地址', '2049 · 418 homes regain addresses'), flag: 'bluestone_restored' },
      return: { stabilityDelta: 12, humanityDelta: -14, title: tx('裁定：送回原线', 'RULING: RETURN TO LINE'), summary: tx('邱岚带着钥匙回到没有出口的街。雨停时，418 个人同时忘记自己曾梦见一扇窗。', 'Qiu Lan returns with her key to a street with no exit. When the rain stops, 418 people forget the same window.'), timelinePast: tx('1967 · 街区被完整抹除', '1967 · The district is fully erased'), timelineFuture: tx('2049 · 梦境恢复安静', '2049 · The shared dream goes quiet'), flag: 'bluestone_erased' },
    },
  },
  {
    id: 'mara-9',
    name: tx('玛拉九号', 'MARA NINE'),
    meta: tx('深空返航员 · 申报年代 2188', 'Deep-space returnee · Declared era 2188'),
    quote: tx('“我不是复制品。我们只是两个人都记得成为同一个人的那一天。”', '“I am not a copy. We are two people who both remember the day we became the same person.”'),
    portrait: 'mara-9.png',
    evidence: [
      { id: 'object', label: tx('物证年代', 'Material Date'), value: tx('同位体双生', 'ISOTOPIC TWIN'), detail: tx('她与 2049 年仍在轨道上的玛拉拥有相同原子误差，两个身体都不是人工复制。', 'She and the Mara currently in orbit share the same atomic error. Neither body is manufactured.') },
      { id: 'memory', label: tx('记忆连续', 'Memory Continuity'), value: tx('分叉后 9 年', '9 YEARS AFTER FORK'), detail: tx('两人的记忆在一次引力折返前完全一致，此后各自连续生活了九年。', 'Their memories match until a gravitational slingshot, then continue independently for nine years.') },
      { id: 'echo', label: tx('因果回声', 'Causal Echo'), value: tx('身份容量 1', 'IDENTITY CAPACITY 1'), detail: tx('现行法律只允许一个玛拉存在；时间物理却允许两个。送回会让她抵达已经有“自己”的飞船。', 'Current law permits one Mara. Physics permits two. Returning her sends her to a ship where she already exists.') },
    ],
    verdicts: {
      stay: { stabilityDelta: -10, humanityDelta: 14, title: tx('裁定：留在现世', 'RULING: KEEP IN PRESENT'), summary: tx('本局为玛拉九号签发第二人格身份。城市第一次承认“同一个过去”可以属于两个人。', 'The Bureau issues Mara Nine a second legal identity. For the first time, one past may belong to two people.'), timelinePast: tx('2049 · 两个玛拉同时存在', '2049 · Two Maras coexist'), timelineFuture: tx('2188 · 身份不再等于唯一', '2188 · Identity no longer means singular'), flag: 'plural_identity' },
      return: { stabilityDelta: 10, humanityDelta: -16, title: tx('裁定：送回原线', 'RULING: RETURN TO LINE'), summary: tx('两位玛拉在同一舱门相遇。记录只保留了一个返回者，无法说明另一个去了哪里。', 'Two Maras meet at the same airlock. The record keeps one returnee and cannot explain where the other went.'), timelinePast: tx('2049 · 身份仍保持唯一', '2049 · Identity remains singular'), timelineFuture: tx('2188 · 一段记录自相覆盖', '2188 · One record overwrites itself'), flag: 'singular_identity' },
    },
  },
  {
    id: 'director-zero',
    name: tx('零号主任', 'DIRECTOR ZERO'),
    meta: tx('现世安置局创建者 · 申报年代 未登记', 'Founder, Present Settlement Bureau · Era unregistered'),
    quote: tx('“时间裂缝不是灾难。它是这间机构为了证明自己必要而制造的第一个案件。”', '“The fracture was not a disaster. It was the first case this Bureau created to prove it was necessary.”'),
    portrait: 'director-zero.png',
    evidence: [
      { id: 'object', label: tx('物证年代', 'Material Date'), value: tx('局徽原模 / 明日', 'ORIGINAL SEAL / TOMORROW'), detail: tx('他携带的局徽比本局现有模具早磨损 61 年，材料却将在明天才完成合成。', 'His seal predates this Bureau’s die by sixty-one years, yet its alloy will only be synthesized tomorrow.') },
      { id: 'memory', label: tx('记忆连续', 'Memory Continuity'), value: tx('含本次值班', 'CONTAINS THIS SHIFT'), detail: tx('他能逐字复述你今晚的每一份裁定，包括尚未归档的犹豫。', 'He recites every ruling from tonight, including hesitations not yet archived.') },
      { id: 'echo', label: tx('因果回声', 'Causal Echo'), value: tx('机构闭环', 'INSTITUTIONAL LOOP'), detail: tx('留下他，裂缝持续但来客保留新生活；送回他，裂缝关闭，今晚所有安置身份一并被撤销。', 'Keep him and the fracture persists while visitors retain their lives. Return him and the fracture closes, revoking every identity granted tonight.') },
    ],
    verdicts: {
      stay: { stabilityDelta: -18, humanityDelta: 14, title: tx('最终裁定：允许多重历史', 'FINAL RULING: ALLOW PLURAL HISTORY'), summary: tx('零号主任留在自己创建的机构里。时间不再只有一条正确答案，而本局失去宣称中立的资格。', 'Director Zero remains inside the institution he founded. Time loses its single correct answer, and the Bureau loses its claim to neutrality.'), timelinePast: tx('起点 · 裂缝被承认为选择', 'ORIGIN · The fracture becomes a choice'), timelineFuture: tx('未来 · 多条历史共享城市', 'FUTURE · Many histories share one city'), flag: 'plural_city' },
      return: { stabilityDelta: 18, humanityDelta: -18, title: tx('最终裁定：关闭机构闭环', 'FINAL RULING: CLOSE THE LOOP'), summary: tx('零号主任被送回机构成立前一日。裂缝闭合，档案恢复整齐；今晚留下的人开始从城市记忆中褪色。', 'Director Zero returns to the day before the Bureau’s founding. The fracture closes, the archive becomes orderly, and tonight’s residents fade from memory.'), timelinePast: tx('起点 · 本局从未制造裂缝', 'ORIGIN · The Bureau never makes the fracture'), timelineFuture: tx('未来 · 一条整洁而孤独的历史', 'FUTURE · One clean and lonely history'), flag: 'closed_loop' },
    },
  },
]

export function resolveVerdict(file: CaseFile, verdict: Verdict, flags: Set<string>): VerdictResult {
  const base = file.verdicts[verdict]
  if (file.id === 'armand-kline' && verdict === 'stay' && flags.has('future_map')) {
    return {
      ...base,
      stabilityDelta: -2,
      summary: tx('艾达的洪图与阿尔芒的蓝图完全吻合。城市第二层提前开工，时间悖论被一次跨年代合作部分抵消。', 'Ada’s flood map perfectly matches Armand’s plan. The undercity starts early, and a collaboration across eras offsets part of the paradox.'),
    }
  }
  return base
}

const protocol: Record<string, ProtocolDecision> = {
  'lin-mo': { verdict: 'return', reason: tx('关键证据：送回可让 17 人避开已经发生的事故。', 'Key evidence: returning him prevents the recorded deaths of seventeen people.') },
  'ada-voss': { verdict: 'stay', reason: tx('关键证据：她的洪图与今日地下水读数完全一致。', 'Key evidence: her flood map exactly matches today’s groundwater readings.') },
  'zhen-ye': { verdict: 'stay', reason: tx('关键证据：11 名真实患者的存活依赖他的医疗经历。', 'Key evidence: eleven living patients depend on his medical history.') },
  'armand-kline': { verdict: 'return', reason: tx('关键证据：没有未来洪图佐证时，他的工程可能制造灾难。', 'Key evidence: without the future flood map, his project may cause the disaster.') },
  'qiu-lan': { verdict: 'stay', reason: tx('关键证据：418 人共享同一段街区记忆，证明它曾真实存在。', 'Key evidence: 418 people share the same district memory, proving it once existed.') },
  'mara-9': { verdict: 'stay', reason: tx('关键证据：两位玛拉都拥有连续九年的独立人生。', 'Key evidence: both Maras have lived nine continuous, independent years.') },
  'director-zero': { verdict: 'return', reason: tx('关键证据：送回创建者可以关闭制造裂缝的机构闭环。', 'Key evidence: returning the founder closes the institutional loop that created the fracture.') },
}

export function resolveProtocol(file: CaseFile, flags: Set<string>): ProtocolDecision {
  if (file.id === 'armand-kline' && flags.has('future_map')) {
    return { verdict: 'stay', reason: tx('关键证据：艾达的洪图已验证这份蓝图，它现在是预防方案。', 'Key evidence: Ada’s flood map validates the plan; it is now a prevention measure.') }
  }
  return protocol[file.id]
}

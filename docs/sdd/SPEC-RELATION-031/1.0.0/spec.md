---
spec_id: SPEC-RELATION-031
title: "统一真实朋友圈内容流与来源筛选"
version: 1.0.0
status: approved
level: L2
project: "关系·今天"
surface: "PC 本机 hosted-stateful HTML 原型"
tenants: "房总个人专用 / bzds"
owner: "房总"
author: "Codex E1/E2"
constitution: "prototype-sdd@1.4.0"
depends_on_specs: "SPEC-RELATION-002@1.0.0, SPEC-RELATION-008@1.0.0, SPEC-RELATION-010@1.0.0, SPEC-RELATION-021@1.0.0, SPEC-RELATION-022@1.0.0, SPEC-RELATION-023@1.0.0, SPEC-RELATION-027@1.0.0, SPEC-RELATION-028@1.0.0, SPEC-RELATION-029@1.0.0"
last_updated: 2026-08-20
---

# 统一真实朋友圈内容流与来源筛选

## 1. 审核摘要

- **用户问题**：数据来源页把全部 `graph.signals` 都放进“真实朋友圈工作台”，导致碎银群聊 `group_context` 也被当成朋友圈；卡片仍可能把原始数字时间直接显示，并以真实 signal ID 驱动 DOM 动作。页面每次搜索还会重算、排序全部 signals 并重绘整个数据来源页。房总既无法只看真正朋友圈，也无法按“我的微信 / 碎银官方人设”安全对比来源。
- **完成后变化**：工作台只显示有可信朋友圈来源的真实 moment；微信已有 moment 继续显示，碎银群上下文彻底排除。卡片显示发布者、格式化时间、正文、媒体文字描述和精确来源标签；来源多选按 OR、与文本搜索按 AND。碎银朋友圈在生产 MCP 提供 persona-filtered read-only moments 能力前明确阻断，不用群聊或 mock 补位。
- **本次范围**：真实 moment 资格投影、legacy 微信 moment 兼容、来源标签与多选筛选、安全时间/opaque action token、50 卡分页、generation-scoped 只读缓存、200ms 搜索防抖、feed 局部刷新与纯虚构 10k/20k 性能验收。
- **明确不做**：不展示或迁移 `group_context`、不把聊天 excerpts 当朋友圈、不读取真实数据做测试、不为碎银朋友圈伪造接口、不修改生产 MCP/Flutter/Go、不改变 T028/T029 的范围与回执语义。
- **需要房总拍板**：审核本规格整体是否通过；没有待选的替代方案。
- **AI 新提案**：无；本规格按房总明确给出的真实朋友圈、来源、隐私和性能口径收敛。

## 2. 用户问题与预期结果

### 2.1 用户与场景

- 用户角色：房总。
- 触发场景：在 `#/sources` 查看已经加密保存的真实朋友圈，并按采集账号核对内容。
- 当前做法：`queryGraphSignals` 查询所有 signal；微信 moment 与碎银群上下文混在同一“朋友圈”列表，搜索每次整页重渲染。

### 2.2 用户问题

“真实朋友圈”目前只是一层标题，不是严格的数据资格。群聊消息、原始 epoch、内部 stable ID 和粗粒度来源名都可能进入同一渲染链，既容易误解内容来源，也让大数据量下的筛选变慢。碎银朋友圈尚无上游读取能力，却没有与碎银群聊做足够明确的能力隔离。

### 2.3 完成后用户能感受到的变化

房总打开工作台时只看到真正的朋友圈内容卡。每张卡都能看懂“谁发布、什么时候、说了什么、是否有媒体文字描述、从我的微信还是哪个碎银官方人设采集”。搜索和来源筛选不会让整页卡顿；无法读取的碎银朋友圈会直接说明上游能力缺失，不会拿群聊冒充。

### 2.4 成功信号

| ID | 可观察信号 | 判定方式 |
|---|---|---|
| O001 | feed 中只存在 trusted moment，0 `group_context` / chat excerpt | fictional domain + UI oracle |
| O002 | “我的微信 / 碎银 · 官方人设”来源多选 OR，与文本搜索 AND | fictional combined-filter oracle |
| O003 | 卡片 0 顺序编号、0 raw epoch、0 source/person/signal ID 或 raw alias | public DOM/privacy canary |
| O004 | 10k/20k moments 时 live cards≤50，搜索 latest-wins 200ms，来源页其他区域不重绘 | fictional performance + partial-render oracle |
| O005 | 碎银 moments capability 缺失时明确 upstream-blocked，T028/T029 回归保持 | source capability + regression oracle |

## 3. 范围

### 3.1 In Scope

- 朋友圈 feed 的严格资格：显式 canonical moment，或来自 active trusted WeChat source、符合现有 moment shape 的 legacy 无 `kind` signal。
- 微信已有 `graph.signals` moment 的只读展示、搜索、身份/分类筛选和既有显式分类动作。
- future Suiyin moment 的 source contract：必须由 exact persona-filtered、read-only、稳定分页的 upstream MCP 返回；每条 moment 有稳定 source-owned identity、发布者、时间、正文/媒体文字描述和精确 persona attribution。
- 来源标签只投影为 `我的微信` 或 `碎银 · {官方人设名}`；filter token 与内部 ID/alias 分离。
- 来源多选同组 OR；与 200ms 文本搜索、既有身份和分类条件按 AND 组合；任一条件变化回到第 1 页。
- 卡片显示发布者、安全格式化时间、正文或“无文字”、媒体文字描述、来源标签、身份和分类状态。
- generation-scoped、session-only 的只读 moment 投影/排序缓存；每页最多 50 卡；搜索和筛选只刷新 feed sink。
- checking、unavailable、ready-empty、filtered-empty、populated、debouncing、stale、classification-saving/error、upstream-blocked、legacy-compatible 和 overflow 状态。
- AES-GCM graph、backup/reopen、source removal/purge、T028 current-allocation partial、T029 batch receipt 的回归验证。

### 3.2 Out of Scope

- `kind="group_context"`、无 `personId` 群上下文、聊天 excerpt 或任意聊天正文进入朋友圈 feed。
- 读取、展示或推断碎银朋友圈，直至 production MCP 满足本 source contract；不以 mock、空数组、群聊或全租户扫描降级。
- 根据昵称、正文、列表顺序、source displayName、ID 末位或人物全局 badge 猜 source persona。
- 打开时迁移 legacy graph、自动重读微信/碎银、自动写 cache/graph，或要求用户因刷新重新导入。
- 展示顺序编号、raw epoch、sourceId/personId/signalId、raw client/WC/customer ID、safe alias、文件路径、DirectoryHandle。
- 改两张数据来源卡的六项统计；该结果属于独立后续规格。
- 修改 `E:/dev/suiyin_mcp`、Flutter / React / Go 或 exporter；正式 Issue/Handoff 只定义生产交付合同，不授权本工作区实现、commit/push/tag/deploy/完整推送。

### 3.3 适用矩阵

| 端 / 租户 | 是否适用 | 继承的 Profile | 差异 |
|---|---|---|---|
| 房总 PC 本机 / 当前 Chrome profile | 是 | OPERATIONAL-RELATION-031 | 本机 AES-GCM graph；微信 moment 可用，碎银 moment upstream-blocked |
| 其他端、租户或共享服务 | 否 | none | 不提供入口、不共享数据 |

## 4. 证据与来源

| ID | 类型 | 来源 | 支持的结论 | 可信状态 |
|---|---|---|---|---|
| E001 | USER | 2026-08-20 房总本轮明确口径 | 真正朋友圈流、来源筛选、去编号、隐私与性能 | confirmed |
| E002 | SPEC | SPEC-RELATION-008@1.0.0 | 朋友圈来源、身份与敏感内容边界 | confirmed |
| E003 | SPEC | SPEC-RELATION-010@1.0.0 | 真实微信 moment、50/页；碎银朋友圈 unsupported；group context 非人物 | confirmed |
| E004 | SPEC | SPEC-RELATION-021/027/028@1.0.0 | official persona label、collection location、三账号 complete/partial 边界 | confirmed |
| E005 | SPEC | SPEC-RELATION-022/023@1.0.0 | generation 恢复、0重导、10k有界投影与200ms latest search | confirmed |
| E006 | SPEC | SPEC-RELATION-029@1.0.0 | 微信批次/选择/导入/导出时间不可互相冒充 | confirmed |
| E007 | PROTO | `prototype/local-vault.js` `queryGraphSignals/renderGraphSignalPage` | 当前查询全部 signals、全量排序、raw timestamp/ID进入卡片链 | confirmed |
| E008 | PROTO | `scripts/suiyin-mcp-client.mjs` current staging | Suiyin 当前只生成 friend excerpts 与 group_context signals，未提供 moments | confirmed |

### 4.1 已发现冲突

- T010 的页面标题和目标是“真实朋友圈”，但当前实现查询全部 `graph.signals`，从而把后加入的 Suiyin `group_context` 混入。T031 在 feed 资格范围内取代这种宽查询；T010 对 group context 的保存、分析与不可分类边界继续有效。
- T027 的“所在微信”是人物 mapping 的采集 lineage。T031 只复用其安全标签语义，不得拿人物的所有 locations 反推某一条 moment；moment 来源必须来自该记录自己的 exact source provenance。
- T028 的 current-allocation partial 不含 Suiyin moments，且 persona-complete 仍 upstream-blocked。T031 不改变 29/26/3、13/13/16528 或任何 complete CTA。
- T029 的 `selectedAt/importedAt/exportedAt` 是 source receipt 时间，不是 moment 发布时间。T031 卡片时间只来自该 moment 的 trusted published time。

### 4.2 精确规格依赖

| 依赖 | 用途 | 失效条件 |
|---|---|---|
| `SPEC-RELATION-002@1.0.0` | AES-GCM graph、backup、source lifecycle | 版本或批准态变化 |
| `SPEC-RELATION-008@1.0.0` | moment 身份、敏感与线索边界 | 同上 |
| `SPEC-RELATION-010@1.0.0` | 真实微信 moment、50/页、Suiyin unsupported | 同上 |
| `SPEC-RELATION-021@1.0.0` | Suiyin official label registry | 同上 |
| `SPEC-RELATION-022@1.0.0` | generation、重开与 stale 边界 | 同上 |
| `SPEC-RELATION-023@1.0.0` | 大数据量只读缓存、防抖和0写原则 | 同上 |
| `SPEC-RELATION-027@1.0.0` | `我的微信 / 碎银 · official` 标签语义 | 同上 |
| `SPEC-RELATION-028@1.0.0` | persona cohort/partial/upstream blocker | 同上 |
| `SPEC-RELATION-029@1.0.0` | source receipt 与时间语义回归 | 同上 |

## 5. 用户场景与验收

### US01 — 只查看真正朋友圈

#### AC-R001-01 — moment 资格与群上下文排除

- Given graph 同时含 trusted WeChat moment、Suiyin `group_context`、普通 excerpt、unknown signal 和 invalid source。
- When 打开朋友圈 feed。
- Then 只显示有可信 moment 资格且 source active 的记录；`group_context`、excerpt、unknown/untrusted signal 均不渲染、不计数，原 graph 内容不被删除或迁移。

#### AC-R002-01 — legacy 微信 moment 0写兼容

- Given 旧 graph 的 signal 缺 `kind`，但属于 active trusted WeChat exporter source，并具有既有 moment shape。
- When 打开、筛选或重开。
- Then 只在只读 projection 中视为 moment，来源显示“我的微信”；0 graph/cache write、0 open-time migration。相同 shape 若来自 Suiyin/unknown source，不得因此变成 moment。

### US02 — 按来源和文本组合筛选

#### AC-R003-01 — exact safe 来源标签

- Given 微信 moment、未来 exact Suiyin persona moments、legacy/冲突来源混合。
- When 投影卡片和来源选项。
- Then 微信只显示“我的微信”；Suiyin 只显示 registry 中 exact official label `碎银 · {name}`；冲突或缺 attribution 的记录不猜号、不进入官方 persona 选项。

#### AC-R004-01 — 来源 OR、文本 AND

- Given 来源多选、文本、身份和分类筛选组合。
- When 选择多个来源并输入文本。
- Then 来源同组 OR；来源结果与文本、身份、分类按 AND；无来源选择等于全部 eligible moments；任一筛选变化回到第 1 页并显示真实组合计数与 filtered-empty 文案。

### US03 — 卡片可读且不泄漏内部标识

#### AC-R005-01 — 内容卡字段

- Given moment 有发布者、正文、媒体文字描述与 published time 的不同空值组合。
- When 渲染。
- Then 每卡显示发布者、来源标签、格式化时间、正文或“无文字”、可选媒体文字描述、身份和分类；不显示顺序编号。长正文/媒体描述可换行或折叠，但可访问文本完整。

#### AC-R006-01 — 时间与 opaque token

- Given ISO、受支持 legacy epoch、无效时间和内部 source/person/signal IDs。
- When 投影与触发分类。
- Then 内部先把有效时间规范化后显示 `YYYY-MM-DD HH:mm`；无效显示“时间未记录”，永不输出 raw epoch。DOM/action/log/error 中 0 source/person/signal ID、0 raw alias；分类只用与 current generation 绑定的 ephemeral opaque token，stale token 0写。

### US04 — 大内容流仍保持响应

#### AC-R007-01 — 50卡、generation cache 与局部刷新

- Given 10,000/20,000 条纯虚构 eligible moments 和同量级非 moment signals。
- When 首开、翻页、组合筛选、连续输入与 generation 变化。
- Then 每页/live DOM cards≤50；同 graph reference + active generation 的资格/安全来源/排序基础投影只计算一次；200ms latest-wins search；筛选、搜索、翻页只刷新 feed sink，不重绘来源卡、回执、备份区；所有只读动作 graph/cache write=0。

#### AC-R008-01 — stale、错误与恢复

- Given 搜索 timer、分类 token 或 projection cache 在 generation 变化后过期。
- When 旧回调到达。
- Then 旧结果丢弃；新 generation 重建只读缓存并保持当前仍有效的安全 filter；分类 stale 明确提示且0写，不要求重导。

### US05 — 碎银朋友圈能力不冒充可用

#### AC-R009-01 — upstream capability gate

- Given current production MCP 只有 allocations/customers/history，没有 persona-filtered read-only moments API。
- When 打开 feed 或查看碎银来源说明。
- Then 微信 moment 正常显示；碎银朋友圈状态为 `UPSTREAM_SUIYIN_MOMENTS_UNAVAILABLE`，不调用伪接口，不显示 mock/0条成功，不把 `group_context` 补进 feed。

#### AC-R010-01 — upstream 到位后的合规入口

- Given future deployed MCP 经另行生产流程提供 exact persona filter、stable pagination/completeness receipt 和安全 moment shape。
- When T031 source contract 重新审核并由新 task contract 授权。
- Then 才允许 Suiyin moments 进入 staging/feed；当前 `1.0.0 approved` 文档与 Handoff 只授权建单，不授权本工作区实现生产仓或真实读取。

### US06 — 保留既有来源与回执事实

#### AC-R011-01 — T028/T029 回归

- Given current-allocation partial、persona-complete upstream blocker、微信 reimport receipt 与 legacy source。
- When 实现或使用 feed。
- Then T028 的范围/计数/0-delete/official registry 与 T029 的 diff/CAS/batch/time/0迁移完全不变；feed projection 不修改 source receipt。

## 6. 业务规则

| ID | 规则 | 级别 | 来源 | Profile Override | 验收覆盖 |
|---|---|---|---|---|---|
| R001 | feed 只接纳 trusted moment；`group_context`、excerpt、unknown/untrusted signal 永不进入朋友圈卡片或计数 | MUST | E001/E003/E007/E008 | OP-031 | AC-R001-01 |
| R002 | legacy 无 `kind` 仅可在 active trusted WeChat source + existing moment shape 下只读兼容；0 migration/write | MUST | E001/E003/E007 | OP-031 | AC-R002-01 |
| R003 | 来源标签只来自 exact record provenance：WeChat=`我的微信`，Suiyin=`碎银 · official`；内容/昵称/顺序/全局人物badge不参与推断 | MUST | E001/E004 | OP-031 | AC-R003-01 |
| R004 | 来源多选 OR，与文本/身份/分类 AND；无来源选择=全部 eligible；变化回第1页 | MUST | E001/E003 | 无 | AC-R004-01 |
| R005 | 卡片显示发布者、格式化时间、正文/空态、媒体文字描述、来源、身份、分类；0顺序编号 | MUST | E001 | 无 | AC-R005-01 |
| R006 | raw epoch与内部ID/alias不得进入DOM/log/error；动作只用generation-bound opaque token，stale 0写 | MUST | E001/E005/E007 | OP-031 | AC-R006-01/AC-R008-01 |
| R007 | 每页/live cards≤50；同generation基础投影只算一次；搜索200ms latest-wins；feed局部刷新 | MUST | E001/E003/E005 | OP-031 | AC-R007-01 |
| R008 | 搜索/筛选/翻页/投影cache均session-only、0 graph/cache write；generation变化fail closed重建 | MUST | E005 | OP-031 | AC-R007-01/AC-R008-01 |
| R009 | current MCP缺persona-filtered moments时固定upstream-blocked；禁止group_context/mock/tenant scan兜底 | MUST | E001/E003/E008 | OP-031 | AC-R009-01 |
| R010 | Suiyin moment only在future capability经生产流程落地、source contract重审和新contract签发后可接入 | MUST | E001/E004/E008 | OP-031 | AC-R010-01 |
| R011 | T028 partial/persona blocker与T029 diff/receipt/time/legacy语义不得被feed改变 | MUST | E004/E006 | OP-031 | AC-R011-01 |

### 6.1 不变量

- INV001：朋友圈 feed 中永远没有 `group_context` 或 chat excerpt。
- INV002：Suiyin 朋友圈不可用不等于 0 条，也不等于当前分配聊天已完整读取。
- INV003：记录来源只能由该记录自身的 trusted source/persona provenance 决定。
- INV004：UI 永不显示 raw epoch、内部 stable ID、raw alias 或顺序编号。
- INV005：只读 feed 操作永不写 graph、persistent cache 或 source receipt。
- INV006：T028/T029 的计数、范围、CAS、回执、时间与 legacy 边界保持。

### 6.2 默认值与配置

| 参数 | 默认值 | 配置粒度 | 来源 | 是否可改 |
|---|---|---|---|---|
| page size | 50 | feed | E001/E003 | 否 |
| text debounce | 200ms latest-wins | feed | E001/E005 | 否 |
| source selection | 空集合=全部 eligible | session | E001 | 可由用户修改 |
| source combination | OR；与其他筛选AND | session | E001 | 否 |
| time display | `YYYY-MM-DD HH:mm` / `时间未记录` | feed | E001 | 需升版 |
| Suiyin moments | upstream-blocked | bzds current capability | E008 | 能力与合同升级后重审 |

## 7. 状态与交互

### 7.1 状态模型

| 当前状态 | 事件 | 条件 | 下一状态 | 用户反馈 | 规则 |
|---|---|---|---|---|---|
| vault-checking | 打开来源页 | graph未恢复 | checking | 正在恢复；数量— | R008 |
| vault-unavailable | 重试 | 无graph | unavailable/checking | 数据未删除、不要求重导 | R008 |
| ready | 建立projection | current generation | populated/empty | 真实总数或真实空态 | R001/R007 |
| populated | 输入搜索 | 任意 | debouncing | 保留当前结果；200ms后latest刷新 | R004/R007 |
| populated | 改来源/身份/分类 | 任意 | filtered/filtered-empty | page=1、组合计数 | R004 |
| populated | 分类 | confirmed moment + current token | saving | 仅该动作写业务generation | R006 |
| saving | stale/failure | token过期或commit失败 | populated/error | 0 stale write、可重试 | R006/R008 |
| any ready | generation变化 | graph更新 | rebuilding | 丢弃旧timer/token/cache | R008 |
| no Suiyin capability | 查看碎银状态 | upstream缺失 | upstream-blocked | 明确接口未提供 | R009 |

### 7.2 状态覆盖矩阵

| 对象 | rest | hover / pressed | focus | selected | disabled | loading | empty | error | overflow | permission |
|---|---|---|---|---|---|---|---|---|---|---|
| 来源多选 | 全部 | 可见反馈 | focus ring | 安全label+数量 | vault未ready | 重建projection | 无选项 | conflict排除 | 长label换行 | 房总本机 |
| moment卡 | 内容卡 | 动作反馈 | 卡内动作可聚焦 | 分类态 | pending不可分类 | 单卡saving | 无文字 | 时间/来源安全fallback | 正文折叠可展开 | confirmed才分类 |
| feed分页 | 第N页 | 可见反馈 | 可聚焦 | N/A | 首末页 | 局部刷新 | 真实空态 | cache重建 | N/A | 只读 |
| upstream提示 | blocked | N/A | 可读文本 | N/A | Suiyin入口不可用 | N/A | N/A | typed reason | 长说明换行 | 不跨生产仓 |

### 7.3 进入、退出与恢复

- 入口：`#/sources` 的“真实朋友圈内容流”。
- 关闭 / 返回：保留本次 session 筛选；不写 graph/cache。
- 取消：分类动作未提交则0写；筛选无需取消。
- 重复操作：相同筛选结果幂等；相同generation projection复用。
- 刷新 / 重开：从 encrypted committed graph恢复；0自动picker、0自动MCP、0 migration。
- 失败后恢复：projection重建或分类重试；不要求重新导入。

### 7.4 文案合同

| 场景 | 文案 | 为什么这样写 | 禁止写法 |
|---|---|---|---|
| 标题 | 真实朋友圈内容流 | 只含moment | 真实signal工作台 |
| 微信来源 | 我的微信 | 采集位置事实 | 微信导出·归属待核对（作为moment来源标签） |
| Suiyin来源 | 碎银 · 官方人设名 | exact registry | 碎银1/2/3（无官方事实时猜号） |
| Suiyin blocked | 当前碎银接口未提供按官方人设读取朋友圈；群聊不会出现在这里 | 诚实能力 | 碎银朋友圈0条 / 已读取 |
| 无效时间 | 时间未记录 | 不泄漏raw值 | 原始epoch数字 |
| 真实空态 | 当前加密关系图中没有可显示的真实朋友圈 | 不回退mock | 暂无数据（同时显示虚构卡） |
| 筛选空态 | 没有同时匹配当前来源和搜索条件的朋友圈 | 说明组合关系 | 数据丢失 |

## 8. 数据、权限与隐私

### 8.1 展示数据

| 字段 | 来源 | 必填 | 空值表现 | 示例 | 敏感性 |
|---|---|---|---|---|---|
| publisherLabel | trusted person/moment projection | 是 | 不合格记录不展示 | 林栖（虚构） | 敏感 |
| publishedAtLabel | normalized moment time | 否 | 时间未记录 | 2026-08-20 09:30 | 敏感 |
| body | encrypted moment text | 否 | 无文字 | 今天把项目收尾了（虚构） | 高敏感 |
| mediaDescription | exporter/MCP safe text description | 否 | 不显示媒体行 | 图片：晚霞（虚构） | 高敏感 |
| sourceLabel | exact trusted source/persona projection | 是 | 不合格记录排除 | 我的微信 / 碎银 · 林一（虚构） | 敏感 |
| identity/classification | encrypted graph state | 是 | 待确认 | 已确认 / 可作为话题 | 敏感 |
| actionToken | session ephemeral token | 动作时是 | 无动作则不生成 | opaque | 内部 |

### 8.2 权限

| 角色 | 可见 | 可操作 | 不可操作 | 反馈 |
|---|---|---|---|---|
| 房总 | 当前本机加密graph中的eligible moments | 搜索、筛选、翻页、合规分类 | 自动读取、推断来源、发送、上传 | 本机状态与typed reason |
| 其他用户 | 无 | 无 | 访问本机库 | 无入口 |

### 8.3 隐私与租户隔离

- feed 只运行在当前 browser profile + loopback origin；0登录、0云同步、0外发。
- source/person/signal ID、raw account alias、raw epoch、path/handle不进入DOM、log、error、toast、report。
- 真实正文只在房总本机业务UI按既有权限显示；测试、报告和性能证据全部使用code-authored fictional fixture。
- action token 只在当前页面session/current generation有效，不能反推真实ID。

## 9. 端与租户差异

| Base 规则 | PC | APP | Admin | 租户 Override |
|---|---|---|---|---|
| R001–R011 | 本机Sources feed | 不适用 | 不适用 | 仅房总/bzds；Suiyin capability当前blocked |

## 10. 原型实现契约

- **目标原型仓**：`E:/AI 项目/关系维护助手`。
- **目标文件 / 路由**：未来批准后可修改 `prototype/local-vault.js`、`prototype/index.html` 与focused fictional tests；路由保持 `#/sources`。
- **必须复用的 tokens / 组件**：现有 moment card、source badge、pagination、vault transition、T023 generation projection/debounce模式、T027 opaque filter token。
- **必须模拟的状态**：mixed moment/group-context、legacy kindless WeChat、source conflict、invalid time、10k/20k、debounce stale、generation stale、upstream-blocked。
- **关键 mock 数据**：全部code-authored fictional names/body/IDs/times；privacy canary不可对应真人。
- **只模拟、不承诺真实联通的能力**：Suiyin moments adapter不创建stub；只展示固定upstream-blocked状态。
- **预览入口**：批准并实现后使用 isolated empty-profile `http://127.0.0.1:8765/prototype/index.html?refresh=T031-preview#/sources`。

### 10.1 规则到页面映射

| 规则 | 页面 / 组件 | 用户如何触发 | 如何验证 |
|---|---|---|---|
| R001/R002 | feed query/projection | 打开/重开 | AC-R001-01/AC-R002-01 |
| R003/R004 | 来源筛选 | 多选+搜索 | AC-R003-01/AC-R004-01 |
| R005/R006 | moment card/action | 浏览/分类 | AC-R005-01/AC-R006-01 |
| R007/R008 | feed sink/cache | 搜索/翻页/generation变化 | AC-R007-01/AC-R008-01 |
| R009/R010 | Suiyin capability panel | 打开Sources | AC-R009-01/AC-R010-01 |
| R011 | existing source flows | partial/reimport/reopen | AC-R011-01 |

### 10.2 工程交付准备

- **当前状态**：authorized-for-handoff；房总于 2026-08-20 授权把 future Suiyin moments capability 纳入碎银 MCP 正式工程 Handoff/Issue。
- **可能涉及的目标仓**：本地 feed 仍只涉及本原型；上游 moments 与 T028 exact-three-persona cohort 合并交付给 `PetWebOrg/suiyin_mcp`。
- **优先自动化的验收**：AC-R001-01–AC-R011-01，全部使用fictional fixtures。
- **必须人工判断的验收**：内容流阅读密度、长正文折叠和focus体验；需要isolated public preview，不读取真实数据。
- **Handoff / Test Contract**：见同目录 `issue-handoff.md` 与 `test-contract.md`；真实 Issue 只有在远端版本化 SDD 包可访问后才能创建。

## 11. 非目标与约束

- 不把“统一”理解为把聊天与朋友圈混在一条流。
- 不为未来Suiyin API写stub、假成功、空数组或mock生产路径。
- 不改变source cards六项统计、People collection location或关系建议。
- 不运行真实微信导出、真实IDB、真实MCP、private DOM、network/model/upload/send测试。
- 不跨生产仓；Issue/Handoff 只按房总 2026-08-20 明确授权创建，仍不在本工作区 commit/push/tag/deploy 生产实现。

## 12. 待确认问题

无具体方案分歧；本规格整体仍待房总审核。

## 13. 房总审核

- [x] 用户问题和完成后变化准确。
- [x] In / Out Scope 准确。
- [x] 规则、状态和权限准确。
- [x] 端与租户差异准确。
- [x] AI-PROPOSAL 已逐项决定。
- [x] 阻塞问题已关闭或明确延期。
- [x] 跨 SPEC 依赖已锁定精确版本。
- [x] 可以进入 Prototype Plan 与 task contract 签发。

**审核结论**：approved；按推荐方案只展示 trusted moment，永久排除 `group_context`/聊天 excerpt；来源按记录自身 provenance，碎银朋友圈在正式 MCP 能力到位前保持 upstream-blocked。  
**审核人**：房总  
**审核日期**：2026-08-20  
**审核备注**：同时授权将碎银三人设完整 cohort 与 persona-filtered read-only moments 合并进入同一碎银 MCP 正式工程 Handoff/Issue；不授权本工作区跨仓实现。

## 14. 变更历史

| 版本 | 日期 | 作者 | 变化 | 原因 |
|---|---|---|---|---|
| 1.0.0 | 2026-08-20 | Codex E1/E2 | 房总按推荐方案批准并授权工程交接 | 建立统一真实朋友圈feed、来源筛选、隐私和P0性能合同 |

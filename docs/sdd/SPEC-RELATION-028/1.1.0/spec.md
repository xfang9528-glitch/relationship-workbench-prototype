---
spec_id: SPEC-RELATION-028
title: "碎银三账号完整可读范围与真实人物归属"
version: 1.1.0
status: approved
level: L2
project: "关系·今天"
surface: "PC 本机 hosted-stateful HTML 原型"
tenants: "房总个人专用 / bzds"
owner: "房总"
author: "Codex E1/E2"
constitution: "prototype-sdd@1.4.0"
depends_on_specs: "SPEC-RELATION-002@1.0.0, SPEC-RELATION-010@1.0.0, SPEC-RELATION-015@1.0.0, SPEC-RELATION-017@1.0.0, SPEC-RELATION-021@1.0.0, SPEC-RELATION-022@1.0.0, SPEC-RELATION-023@1.0.0, SPEC-RELATION-026@1.0.0, SPEC-RELATION-027@1.0.0"
last_updated: 2026-08-20
---

# 碎银三账号完整可读范围与真实人物归属

## 1. 审核摘要

- **用户问题**：当前“读取碎银”只取 `list_allocations` 的当前分配对象，26 个对象中又有 13 个群上下文，因此 People 实际只出现 13 人；16528 是消息条数却被写成“可读聊天”。真实响应中的人设和昵称还可能在 nested `weixin_clients[]`，现 importer 丢失后把人物显示为“待确认身份”、所在微信显示为“碎银 · 账号待补”。这既不能回答三个人设各有多少好友，也让不完整范围看起来像完整结果。
- **完成后变化**：数据来源页先确认当前环境的三个官方人设，再复用现有碎银 MCP 已提供的读取能力，按每个人设形成有界、可证明完整的好友、群上下文和消息回执；People 里的 direct Suiyin 好友使用真实客户昵称/备注并显示 `碎银 · 官方人设名`。旧版 current-allocation 路径仍可作为明确 partial 的兼容输入，但不能代表 MCP 的能力上限，也绝不冒充“三账号已读完”。
- **本次范围**：三人设 roster、persona-filtered complete cohort contract、top-level+nested 人设三元组归一、人物名字优先级、好友/群/消息分量统计、完整性回执、失败/重试和加密同源更新。
- **明确不做**：不扫描整个租户再猜三账号、不按昵称或聊天正文猜人设、不把群当人物、不新增或修改生产 MCP/Flutter/Go，不读取真实数据做测试，不自动发送。
- **需要房总拍板**：无。房总已明确三个账号都应纳入、账号与昵称应清晰，且当前人数明显不完整。
- **AI 新提案**：无。房总于 2026-08-20 明确确认现有 MCP 已支持本项目所需的全部读取能力；“只读”是关系助手的调用 allowlist 与副作用边界，不是待新增的 MCP 能力。局部 adapter 未枚举或未映射既有工具时，应在本项目内修正 schema discovery/字段映射，不得据此创建生产 MCP 能力 Issue。

## 2. 用户问题与预期结果

### 2.1 用户与场景

- 用户角色：房总。
- 触发场景：在数据来源页读取或更新碎银，并在 People 按所在微信核对人物。
- 当前做法：只冻结当前分配 ID；消息条数与对象数混写；nested 人设/昵称未归一。

### 2.2 用户问题

“读取成功”现在只证明读到了当前分配的一小段数据，不能证明三个账号的好友都在；账号与昵称字段丢失后又被降级成大量相同占位名，导致 People 无法核对，也可能让后续关系分析基于错误范围。

### 2.3 完成后用户能感受到的变化

房总能看到三个人设逐个完成的范围回执，知道每个账号读到了多少好友、群和消息；每个 direct Suiyin 好友用上游真实名字和官方人设展示。只要某个人设、客户页或声明可读的历史未完成，页面就明确指出缺口并允许重试，不显示完整成功。

### 2.4 成功信号

| ID | 可观察信号 | 判定方式 |
|---|---|---|
| O001 | 官方 roster 恰有 3 个 configured persona，People 可按三个 official label 筛选 | fictional source-contract test + UI test |
| O002 | People 仅含 friend，名字不为统一占位；group 只进 context | local-vault projection test |
| O003 | 人物数、群数、消息条数、不可读与失败互不混写 | Sources DOM oracle |
| O004 | incomplete receipt 不能冒充 complete；prior graph 不被覆盖 | import state test |
| O005 | 本地 adapter 只调用 live schema 中既有读取工具；缺映射、权限或运行失败均 typed fail closed，不转成“新增 MCP 能力” | source/adapter contract gate |

## 3. 范围

### 3.1 In Scope

- 读取 `list_personas(status:"all")` 官方 roster；本轮要求三个 configured persona，冻结字段为 `id/name/nickName/wcId/online_status`，展示 label 只用 official `name`。offline 仍是 configured，禁止用 online 状态推导 active。
- 通过现有 MCP live `tools/list` 与 input schema 发现其已提供的 persona/customer/history 读取能力，选择可证明 exact persona scope 的既有读取路径，对三个 persona 分别做完整分页并冻结 scope receipt；不得把本地旧 allowlist 或参数名当作 MCP 能力清单，也不得使用未被 live schema 接受或未回显生效范围的过滤。
- 同时消费 top-level `clientId/clientName/clientWcId` 与 nested `weixin_clients[].clientId/clientName/wcId`，规范化、去重、冲突 fail closed。
- 客户显示名严格按 `customerNames > nickName/nickname > aliasName > remark > exact same-customer allocation nickname` 取安全非空值；persona `clientName/name` 永远不是人物名。没有名字的 friend 排除并计数，不创建“待确认身份”占位人物。
- friend 建 person；group 只建 context；同 stable customer ID 去重，不按名称 fuzzy merge。
- aggregate 与 per-persona 分列 `friendCount/groupCount/messageCount/unreadableCount/failureCount`；aggregate `friendCount` 按 stable person ID 去重，因此可小于各 persona 小计之和。receipt 另保留 `allocationDeclaredCount/allocationCount/allocationMissingCount/customerCount`；缺失 allocation row 不猜 persona 归属。
- `current-allocation-partial` 与 `persona-complete` 两种明确 receipt/CTA：前者可修正当前可读对象但只做 non-destructive upsert，后者才可声称三账号范围完整。
- preview、retry、confirm、同源重读、AES-GCM graph/backup、generation/cache 与 T026/T027 回归。

### 3.2 Out of Scope

- 用当前销售 `list_allocations` 冒充三个账号全量好友。
- 绕过现有 MCP 的有界读取能力，改用全租户无界分页后在本机按昵称、编号或内容筛选。
- 读取群成员、碎银朋友圈、媒体原件、附件、电话、余额、权益或发送能力。
- 根据昵称、正文、数组顺序、ID 末位、截图圈选或 relationship suggestion 猜人设。
- Flutter / React / Go 生产端实现与联调，以及修改 `E:/dev/suiyin_mcp` 或其他生产仓；本次只修关系助手本地 adapter 与合同。
- 真实 MCP/真实 vault/真实聊天测试、网络上传、自动发送、commit/push/tag/deploy/完整推送。

### 3.3 适用矩阵

| 端 / 租户 | 是否适用 | 继承的 Profile | 差异 |
|---|---|---|---|
| 房总 PC 本机 / bzds | 是 | OPERATIONAL-RELATION-028 | loopback 只读 MCP + AES-GCM graph |
| 其他环境、租户、端 | 否 | none | 不扫描、不降级猜测 |

## 4. 证据与来源

| ID | 类型 | 来源 | 支持的结论 | 可信状态 |
|---|---|---|---|---|
| E001 | USER | 2026-08-19 房总截图与纠偏 | 三个账号人数明显不完整；人设与昵称应明确；统计需可理解 | confirmed |
| E002 | SPEC | SPEC-RELATION-010@1.0.0 R006/R008/R010 | 旧范围只含当前分配；friend/group 分离；必须诚实覆盖 | confirmed-but-superseded-in-scope |
| E003 | SPEC | SPEC-RELATION-021@1.0.0 | official clientName registry、missing/conflict、安全 alias | confirmed |
| E004 | SPEC | SPEC-RELATION-022/023/026/027@1.0.0 | 重开、generation、性能、关系建议、所在微信边界 | confirmed |
| E005 | PROTO | `scripts/suiyin-mcp-client.mjs` current audit | 只读顶层 persona 字段；history-only alias 写 null；26=friend+group，16528=messageCount | confirmed |
| E006 | USER | 2026-08-20 房总纠正 | 现有 MCP 已支持本项目全部读取能力；不得另建“只读能力” | confirmed |
| E007 | PROTO | `scripts/suiyin-mcp-client.mjs` current audit | 本地 adapter 的固定 allowlist/current-allocation 路径落后于现有 MCP 能力，不能反向证明 MCP 缺能力 | confirmed-local-gap |

### 4.1 已发现冲突

- 本规格对“读取碎银”的目标范围取代 T010 `list_allocations`=本轮唯一范围真源；T010 的只读、全分页、稳定 ID、friend/group 与不支持能力边界继续有效。
- 本规格扩展 T021 只读顶层 persona tuple 的来源合同：允许同一 customer row 的 nested `weixin_clients[]`，并要求 top-level/nested 一致归一；冲突仍整批 fail closed。
- T027 “碎银 · 账号待补”仍是确实缺 official label 时的诚实降级，但不能由 importer 丢字段制造。
- 1.0.0 把本地 adapter 的固定工具清单误判成生产 MCP 的能力上限；1.1.0 以房总确认的现有 MCP 能力为准，撤销外部能力依赖和 Issue `PetWebOrg/suiyin_mcp#19`，改由本项目 adapter 通过 live schema discovery 复用既有读取能力。

### 4.2 精确规格依赖

| 依赖 | 用途 | 失效条件 |
|---|---|---|
| `SPEC-RELATION-002@1.0.0` | preview/confirm/AES-GCM/receipt 基线 | 版本或批准态变化 |
| `SPEC-RELATION-010@1.0.0` | Suiyin read-only import、ID、friend/group | 同上 |
| `SPEC-RELATION-015@1.0.0` | 整库增量分析 | 同上 |
| `SPEC-RELATION-017@1.0.0` | cache/transaction | 同上 |
| `SPEC-RELATION-021@1.0.0` | official persona labels | 同上 |
| `SPEC-RELATION-022@1.0.0` | reopen/generation | 同上 |
| `SPEC-RELATION-023@1.0.0` | large-library budgets | 同上 |
| `SPEC-RELATION-026@1.0.0` | relationship suggestion regression | 同上 |
| `SPEC-RELATION-027@1.0.0` | collection location/filter | 同上 |

## 5. 用户场景与验收

### US01 — 三个人设都以可证明范围读取

#### AC-R001-01 — roster、既有 MCP cohort 与安全 partial fallback
- Given current environment 的 official configured persona roster 恰有三项；`online_status` 仅作上游状态事实，不参与 configured/active 推断。
- When 房总显式读取碎银。
- Then 三账号 complete path 必须从 live MCP schema 中选择现有 persona-scoped 等价读取能力，完成全分页并生成 completion receipt；若本地 adapter 无法证明工具映射、过滤生效、权限或分页完整性，则返回本地 typed blocked/error 且 complete CTA disabled，但不得宣称 MCP 缺能力或新建 MCP Issue。旧版 current-allocation 可形成独立 partial preview/CTA，只能 non-destructive upsert 当前对象，0 全租户兜底扫描。

#### AC-R002-01 — top-level 与 nested tuple 归一
- Given customer rows 混有顶层 tuple、nested-only `weixin_clients[]`、重复与冲突。
- When importer 建 staging。
- Then `clientId/clientName/wcId|clientWcId` 归一为同一 safe alias/official label/link；重复幂等，任一同 key 非空冲突整批 fail closed；0 raw 输出。

### US02 — 人物与统计一眼可核对

#### AC-R003-01 — 真实人物名与群分离
- Given friend/group rows 和安全显示字段。
- When 投影。
- Then friend 才建 person，严格按 `customerNames > nickName/nickname > aliasName > remark > exact same-customer allocation nickname` 使用安全真实名字；persona `clientName/name` 不得作为人物名。无名字排除并计数；group 只建 context；不得创建“待确认身份”占位人物或枚举群成员。

#### AC-R004-01 — 单位明确的范围回执
- Given 三个人设、多好友、多群、多条消息和不可读项。
- When Sources 显示 preview/active receipt。
- Then aggregate 和 per-persona 分别展示 persona、好友人物、群上下文、消息条数、不可读取、失败；aggregate friend 按 stable person ID 去重，可小于 per-persona 之和。receipt 显示 `allocationDeclaredCount/allocationCount/allocationMissingCount/customerCount`，allocation missing 不计为 request failure、不按 persona 猜分配；`messageCount` 文案固定“可读消息条数”，不能写“可读聊天/客户”。

#### AC-R005-01 — 所在微信使用 official label
- Given direct Suiyin friend 的 mapping alias 在 registry 有 official label。
- When People/T027 filter 投影。
- Then 显示 `碎银 · official`；nested-only official label 与顶层等价；不因 person name 缺失或 relationship suggestion 改写。

### US03 — 缺口不冒充完整结果

#### AC-R006-01 — completeness-critical failure 阻断 complete、不阻断诚实 partial 修正
- Given roster、persona customer page、identity tuple 或声明可读历史任一分页失败/漂移，或 current allocation 有已知 declared/read/missing 差额。
- When preview 收口。
- Then 显示具体 persona 与 distinct failed/unreadable counts；“确认三账号完整导入”禁用并显示原因。若 current-allocation snapshot 已有有界稳定回执（例如 declared 29/read 26/missing 3）且无 transport/parse/drift/identity conflict，可另显示“更新当前分配（不是三账号全量）”；`allocationMissingCount` 独立于 `failureCount`，partial 提交只 upsert 已读 scope，0 deletion，并完整保留范围外既有同源 person/mapping/context/excerpt/signal/message。若回执本身不稳定或有冲突，则 prior graph deep-equal并只重试失败 scope。

#### AC-R007-01 — 显式不可读与失败分开
- Given upstream 明确声明某记录无权限/不可读，或请求异常。
- When 统计。
- Then 前者进入 `unreadableCount` 且不冒充可读目标，后者进入 `failureCount` 并阻断 complete receipt；两者不得合并为 0 或从 messageCount 推断。

#### AC-R008-01 — 同源确认与重开
- Given complete preview 与 current generation 未漂移。
- When 确认并重开。
- Then 一次 generation 原子更新同 source，保留用户关系、字典、其他来源与失败 scope 的 prior data；receipt、official labels 与 People 投影从加密 graph 恢复，0 自动 MCP。

### US04 — 原型与生产边界

#### AC-R009-01 — 复用既有 MCP，不新增上游能力
- Given 房总确认现有 MCP 已具备全部所需读取能力，而本地 adapter 的固定 allowlist/schema 仍落后。
- When 执行本任务 source gate。
- Then 只允许在关系助手内完成 live tool discovery、既有读取调用、字段映射和完整性回执；`upstream-dependency.md` 必须记录旧假设已撤销，`PetWebOrg/suiyin_mcp#19` 关闭为 not planned；不得修改生产仓或另建“只读能力”。

#### AC-R010-01 — preview-only
- Given focused fictional tests 与公共 Chrome 预览完成但无 E4/E5、无真实 MCP。
- When汇报。
- Then最多 `PREVIEW-VALIDATED`；若 adapter 映射、权限、分页或完整性证据失败则报告具体本地/运行时 blocked，不得写 complete/verified/完整读取/上线，也不得归因为 MCP 能力缺失。

## 6. 业务规则

| ID | 规则 | 级别 | 来源 | Profile Override | 验收覆盖 |
|---|---|---|---|---|---|
| R001 | 三个 official persona 必须先有 roster；完整读取必须使用 persona-filtered complete cohort；current-allocation只可作为明确partial、non-destructive upsert，禁止其或无界全租户扫描冒充完整 | MUST | E001/E002/E006 | OP-028 | AC-R001-01 |
| R002 | top-level 与 nested persona tuple 必须 canonicalize/dedupe/conflict fail closed；raw client/customer/WC ID 仅局部内存 | MUST | E001/E003/E005/E006 | OP-028 | AC-R002-01 |
| R003 | friend 才建 person；人物名严格按 customerNames→nickName/nickname→aliasName→remark→exact allocation nickname，persona label不得代替人物名；group只建context；缺名排除计数 | MUST | E001/E002/E005 | OP-028 | AC-R003-01 |
| R004 | persona/friend/group/message/unreadable/failure 必须分单位、分 persona 与 aggregate 展示；aggregate friend去重；allocation declared/read/missing/customer独立保留且missing不猜persona | MUST | E001/E002/E005 | 无 | AC-R004-01 |
| R005 | direct Suiyin 所在微信只用 official registry；名字/正文/建议/顺序不参与人设判断 | MUST | E001/E003/E004 | OP-028 | AC-R005-01 |
| R006 | completeness-critical failure 必须阻断完整确认；有界稳定current-allocation回执即使有明确missing也可经独立partial CTA做0-deletion upsert，missing与failure分离；不稳定/冲突则保留prior graph并有界重试 | MUST | E001/E002 | OP-028 | AC-R006-01 |
| R007 | upstream-declared unreadable 与 request failure 必须分开计数和语义 | MUST | E001/E005 | OP-028 | AC-R007-01 |
| R008 | complete confirm 一次 generation，同源更新保留业务事实/其他来源；重开 0 自动 MCP | MUST | E002/E003/E004 | OP-028 | AC-R008-01 |
| R009 | 现有 MCP 读取能力必须由本地 adapter 通过 live schema discovery 复用；局部 allowlist/映射缺口不得升级为生产 MCP 能力需求 | MUST | E001/E006/E007 | OP-028 | AC-R009-01 |
| R010 | focused fictional + public preview 最多 preview-validated；adapter/schema/权限/分页缺口必须具体 fail closed，不得写成 MCP capability missing | MUST | E001/E006 | 无 | AC-R010-01 |

### 6.1 不变量

- INV001：消息条数永远不是人物数、客户数或会话对象数。
- INV002：群上下文永远不自动建人物或枚举成员。
- INV003：official persona 来自上游 roster/tuple，不从昵称、正文或序号推断。
- INV004：不完整范围不能写成“三账号已读取完成”。
- INV005：任何 production dependency 都不能扩大本 task 的可写路径。
- INV006：真实数据、MCP、vault、private DOM 不进入测试或报告。

### 6.2 默认值与配置

| 参数 | 默认值 | 配置粒度 | 来源 | 是否可改 |
|---|---|---|---|---|
| persona 数 | `list_personas(status:"all")` 当前 official configured roster 恰为 3；official label=`name`，不以online推active | current environment | E001/E006 | 上游变化后重审 |
| customer cohort | 现有 MCP live schema 中可证明 exact persona scope 的读取路径 + complete pagination receipt | 每次显式读取 | E001/E006 | MCP schema 演进后适配器重审 |
| incomplete confirm | 禁用普通完整确认 | 每次 preview | E001 | 否 |
| 群处理 | context-only | 全局 | E002 | 需回 SPEC |

## 7. 状态与交互

### 7.1 状态模型

| 当前状态 | 事件 | 条件 | 下一状态 | 用户反馈 | 规则 |
|---|---|---|---|---|---|
| idle | 读取碎银 | vault ready | roster-loading | 正在确认官方账号 | R001 |
| roster-loading | roster complete | exactly 3 | cohort-loading | 三个人设逐项进度 | R001 |
| roster/cohort-loading | adapter mapping/receipt incomplete | current allocation有bounded stable declared/read/missing receipt且0 request/conflict | preview-partial | 本地适配尚未形成完整回执；可修正已读对象，不能称三账号全量 | R001/R006/R009 |
| roster/cohort-loading | schema/permission/transport failure | current allocation receipt不稳定或有request/parse/drift/conflict | blocked | 说明具体失败；保留 prior，可重试 | R006/R009 |
| cohort-loading | all pages complete | tuples valid | preview-complete | 分 persona 范围回执 | R002–R004 |
| cohort-loading | fail/drift | any | preview-incomplete | 缺口、重试与 prior graph 未变 | R006/R007 |
| preview-partial | 更新当前分配 | explicit partial CTA/current generation | committing-partial | 0 deletion、范围外不变 | R001/R006/R008 |
| preview-complete | 确认三账号完整导入 | current generation | committing | 正在加密写入 | R008 |
| committing | success | one generation | active-complete | 已加密保存完整 scope receipt | R008 |

### 7.2 状态覆盖矩阵

| 对象 | rest | hover / pressed | focus | selected | disabled | loading | empty | error | overflow | permission |
|---|---|---|---|---|---|---|---|---|---|---|
| 碎银来源卡 | 汇总+分账号 | 按钮反馈 | 可见 | current scope | capability/incomplete说明 | 分账号进度 | 0好友仍列3账号 | typed+retry | 长清单滚动 | bzds/loopback |
| 确认按钮 | complete可用 | 反馈 | 可见 | N/A | 明确具体缺口 | committing | 无可读好友禁用 | prior保持 | N/A | 房总本机 |

### 7.3 进入、退出与恢复

- 入口：`#/sources` 显式“读取/更新碎银来源”。
- 关闭 / 返回：preview 留在当前 session；不写 graph。
- 取消：清理 transient staging，prior graph 保持。
- 重复操作：同 source/scope 幂等；只重试 failed scope。
- 刷新 / 重开：只恢复 last committed encrypted receipt，不自动读 MCP。
- 失败后恢复：adapter/schema/permission/transport 失败均在本项目内有界重试或修正映射；不创建生产 MCP 能力依赖。

### 7.4 文案合同

| 场景 | 文案 | 为什么这样写 | 禁止写法 |
|---|---|---|---|
| 当前旧范围 | 当前分配声明 29、实际读取 26、缺失 3；其中好友人物 13、群上下文 13 | 分单位且missing不冒充failure | 已读取 26 位好友 |
| 消息统计 | 可读消息条数 16528 | 精确单位 | 可读聊天 16528 |
| 本地适配未完成 | 现有碎银读取能力尚未形成可验证的三账号完整回执；可修正当前对象，但不能称三账号全量 | 诚实边界且不误判 MCP | 当前接口只支持当前分配 / 三账号已同步 |
| 完整成功 | 3/3 个账号范围完整；好友 N、群 M、消息 K | 有 receipt | 碎银所有数据已导入 |

## 8. 数据、权限与隐私

### 8.1 展示数据

| 字段 | 来源 | 必填 | 空值表现 | 示例 | 敏感性 |
|---|---|---|---|---|---|
| persona label | official roster/tuple | 是 | 阻断完整 scope | 碎银 · 2号 | 敏感 |
| person display name | customer minimal fields | 是 | 排除并计数 | 虚构客户 | 敏感 |
| friend/group/message counts | aggregate receipt | 是 | 0（仅complete scope） | 120/18/16528 | 普通聚合 |
| unreadable/failure | upstream/typed error | 是 | 0（真实统计） | 2/1 | 普通聚合 |
| allocation declared/read/missing/customer | current-allocation receipt | partial是 | unknown不得填0 | 29/26/3/26 | 普通聚合 |

### 8.2 权限

| 角色 | 可见 | 可操作 | 不可操作 | 反馈 |
|---|---|---|---|---|
| 房总 | 本机加密结果与安全聚合 | 显式读取、重试、确认 | 写型 MCP、自动发送 | 每步范围/缺口 |
| 其他用户 | 无 | 无 | 访问本库 | 无入口 |

### 8.3 隐私与租户隔离

- 只允许 current `bzds`、loopback POST、只读工具；不上传、不遥测。
- raw client/customer/WC IDs、聊天正文、姓名不得进入 DOM/log/error/report；测试全虚构。

## 9. 端与租户差异

| Base 规则 | PC | APP | Admin | 租户 Override |
|---|---|---|---|---|
| R001–R010 | 本机 Sources/People | 不适用 | 不适用 | 仅 bzds / 房总个人 |

## 10. 原型实现契约

- **目标原型仓**：`E:/AI 项目/关系维护助手`。
- **目标文件 / 路由**：`scripts/suiyin-mcp-client.mjs`、`prototype/local-vault.js`、`prototype/index.html`、focused fictional tests；`#/sources`、`#/people`。
- **必须复用的 tokens / 组件**：现有 source card、preview、typed error、T023/T027 view model。
- **必须模拟的状态**：nested-only、3 personas、complete/incomplete/unreadable/failure/adapter-schema-mismatch、confirm/reopen。
- **关键 mock 数据**：全部 code-authored fictional，0 real MCP。
- **只模拟、不读取私人数据**：用 fictional live-tool schema 与响应验证现有 MCP 调用映射；current-allocation partial 仅作旧路径兼容，0 deletion。
- **预览入口**：`http://127.0.0.1:8765/prototype/index.html?refresh=T028-preview#/sources`。

### 10.1 规则到页面映射

| 规则 | 页面 / 组件 | 用户如何触发 | 如何验证 |
|---|---|---|---|
| R001/R006/R009 | Sources read flow | 点击读取/重试 | AC-R001/006/009 |
| R002/R003/R005 | importer + People | fictional preview/projection | AC-R002/003/005 |
| R004/R007 | Sources receipt | 查看汇总/分账号 | AC-R004/007 |
| R008 | confirm/reopen | 虚构 adapter | AC-R008 |

### 10.2 工程交付准备

- **当前状态**：approved-local-adapter-correction；不需要生产 MCP Handoff/Issue。
- **可能涉及的目标仓**：仅 `E:/AI 项目/关系维护助手` 本地 adapter/原型；`suiyin_mcp` 不在变更范围。
- **优先自动化的验收**：AC-R001-01–AC-R010-01（fictional contract）。
- **必须人工判断的验收**：真实三账号 scope，仅在另获真实数据授权后。
- **Handoff / Test Contract**：当前 `contract-T028.md` 是 1.0.0 历史合同，已由 `contract-T028-supersession.md` 撤销；1.1.0 实现须另签本地 task contract。`upstream-dependency.md` 记录误判撤回，不再是依赖。

## 11. 非目标与约束

- 不因当前已有 16528 条消息推断有 16528 个聊天对象。
- 不把 current allocation 26 扩写成完整通讯录。
- 不跨生产仓、不真实读数、不运行 E4/E5、不运行 legacy。
- 任一调用映射、权限、分页或完整性不能被当次回执证明时 fail closed；不得由局部 adapter 反推 MCP 缺能力。

## 12. 待确认问题

无。实现是否能进入真实完整范围由机器 schema/receipt gate 判定；现有 MCP 能力是已确认前提，局部 adapter 缺口在本项目内修正。

## 13. 房总审核

- [x] 用户问题和完成后变化准确。
- [x] In / Out Scope 准确。
- [x] 规则、状态和权限准确。
- [x] 端与租户差异准确。
- [x] AI-PROPOSAL 已逐项决定。
- [x] 阻塞问题已关闭或明确延期。
- [x] 跨 SPEC 依赖已锁定精确版本。
- [x] 可以进入 Prototype Plan；1.0.0 task contract 已撤销，1.1.0 需重签本地实现合同。

**审核结论**：approved。房总明确要求三账号真实范围、官方账号与昵称、正确人数，不接受 current allocation 冒充完整结果。
**审核人**：房总
**审核日期**：2026-08-19
**审核备注**：2026-08-20 纠正：现有 MCP 已支持全部所需读取；只修本地 adapter，不授权或需要跨仓修改。

## 14. 变更历史

| 版本 | 日期 | 作者 | 变化 | 原因 |
|---|---|---|---|---|
| 1.1.0 | 2026-08-20 | Codex E1/E2 | 撤销“生产 MCP 缺读取能力”的误判；改为复用现有 MCP 并在本地完成 schema discovery/映射 | 房总纠正现有 MCP 已支持全部读取能力 |
| 1.0.0 | 2026-08-19 | Codex E1/E2 | 冻结三账号完整可读范围、nested tuple、名字与分量回执 | 房总纠偏当前26/16528与账号待补 |

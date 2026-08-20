---
spec_id: SPEC-RELATION-030
title: "微信与碎银统一六项来源覆盖回执"
version: 1.1.0
status: approved
level: L2
project: "关系·今天"
surface: "PC 本机 hosted-stateful HTML 原型"
tenants: "房总个人专用 / bzds"
owner: "房总"
author: "Codex E1"
constitution: "prototype-sdd@1.4.0"
depends_on_specs: "SPEC-RELATION-002@1.0.0, SPEC-RELATION-010@1.0.0, SPEC-RELATION-017@1.0.0, SPEC-RELATION-022@1.0.0, SPEC-RELATION-028@1.1.0, SPEC-RELATION-029@1.0.0"
last_updated: 2026-08-20
---

# 微信与碎银统一六项来源覆盖回执

## 1. 审核摘要

> 房总先看本节即可判断方向；正文用于追溯和实现。

- **用户问题**：数据来源页的微信与碎银统计单位不一致；碎银把消息条数写成聊天数，微信又只显示总聊天/朋友圈，用户无法横向判断每个来源究竟读到了多少好友、单聊、群聊和朋友圈。
- **完成后变化**：微信与碎银两张卡固定以同一顺序展示“好友、1 对 1 聊天、1 对 1 消息、群聊、群消息、朋友圈内容”，并逐项说明 exact、partial、旧版未知、上游不支持或受阻，任何未知都不补成 0。
- **本次范围**：统一六项数据合同、微信 canonical preview 拆分、碎银 partial 拆分、严格加法式 AES-GCM 回执、备份恢复、旧图兼容和诚实状态文案。
- **明确不做**：不在本规格实现微信通讯录 roster，不新增或修改碎银 MCP；碎银六项复用现有 MCP 读取能力，由关系助手本地 adapter 映射，不把旧 current-allocation 路径冒充完整结果，不跨生产仓。
- **需要房总拍板**：本规格整体是否准确；六项的精确定义已按本轮要求固定，无额外产品选择。
- **AI 新提案**：无。微信没有可信完整好友 roster 时，“好友”固定 blocked；可另示“本批次单聊中出现的人数”，但不得改名冒充好友总数。

## 2. 用户问题与预期结果

### 2.1 用户与场景

- 用户角色：房总，本机唯一使用者。
- 触发场景：在 `#/sources` 对照微信导出与碎银三个账号的数据覆盖，判断后续关系分析是否有足够来源。
- 当前做法：微信只显示总聊天记录/朋友圈，碎银显示客户/好友/群/总消息，且当前分配 partial 容易被误读为三账号全量。

### 2.2 用户问题

统计单位不一致会让“26 个客户、16528 条消息”看起来像“26 位完整好友、16528 个聊天”；同时缺失数据被写成 0 或省略时，用户无法分辨真的没有、旧版未记录、上游不支持，还是读取范围受阻。

### 2.3 完成后用户能感受到的变化

两张来源卡一眼可横向比较同样六项；每个数字都有明确范围。微信能从本次 canonical 导出拆出的项目显示 exact；没有可信通讯录 roster 的完整好友数显示“受阻”，并可在说明中展示“本批次单聊中出现 N 人”。碎银通过本地 adapter 复用现有 MCP：当 T028 三账号与朋友圈完整回执成立时显示 exact；旧 current-allocation 兼容回执只能 partial；adapter/schema/权限/分页证据不足时显示具体受阻，不得写成“上游不支持”。

### 2.4 成功信号

| ID | 可观察信号 | 判定方式 |
|---|---|---|
| O001 | 两张卡六项同序、同名、同状态语义 | DOM + Chrome |
| O002 | 微信单聊/群聊与各自消息数可由纯虚构 canonical fixture 精确对账 | domain test |
| O003 | 微信完整好友数无 roster 时不出现伪数字；范围内观测人数不冒充好友数 | contract + DOM |
| O004 | 碎银 partial 与 complete、消息与聊天、unsupported 与 0 均不混淆 | domain test + DOM |
| O005 | 新回执随加密图/备份恢复，旧图 0 migration | vault test |

## 3. 范围

### 3.1 In Scope

- 微信与碎银来源卡固定六项指标及状态投影。
- `coverageReceiptVersion=1` 的严格加法式来源回执。
- 微信 canonical preview 中 1 对 1 / 群会话与消息、朋友圈的拆分计数。
- 微信缺可信 roster 时完整好友数 blocked；单聊范围内去重人物只作补充观察值。
- 碎银 current-allocation partial 的好友、单聊、单聊消息、群聊、群消息拆分。
- T028@1.1.0 基于现有 MCP 读取能力形成 persona-complete 回执后的 exact 投影合同，以及关系助手本地 adapter 的六项映射。
- legacy、安全备份、恢复、删除、重导 diff/CAS 与隐私回归。

### 3.2 Out of Scope

- 新增或猜测完整微信好友 roster。
- 修改 `wechat-export-toolkit`、`suiyin_mcp`、suiyin-go、Flutter、React 或其他生产仓。
- Flutter / React / Go 等生产端实现不在本规格范围。
- 读取真实 MCP、真实导出、真实 IndexedDB 或私人 DOM 作为测试。
- 新增碎银朋友圈/三账号完整 cohort 的生产 MCP 能力；本次只允许在关系助手内适配现有读取能力。
- 朋友圈内容流、发布者卡片和来源筛选；由后续独立规格承载。

### 3.3 适用矩阵

| 端 / 租户 | 是否适用 | 继承的 Profile | 差异 |
|---|---|---|---|
| PC 本机 Chrome / 房总 / bzds | 是 | OPERATIONAL-RELATION-002 + 010 + 028 + 029 + 030 | 本机 picker、loopback MCP、AES-GCM graph |
| 其他用户、环境或远端 | 否 | 无 | 无入口、无数据、无同步 |

## 4. 证据与来源

| ID | 类型 | 来源 | 支持的结论 | 可信状态 |
|---|---|---|---|---|
| E001 | USER | 2026-08-20 当前对话与截图 | 两卡必须同口径展示六项 | confirmed |
| E002 | SPEC | SPEC-RELATION-010@1.0.0 | 微信 moments 已进 graph；旧本地实现曾将碎银朋友圈固定 unsupported，该结论被本规格纠正 | superseded-in-part |
| E003 | SPEC | SPEC-RELATION-028@1.1.0 | current-allocation partial 与三人设 complete 必须分离；现有 MCP 能力由本地 adapter 复用 | confirmed |
| E004 | SPEC | SPEC-RELATION-029@1.0.0 | 微信 safe receipt、diff、CAS、legacy 与备份语义 | confirmed |
| E005 | PROTO | prototype/local-vault.js / scripts/suiyin-mcp-client.mjs | 当前本地 adapter 只枚举旧工具/字段并持久总 messageCount；这是本地接线缺口，不是 MCP 能力证据 | confirmed-local-gap |
| E007 | USER | 2026-08-20 房总纠正 | 现有 MCP 支持全部所需读取能力；“只读”只是本项目调用边界 | confirmed |
| E006 | DESIGN | source-contract.md | 六项字段、状态、范围与一致性合同 | confirmed |

### 4.1 已发现冲突

- T010 旧 UI 只显示微信总消息/朋友圈、碎银总客户/群/消息；本规格不删除旧字段，只新增统一 coverage receipt，并让 UI 优先读取新回执。
- T010 把碎银朋友圈固定 unsupported；该能力判断被房总纠正并由本规格取代。仍禁止用 0、mock 或 `group_context` 冒充朋友圈。
- T028@1.0.0 把本地 adapter 缺口误判为 upstream-blocked；T028@1.1.0 已撤销该判断。本规格只在 existing-MCP receipt 通过时显示 exact，失败归到具体 adapter/schema/permission/pagination 状态。

### 4.2 精确规格依赖

| 依赖 | 用途 | 失效条件 |
|---|---|---|
| `SPEC-RELATION-002@1.0.0` | AES-GCM graph、删除、备份、恢复 | 版本或批准态变化 |
| `SPEC-RELATION-010@1.0.0` | canonical moments 与碎银只读基础边界 | 版本或批准态变化 |
| `SPEC-RELATION-017@1.0.0` | 整库真实来源投影与生命周期 | 版本或批准态变化 |
| `SPEC-RELATION-022@1.0.0` | current generation CAS | 版本或批准态变化 |
| `SPEC-RELATION-028@1.1.0` | 碎银 partial/complete scope、existing-MCP adapter 与 per-persona 证据 | 版本或批准态变化 |
| `SPEC-RELATION-029@1.0.0` | 微信重导 diff 与 safe batch receipt | 版本或批准态变化 |

## 5. 用户场景与验收

### US01 — 同口径比较微信与碎银

- **用户**：房总。
- **前置条件**：本机 vault ready，至少有一个来源或 legacy source。
- **目标**：不换算、不猜测就能对照两个来源六项覆盖。
- **独立价值**：先消除“聊天数/消息数”和“未知/0”的误读。

#### AC-R001-01 — 固定六项与顺序

- Given 微信与碎银任意状态。
- When 打开数据来源页。
- Then 两张卡都按“好友、1 对 1 聊天、1 对 1 消息、群聊、群消息、朋友圈内容”展示六项；不以总消息数代替聊天数。

#### AC-R002-01 — 五态互斥

- Given exact、partial、legacy、unsupported、blocked fixtures。
- When 投影六项。
- Then 每项恰有一个 `exact|partial|legacy-unknown|upstream-unsupported|blocked` 状态；只有 exact/partial 可携带非负数字，其余状态 value 必须为 null，UI 不显示 0。

### US02 — 微信回执不冒充完整通讯录

- **用户**：房总。
- **前置条件**：用户显式选择通过校验的 canonical 导出。
- **目标**：看清本批次实际读到的单聊、群聊、消息与朋友圈，同时知道完整好友数并没有可信证据。
- **独立价值**：即使不改 exporter，也能诚实得到五项精确覆盖和一个明确受阻项。

#### AC-R003-01 — 好友 roster 边界

- Given canonical 导出不含可信完整联系人 roster，但有多个单聊对象。
- When 预览或重开来源卡。
- Then “好友”显示 blocked 且不显示数字；补充说明可显示“本批次单聊中出现 N 人”，字段名不得为 friendCount 或“好友总数”。

#### AC-R004-01 — 微信五项精确拆分

- Given 纯虚构 personal/group conversations、各类有效消息和可选 moments。
- When parser 形成 preview。
- Then 1 对 1 聊天、1 对 1 消息、群聊、群消息分别由 canonical kind 对账；moments 文件存在时朋友圈 exact，文件未提供时 blocked/null；排除项另示且不暗中并入任何六项。

#### AC-R005-01 — 严格加法式持久化

- Given 新图、legacy 图、重导、备份和恢复。
- When 成功确认或普通重开。
- Then 新图一次 generation 保存 coverage receipt；旧图只显示 legacy-unknown 且 0 migration；重导遵守 T029 diff/CAS；backup strict validate，非法 receipt 整份 fail closed。

### US03 — 碎银 partial 不冒充三账号完整

- **用户**：房总。
- **前置条件**：T028 旧 partial staging 或由现有 MCP 映射出的 persona-complete staging。
- **目标**：分别看到单聊/群聊与消息数，并知道范围是否完整。
- **独立价值**：本地 adapter 尚未形成完整回执时仍可用已有片段核对，不制造“全量完成”。

#### AC-R006-01 — partial 六项拆分

- Given current-allocation partial fixture。
- When 投影来源卡。
- Then 好友、1 对 1 聊天、1 对 1 消息、群聊、群消息均显示 partial 和实际已读值；朋友圈若该旧回执未包含则显示 local-integration-blocked/null；卡片明确这只是旧 adapter 片段，不代表 MCP 能力上限或三账号完整范围。

#### AC-R007-01 — complete 只认 T028 证据

- Given scopeComplete=false、personaReadCount<3、filter echo/pagination 不成立或任一 completeness failure。
- When 生成回执。
- Then 不得将任一三账号 aggregate/per-persona 指标标为 exact；只有满足 T028 complete 合同才允许 exact。

#### AC-R008-01 — per-persona 与 aggregate 对账

- Given 三 persona fixture 有跨 persona 重复好友与消息。
- When 生成 aggregate。
- Then perPersona 保留各自覆盖；aggregate 好友按 stable person 去重，聊天/消息按合同稳定去重；无法证明的交集整批 blocked，不猜号、不相加制造总数。

### US04 — 隐私与预览边界

#### AC-R009-01 — 只展示聚合

- Given 私人姓名、正文、raw source/customer/client ID canary。
- When 渲染卡片、记录错误或备份 receipt。
- Then公共回执只含安全聚合、状态、reason code 和官方人设 label；0 raw ID、0 姓名/正文/路径/handle。

#### AC-R010-01 — 验证结论诚实

- Given 仅纯虚构 fixture、无真实导出/MCP/IDB、无 E4/E5。
- When 完成本地 focused 验证。
- Then 最多报告 preview-validated；T028 complete 与碎银朋友圈分别报告现有 MCP 回执是否已被本地 adapter 合规映射，未闭合时使用具体 local blocked/error，禁止写 upstream capability missing。

## 6. 业务规则

| ID | 规则 | 级别 | 来源 | Profile Override | 验收覆盖 |
|---|---|---|---|---|---|
| R001 | 两张来源卡固定同序六项：好友、1对1聊天、1对1消息、群聊、群消息、朋友圈内容 | MUST | E001 | 无 | AC-R001-01 |
| R002 | 每项状态只可为 exact/partial/legacy-unknown/upstream-unsupported/blocked；非 exact/partial 的 value 必须 null，禁止用 0 代替未知 | MUST | E001/E006 | OP-030 | AC-R002-01 |
| R003 | 微信完整好友数无可信 roster 必须 blocked；范围内去重单聊对象另名 observedDirectParticipantCount，不得冒充 friendCount | MUST | E001/E005 | OP-030 | AC-R003-01 |
| R004 | 微信四项聊天指标按 canonical conversation/message kind 拆分；moments 文件存在才 exact，未提供则 blocked；排除项另计 | MUST | E005/E006 | OP-030 | AC-R004-01 |
| R005 | coverage receipt 严格加法、一次 generation、随 AES-GCM/backup/restore；legacy 0 migration；重导复用 T029 diff/CAS | MUST | E002/E004 | OP-030 | AC-R005-01 |
| R006 | 旧 current-allocation 回执的好友/聊天/消息只能 partial；朋友圈未被旧 adapter 映射时 local blocked/null，但不得称 MCP upstream-unsupported | MUST | E002/E003/E005/E007 | OP-030 | AC-R006-01 |
| R007 | 碎银 exact 仅在 T028@1.1.0 从现有 MCP 形成的 persona-complete/朋友圈回执全部门成立时允许；失败归因到具体 adapter/schema/permission/pagination | MUST | E003/E007 | OP-030 | AC-R007-01 |
| R008 | per-persona 与 aggregate 必须按 stable identity 去重并可对账；交集不明即 blocked，禁止列表序号/名字/正文推断 | MUST | E003/E006 | OP-030 | AC-R008-01 |
| R009 | public receipt/DOM/log/error 只含聚合、状态、reason 与官方 label；0 raw ID/姓名/正文/路径/handle | MUST | E004/E006 | OP-030 | AC-R009-01 |
| R010 | 无真实数据/E4/E5最多 preview-validated；具体 blocked/error 必须保留，局部 adapter 缺口不得表述为 MCP capability missing | MUST | E001/E003/E007 | 无 | AC-R010-01 |

### 6.1 不变量

- INV001：任何六项未知、未提供或受阻都不得显示为 0。
- INV002：`friendCount` 只表示可信好友 roster 范围内的去重好友；观察到的单聊对象永不改名为完整好友数。
- INV003：current-allocation partial 永不升级为 persona-complete。
- INV004：新增 coverage receipt 不改写旧 `conversationCount/messageCount/momentCount` 的历史含义。
- INV005：查看、筛选、刷新与普通重开 0 写、0 自动 picker、0 自动 MCP。
- INV006：六项回执不包含人物、正文、raw identifier 或本机路径。

### 6.2 默认值与配置

| 参数 | 默认值 | 配置粒度 | 来源 | 是否可改 |
|---|---|---|---|---|
| coverage receipt version | 1 | schema 固定 | E006 | 否 |
| metric order | friends/directConversations/directMessages/groupConversations/groupMessages/moments | UI 固定 | E001 | 否 |
| missing metric value | null + explicit state | schema 固定 | E006 | 否 |
| legacy behavior | legacy-unknown、0 migration | schema 固定 | E004 | 否 |

## 7. 状态与交互

### 7.1 状态模型

| 当前状态 | 事件 | 条件 | 下一状态 | 用户反馈 | 规则 |
|---|---|---|---|---|---|
| legacy | 打开来源页 | 无 v1 receipt | legacy | 六项逐项“旧版未记录” | R002/R005 |
| preview | canonical 解析完成 | receipt 合法 | preview | 微信五项 exact/blocked + 好友观察说明 | R003/R004 |
| partial | 碎银旧 partial ready | T028 complete receipt 不成立 | partial | 已读五项 partial，未映射项明确本地适配受阻 | R006/R007 |
| blocked | 读取/证据不足 | adapter/schema/permission/pagination/receipt prerequisite 缺失 | blocked | 具体稳定原因，不显示 0、不归因为 MCP 缺能力 | R002/R007 |
| committing | 用户确认 | generation current | ready | 一次加密保存 | R005 |
| 任意 | 失败/取消/stale | — | prior | 原图不变，可按既有流程重试 | R005/R009 |

### 7.2 状态覆盖矩阵

| 对象 | rest | hover / pressed | focus | selected | disabled | loading | empty | error | overflow | permission |
|---|---|---|---|---|---|---|---|---|---|---|
| 六项指标格 | ✅ | N/A | N/A | N/A | N/A | ✅ | ✅ | ✅ | 6 格换行 | N/A |
| 微信来源卡 | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ✅ | ✅ | 响应式 | ✅ |
| 碎银来源卡 | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ✅ | ✅ | per-persona 折行 | ✅ |

### 7.3 进入、退出与恢复

- 入口：`http://127.0.0.1:8765/prototype/index.html#/sources`。
- 关闭 / 返回：只丢弃未确认 preview，active graph 不变。
- 取消：沿 T029/T028 取消语义，0 写。
- 重复操作：沿现有 single-flight/CAS，不因统计回执新开第二提交。
- 刷新 / 重开：只从加密 graph 投影；0 picker、0 MCP、0 migration。
- 失败后恢复：显示 typed reason；保留上一份合法 receipt。

### 7.4 文案合同

| 场景 | 文案 | 为什么这样写 | 禁止写法 |
|---|---|---|---|
| 微信好友 | 完整好友数：当前导出未提供可信好友清单 | 不冒充通讯录 | 好友 1309（仅由单聊/moments 推断） |
| 微信观察数 | 本批次单聊中出现 N 人 | 精确限定范围 | 好友总数 N |
| 碎银 partial | 当前已读片段，不代表三个账号完整范围 | 诚实范围 | 已读取碎银全部好友 |
| 碎银朋友圈 | 现有碎银读取能力尚未形成可验证的朋友圈回执 | 本地接线/回执事实 | 上游未提供能力 / 朋友圈 0 条 |
| legacy | 旧版导入未记录 | 0 migration | 0 |

## 8. 数据、权限与隐私

### 8.1 展示数据

| 字段 | 来源 | 必填 | 空值表现 | 示例 | 敏感性 |
|---|---|---|---|---|---|
| metric key/order | 固定合同 | 是 | 不可为空 | directMessages | 普通 |
| metric value | canonical / MCP aggregate | 否 | 非 exact/partial 固定 null | 86569 | 聚合 |
| metric state | 合同投影 | 是 | blocked | partial | 普通 |
| metric reason code | typed local reason | 否 | 不展示说明 | trusted-roster-unavailable | 普通 |
| scopeKind/scopeComplete | 来源回执 | 是 | legacy fallback | wechat-export-batch / false | 普通 |
| observedDirectParticipantCount | 微信 canonical direct rows 去重 | 否 | 未记录 | 315 | 聚合 |
| perPersona officialLabel + metrics | T028 official registry | 否 | 不猜号 | 虚构官方人设甲 | 敏感 label |

### 8.2 权限

| 角色 | 可见 | 可操作 | 不可操作 | 反馈 |
|---|---|---|---|---|
| 房总 | 本机加密来源聚合与状态 | 显式选择/读取/确认/移除 | 自动扫描、自动 MCP、切环境、发送、生产修改 | typed reason + 0 写保证 |

### 8.3 隐私与租户隔离

- 仅 `owner_local` / bzds；coverage receipt 随 AES-GCM graph，不建立明文旁路。
- public receipt、DOM、日志、error 和 review 只含聚合数字、有限状态、reason code 与官方安全 label。
- 禁止 raw customer/client/source identifier、姓名、正文、路径、FileSystemHandle、token。
- 测试仅使用 code-authored fictional fixtures。

## 9. 端与租户差异

| Base 规则 | PC | APP | Admin | 租户 Override |
|---|---|---|---|---|
| R001–R010 | 房总本机适用 | 不适用 | 不适用 | 仅 bzds / owner_local |

## 10. 原型实现契约

- **目标原型仓**：`E:/AI 项目/关系维护助手`。
- **目标文件 / 路由**：`prototype/index.html#/sources`、`prototype/local-vault.js`、`scripts/suiyin-mcp-client.mjs` 与纯虚构 focused tests。
- **必须复用的 tokens / 组件**：现有 source cards、source-stats、receipt projector、T028 partial/complete gate、T029 diff/CAS、AES-GCM backup/restore。
- **必须模拟的状态**：exact、partial、legacy-unknown、upstream-unsupported、blocked、loading、error、stale、backup invalid。
- **关键 mock 数据**：仅 code-authored personal/group/moments、三 persona partial/complete 与 privacy canary。
- **只模拟、不读取私人数据**：用 fictional live-tool schema/response 验证现有 MCP 到 T028 persona-complete 与朋友圈回执的本地映射；不创建生产 stub。
- **预览入口**：`http://127.0.0.1:8765/prototype/index.html#/sources`。

### 10.1 规则到页面映射

| 规则 | 页面 / 组件 | 用户如何触发 | 如何验证 |
|---|---|---|---|
| R001/R002 | 两张来源卡六项格 | 打开 sources | AC-R001/002 |
| R003/R004 | 微信 preview/receipt | 选择导出、确认、重开 | AC-R003/004 |
| R005 | vault/diff/backup | 确认、重导、备份恢复 | AC-R005 |
| R006–R008 | 碎银 scope receipt | 读取 partial / fictional complete | AC-R006–008 |
| R009/R010 | DOM/log/report | 任意状态/验证 | AC-R009/010 |

### 10.2 工程交付准备

- **当前状态**：corrected-handoff；微信 exporter 私有仓与 Issue #1 保留，错误的碎银 MCP Issue #19 撤回并关闭。
- **可能涉及的目标仓**：微信 roster 由私有仓 `xfang9528-glitch/wechat-export-toolkit` 承接；碎银六项只在 `relationship-workbench-prototype` 本地 adapter/原型中复用现有 MCP，不涉及 `PetWebOrg/suiyin_mcp` 变更。
- **优先自动化的验收**：AC-R001-01–AC-R010-01。
- **必须人工判断的验收**：AC-R001-01、AC-R003-01、AC-R006-01 的文案层级与横向可读性。
- **Handoff / Test Contract**：见同目录 `issue-handoff.md` 与 `test-contract.md`；真实 Issue 只有在远端版本化 SDD 包可访问后才能创建。

## 11. 非目标与约束

- 不把当前 UI、截图圈选、姓名或聊天内容当完整好友 roster 证据。
- 不为碎银朋友圈预做假数据或假成功；测试只使用 code-authored fictional adapter fixtures。
- 不修改生产仓；微信 exporter #1 仍须独立 worktree、Phase、PR 与 review；碎银侧不再创建生产 Issue。
- 未经房总明确批准本规格，不实现产品、测试或 schema。
- 未经“完整推送”不 commit/push/tag/deploy。

## 12. 待确认问题

| Q-ID | 问题 | 推荐答案 | 影响 | 阻塞? | 状态 / 结论 |
|---|---|---|---|---|---|
| Q001 | 无可信 roster 时能否把单聊去重人数称为微信好友数 | 否；好友 blocked，另示范围内观测人数 | 防止完整性误导 | 否 | closed-by-current-requirement |
| Q002 | 碎银 current allocations 能否显示 exact | 否；必须 partial，T028 complete 才可 exact | 防止冒充三账号全量 | 否 | closed-by-current-requirement |

## 13. 房总审核

- [x] 用户问题和完成后变化准确。
- [x] In / Out Scope 准确。
- [x] 规则、状态和权限准确。
- [x] 端与租户差异准确。
- [x] AI-PROPOSAL 已逐项决定。
- [x] 阻塞问题已关闭或明确延期。
- [x] 跨 SPEC 依赖已锁定精确版本。
- [x] 可以进入 Prototype Plan。

**审核结论**：approved；按推荐方案，微信没有可信完整 roster 时“好友”保持 blocked，只把“本批次单聊中出现 N 人”作为范围内观察值；碎银 current-allocation 保持 partial，只有 T028 完整门成立才可 exact。
**审核人**：房总
**审核日期**：2026-08-20
**审核备注**：2026-08-20 纠正：保留微信 exporter 私有工程 Handoff/#1；撤回碎银 MCP 新能力 Handoff/#19，改为在私有关系项目复用现有 MCP。

## 14. 变更历史

| 版本 | 日期 | 作者 | 变化 | 原因 |
|---|---|---|---|---|
| 1.1.0 | 2026-08-20 | Codex E1/E2 | 撤销碎银 MCP 能力缺失判断；R006–R010 改为本地 adapter 复用现有 MCP；仅保留 exporter #1 | 房总纠正确认现有 MCP 已支持全部读取能力 |
| 1.0.0 | 2026-08-20 | Codex E1 | 房总按推荐方案批准并授权工程交接 | 统一来源六项与诚实覆盖状态 |

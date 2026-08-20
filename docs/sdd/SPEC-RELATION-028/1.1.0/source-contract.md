---
source_contract_id: SOURCE-CONTRACT-SUIYIN-THREE-PERSONA-028
version: 1.1.0
status: approved
source_spec: SPEC-RELATION-028@1.1.0
prepared_by: "Codex E1/E2"
prepared_at: 2026-08-19
approved_by: "房总"
approved_at: 2026-08-19
---

# Source Contract — 碎银三账号完整可读范围

## 1. Authority and Supersession

本合同保留 T010 的 loopback、bzds、只读、stable ID、friend/group、分页与原子确认边界，取代 `list_allocations` 作为“完整三账号”范围真源的做法。T021/T024 的 official label / exact WeChat link 继续有效，并增加真实 MCP slim row 的 nested `weixin_clients[]` 形状。

2026-08-20 房总确认：现有 MCP 已提供本项目需要的全部读取能力。此前只审计本地 `scripts/suiyin-mcp-client.mjs` 固定 allowlist/current-allocation 路径，并据此推断生产 MCP 缺能力，是错误的证据外推。

当前合同改为：

- 运行时从现有 MCP 的 `tools/list` 与 input schema 发现可用读取工具，不把本地固定 allowlist 当成服务端能力清单；
- 只调用无副作用的读取工具；“只读”由本项目 allowlist、显式点击和 0 自动调用保证，不要求 MCP 新增一种能力；
- 选择能证明 exact persona scope、分页完成和权限范围的既有读取路径；具体工具名/参数以 live schema 为准，文档不得编造；
- `list_allocations` 仍只代表兼容性的 current-allocation partial，不代表 MCP 的能力上限；
- 全租户无界读取后本机猜测过滤仍被禁止。

## 2. Existing MCP Read Receipt

完整 cohort 必须由现有 MCP 读取工具组合形成等价回执；下列是关系助手内部的规范化形状，不是要求生产 MCP 新增同名 API：

```text
personaRoster(environment) -> [{ id, name, nickName, wcId, online_status }]
searchCustomersByPersona({ environment, wcIds:[...3], page, pageSize })
  -> { rows, total, page, pageSize, hasMore|nextPage, appliedWcIds, snapshotToken? }
```

真实工具名与字段以 live schema 为准；本地 adapter 必须证明：

1. 能把 customer cohort 限定到 exact three persona wcIds，且 response 回显 appliedWcIds；
2. page/pageSize必须由MCP真实维护，不能沿当前上游缺字段错误输出0；有全分页终止语义与 total/page drift 检查；
3. 只读且不触发分配、好友、消息或环境写操作；
4. 不要求全租户无界扫描；单 persona total≤10000 才可用 from/size 宣称complete，超过则必须由上游提供 PIT/search-after 或等价稳定游标。

缺任一项返回具体的本地 adapter/schema/permission/pagination typed blocked/error。此时不得形成 complete preview，也不得宣称 MCP 缺能力；若 current-allocation snapshot 有有界稳定回执（declared/read/missing 均已知，且无 transport/parse/drift/identity conflict），仍可形成独立 `scopeKind="current-allocation-partial-v1"` preview，经明确 partial CTA 只做 non-destructive upsert。`allocationMissingCount` 独立于 `failureCount`。本项目不修改 upstream production repository。

## 3. Persona Tuple Canonicalization

Importer 局部内存允许读取两种真实 shape：

```text
top-level: { clientId, clientName, clientWcId }
nested:    { weixin_clients:[{ clientId, clientName, wcId }] }
```

- `clientWcId` 与 nested `wcId` 语义相同，只用于 deterministic WeChat source link preimage。
- 每个 nonempty raw clientId 立即派生 T021 safe alias；row tuple 的 official label 只取 normalized `clientName`。roster 的 official label 只取 `list_personas.name`；`nickName` 不是官方账号 label，`online_status` 不得推导 configured/active。
- top-level/nested 相同 tuple 幂等；同 raw clientId 的不同非空 official label/WC ID 为 conflict，whole preview fail closed。
- nested 数组 order 不构成事实；canonical signature 按 raw clientId 的局部规范序排列后计算。
- raw clientId/wcId/customerId 只存在于 importer 局部内存、请求参数和 hash preimage；返回 staging/error/log/report/DOM 为 0 raw。

## 4. Customer Name and Entity Contract

- friend display name 按固定顺序只取安全非空值：`customerNames > nickName/nickname > aliasName > remark > exact same-customer allocation nickname`。persona `clientName/name` 永远不是人物名；不得再引入 generic `name/customerName` fallback。
- 安全字段全部为空：该 friend 排除并进入 `missingDisplayNameCount`，不能创建 `昵称待补` / `待确认身份` 人物。
- group 只建 context，使用安全 context label；不建 person、不枚举成员。
- stable upstream customer ID 相同才去重；名称相似不 merge。
- mapping aliases 必须来自该 row canonical persona tuples或已验证的 history header，并在 registry 有 own key；若同一 complete search snapshot 已提供 official tuple，history 不得把其 label 降为 null。

## 5. Pagination and Completeness

每 persona cohort 必须记录：official safe label、declared total、unique fetched rows、last page、snapshot token/signature、unreadable、failure。重复 ID 同 payload 幂等；同 ID payload conflict、total/page/snapshot drift、游标循环、越界页数均 fail closed。

History 目标只能来自 complete customer cohort。上游明确 `not_readable/permission_denied` 进入 unreadable；transport/parse/drift 进入 failure。complete receipt 要求：

- `list_personas(status:"all")` roster complete 且恰有三项 configured official persona；offline 仍算 configured，禁止根据 `online_status` 推导 active；
- 三项 customer cohorts 全分页完成；
- every included friend 有 stable ID、safe name、closed persona registry；
- every declared-readable history 全分页完成；
- `failureCount=0`。

否则不能产生 persona-complete receipt。若 current-allocation snapshot 有上述有界稳定回执，可产生独立 partial receipt并显式确认0-deletion upsert；已知 allocation missing 不等于 request failure，也不阻止 partial。该 receipt 永久携带 `scopeComplete=false` 和 `scopeKind=current-allocation-partial-v1`。snapshot 有 transport/parse/drift/identity conflict 时 prior graph不变，只可重试 failed scope。不得把 unreadable/failure 自动填 0。

## 6. Aggregate Receipt

Source preview/committed receipt 至少含：

```text
personaDeclaredCount, personaReadCount,
allocationDeclaredCount, allocationCount, allocationMissingCount, customerCount,
friendCount, groupCount, messageCount,
unreadableCount, failureCount, missingDisplayNameCount,
perPersona:[{ officialLabel, friendCount, groupCount, messageCount,
              unreadableCount, failureCount, complete }],
scopeKind:"persona-complete-v1"|"current-allocation-partial-v1", scopeComplete
```

`allocationDeclaredCount` 是声明分配数，`allocationCount` 是实际读取的分配 row 数，`allocationMissingCount` 是两者可证明差额，`customerCount` 是规范化去重后的 customer row 数。missing row 没有事实可分 persona，禁止猜测归属。`friendCount` 是按 stable person ID 去重的 unique direct people，可能小于 per-persona friendCount 之和；`groupCount` 是 context；`messageCount` 是消息条数。UI 固定使用这些单位，不得写“可读聊天”来表示 messageCount。

## 7. Merge, Reopen and Fail Closed

complete/partial confirm 均使用 current generation CAS，one generation 合并 same source。保留用户关系、词典、身份决定、其他来源；新的 complete cohort 中不存在的旧 source entity 只能按已批准 diff/删除语义处理。partial commit 固定 upsert-only，不能删除、失效或改写任何不在 current partial cohort 的旧 source person/mapping/context/excerpt/signal/message。测试必须预置这些范围外同源实体并逐项证明 deep-equal 保留。incoming 与既有记录若同 stable source ID 但 immutable kind/source/history identity 不同，整批 fail closed，partial 不得覆盖冲突。receipt/registry 随 AES-GCM graph 与 backup 持久；普通重开 0 MCP。

任何 scope/tuple/raw/shape/backup 违反整批 0 写。cache/analysis 失败不回滚业务 graph，但不能把 incomplete receipt 改成 complete。

## 8. Verification Boundary

测试只用 code-authored fictional roster、live-tool schemas、nested/top-level customers、histories、pagination 和错误；0 real MCP/vault/chat/private DOM。schema mapping、权限、分页或完整性证据不足时最终结果必须是具体 local blocked/error，不是 preview success，也不是生产 MCP capability missing。

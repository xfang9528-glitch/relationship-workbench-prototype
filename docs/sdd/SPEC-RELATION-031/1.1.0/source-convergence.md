---
ledger_id: CONVERGENCE-RELATION-031
spec_id: SPEC-RELATION-031
spec_version: 1.1.0
status: verified
prepared_by: "Codex E2"
prepared_at: 2026-08-20
---

# 统一真实朋友圈内容流与来源筛选 — Source Convergence Ledger

## 1. 收敛摘要

- **源规格**：`SPEC-RELATION-031@1.1.0`
- **触发**：房总纠正现有 MCP 已支持全部所需读取，要求撤回新 MCP 能力/#19 并重新完整推送。
- **目标**：冻结 trusted moment 资格、逐记录来源 provenance、existing-MCP local mapping、筛选与时间语义；不把聊天上下文混入朋友圈。
- **实现状态**：`approved / issued-pending-local-contract`；当前宽查询 UI 与未接 moments adapter 只作旧实现证据。

## 2. Source Ledger

| Source ID | Old Source | Conflict / Superseded Rule | Resolution | Evidence | Remaining |
|---|---|---|---|---|---|
| S001 | T010 与当前 `graph.signals` 宽查询 | Suiyin `group_context`、excerpt 和 unknown signal 可进入“真实朋友圈”链路 | superseded | T031 R001/R002、AC-R001-01/AC-R002-01 只允许 trusted moment；旧实现属于工程前证据 | none |
| S002 | T027 人物 mapping“所在微信” | 人物所有 locations 若被复用于单条 moment，会造成来源猜测 | updated | T031 R003/AC-R003-01 固定逐记录 exact provenance；T027 仍只负责人物 lineage | none |
| S003 | T010/T028@1.0.0 的 Suiyin moments unsupported/upstream-blocked | 把本地 adapter 未接 moments 误判成 MCP 无能力 | superseded | 2026-08-20 房总能力确认；T028@1.1.0、T031 R009/R010 改为 existing-MCP local mapping | none |
| S004 | T029 `selectedAt/importedAt/exportedAt` | source receipt 时间可能被误显示为 moment 发布时间 | updated | T031 R005/R006 只用 moment trusted published time；无效显示“时间未记录” | none |
| S005 | T031@1.0.0 Handoff/Test/README/manifest、MCP issue draft 与 `PetWebOrg/suiyin_mcp#19` | 要求新增 persona-filtered read-only moments 生产能力 | superseded | T031@1.1.0 删除生产 Slice/Go tests/issue_url；draft 标 withdrawn；#19 撤回为 not planned | none |

## 3. Search Proof

| Search ID | Pattern / Old Term | Scope | Command / Method | Result | Evidence |
|---|---|---|---|---|---|
| Q001 | `queryGraphSignals / graph.signals / group_context` | prototype + T031 | `rg -n` 审计宽查询 | old wide-query locations identified; authority superseded | 新资格合同逐项登记，产品待本地 task 实现 |
| Q002 | `所在微信 / source provenance` | T027/T031 + prototype | `rg -n` 审计来源 | no current rule infers a moment source from all person locations | 人物 lineage 与记录 provenance 已分离 |
| Q003 | `selectedAt / importedAt / exportedAt / publishedAt` | T029/T031 + prototype | `rg -n` 审计时间 | source receipt and moment publication remain separate | T031 只消费 moment published time |
| Q004 | `UPSTREAM_SUIYIN_MOMENTS_UNAVAILABLE / PetWebOrg/suiyin_mcp#19 / future capability` | T031 current SDD package | `rg -n` 审计旧能力断言 | no active production capability Slice remains | 残留只允许在纠错历史、禁止写法或 withdrawal artifact |

## 4. Verification Gate

- [x] 源 SPEC 状态和版本仍有效。
- [x] §4.1 每个冲突来源都在 Source Ledger 中。
- [x] 每行 Resolution 合法且 Evidence 非空。
- [x] Remaining 全部为 none / 无 / —。
- [x] Search Proof 覆盖宽查询、来源、时间、旧能力误判与 #19。
- [x] 已运行 `validate-source-convergence.mjs` 且无 error。

**结论**：verified
**审核人**：Codex E2（按房总 2026-08-20 纠正与重新完整推送授权执行）
**审核日期**：2026-08-20

## 5. Change Control

- 源 SPEC 升版后，本账本立即 stale。
- 新发现的旧来源必须补入本账本并重新验证。
- 现有 HTML/adapter 在本地 task 完成前仍是旧实现证据，不得写成已实现或 live 验证。

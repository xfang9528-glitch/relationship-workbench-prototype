---
ledger_id: CONVERGENCE-RELATION-030
spec_id: SPEC-RELATION-030
spec_version: 1.1.0
status: verified
prepared_by: "Codex E2"
prepared_at: 2026-08-20
---

# 微信与碎银统一六项来源覆盖回执 — Source Convergence Ledger

## 1. 收敛摘要

- **源规格**：`SPEC-RELATION-030@1.1.0`
- **触发**：房总纠正“现有 MCP 已支持全部所需读取能力”，要求撤回错误的 MCP 新能力 Handoff/#19 并重新完整推送。
- **目标**：冻结唯一有效的六项回执合同：碎银复用现有 MCP，由关系助手本地 adapter 映射；微信 roster 仍由 exporter #1 承接。
- **实现状态**：`approved / issued-pending-engineering`；不宣称 T030 已实现或 live E4/E5 已验证。

## 2. Source Ledger

| Source ID | Old Source | Conflict / Superseded Rule | Resolution | Evidence | Remaining |
|---|---|---|---|---|---|
| S001 | `specs/010-real-moments-suiyin-local-import/spec.md` 与当前 Sources UI | 旧 UI 无法同口径比较六项 | superseded | `SPEC-RELATION-030@1.1.0` R001-R006 与 AC-R001-01-AC-R006-01；旧 UI 仅作实现前证据 | none |
| S002 | `SPEC-RELATION-010@1.0.0` 的“碎银朋友圈 unsupported” | 把旧本地 adapter 未接 moments 误写成现有 MCP 能力缺失 | superseded | 2026-08-20 房总确认现有 MCP 支持全部所需读取；T030 R006/R007/R010 要求 existing-MCP local mapping 和具体 fail-closed | none |
| S003 | `SPEC-RELATION-028@1.0.0` upstream blocker | 把 current-allocation adapter 路径当 MCP 能力上限 | superseded | `SPEC-RELATION-028@1.1.0` 与 T030 R006-R008：partial/complete 仍分离，但缺口归属本地 adapter/receipt | none |
| S004 | `SPEC-RELATION-030@1.0.0` Handoff/Test/README/manifest 与 `PetWebOrg/suiyin_mcp#19` | 要求新增三人设客户范围与朋友圈只读 MCP 能力 | superseded | T030@1.1.0 删除 I003/MCP Go tests/#19；现有 MCP 只由本地 I001 复用；#19 撤回为 not planned | none |

## 3. Search Proof

| Search ID | Pattern / Old Term | Scope | Command / Method | Result | Evidence |
|---|---|---|---|---|---|
| Q001 | 旧六项统计术语 | `prototype/index.html` | `rg -n` 定位旧 Sources UI | active old UI locations identified; behavior authority superseded | 旧 UI 仅作实现前证据，R001-R006 为当前真源 |
| Q002 | `当前 MCP 不提供朋友圈 / upstream-blocked / 上游不支持` | T028/T030 当前 1.1.0 SDD | `rg -n` 审计能力断言 | current contracts do not use these as current MCP capability facts | 残留仅允许出现在纠错历史、禁止写法或通用状态定义 |
| Q003 | `PetWebOrg/suiyin_mcp#19 / wc_ids / applied_wc_ids` | T030 当前 Handoff/Test/README/manifest | `rg -n` 审计 active delivery refs | no active MCP Slice/API requirement remains | #19 只在撤回审计记录中出现，不是 Issue Ref/交付目标 |
| Q004 | `current-allocation / persona-complete / 范围完整` | T028/T030 当前 1.1.0 SDD | `rg -n` 审计 scope 语义 | partial never becomes complete without receipt | 现有 MCP 能力可用不取消完整性门禁 |

## 4. Verification Gate

- [x] 源 SPEC 状态和版本仍有效。
- [x] §4.1 每个冲突来源都在 Source Ledger 中。
- [x] 每行 Resolution 合法且 Evidence 非空。
- [x] Remaining 全部为 none / 无 / —。
- [x] Search Proof 覆盖旧能力误判、错误 Issue 与 scope 语义。
- [x] 已运行 `validate-source-convergence.mjs` 且无 error。

**结论**：verified
**审核人**：Codex E2（按房总 2026-08-20 纠正与重新完整推送授权执行）
**审核日期**：2026-08-20

## 5. Change Control

- 源 SPEC 升版后，本账本立即 stale。
- 新发现的旧来源必须补入本账本并重新验证。
- 现有 HTML 在本地 task 完成前仍是旧实现证据；不得写成已实现或已 live 验证。

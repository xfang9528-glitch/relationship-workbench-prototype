---
ledger_id: CONVERGENCE-RELATION-030
spec_id: SPEC-RELATION-030
spec_version: 1.0.0
status: verified
prepared_by: "Codex E2"
prepared_at: 2026-08-20
---

# 微信与碎银统一六项来源覆盖回执 — Source Convergence Ledger

## 1. 收敛摘要

- **源规格**：`SPEC-RELATION-030@1.0.0`
- **触发**：房总于 2026-08-20 明确要求「完整推送」，且源规格 §4.1 存在冲突或替代来源。
- **目标**：冻结唯一有效的六项覆盖回执合同；本次不把待工程实现误报为原型已实现。
- **实现状态**：`approved / issued-pending-engineering`。现有原型 UI 只作为旧实现证据，不能继续作为六项统计的行为真源。

## 2. Source Ledger

| Source ID | Old Source | Conflict / Superseded Rule | Resolution | Evidence | Remaining |
|---|---|---|---|---|---|
| S001 | `specs/010-real-moments-suiyin-local-import/spec.md` R005/R006/R010 与 `prototype/index.html` Sources 卡片 | 微信只显示总聊天记录/朋友圈，碎银只显示客户、群上下文和消息条数，无法同口径比较六项 | superseded | `SPEC-RELATION-030@1.0.0` R001-R006 与 AC-R001-01-AC-R006-01 已批准；正式 Issue 只承接新回执实现，旧 UI 明确属于实现前证据 | none |
| S002 | `specs/010-real-moments-suiyin-local-import/spec.md` R010/INV005 | 碎银朋友圈 unsupported 容易在统一六项 UI 中被误写为 0 | updated | T030 R001/R005 固定为 `unsupported`，且禁止把 unsupported/blocked/unknown 补成 0 | none |
| S003 | `specs/028-suiyin-three-persona-complete-readable-scope/spec.md` R001/R006/R009 | current-allocation partial 不能被统一卡片冒充三人设 complete | updated | T030 R003/R006 与 AC-R003-01/AC-R006-01 继续要求 partial/complete 分离；工程依赖仍由正式 MCP Issue 承接 | none |

## 3. Search Proof

| Search ID | Pattern / Old Term | Scope | Command / Method | Result | Evidence |
|---|---|---|---|---|---|
| Q001 | `聊天记录 / 朋友圈线索 / 客户记录 / 好友人物 / 群上下文 / 可读消息条数` | `关系维护助手/prototype/index.html` | `rg -n "六类旧统计术语" prototype/index.html` | active old UI locations identified; behavior authority superseded by T030 | Sources 卡片旧字段集中在 `renderSources`，未发现另一套六项合同 |
| Q002 | `碎银朋友圈 / unsupported / 上游不支持` | `specs/010*`, `specs/030*`, `prototype/index.html` | `rg -n "碎银朋友圈及状态术语" specs prototype/index.html` | no conflicting success/zero rule; unsupported remains authoritative | T010、T030 与当前提示均禁止伪成功 |
| Q003 | `current-allocation / persona-complete / 范围完整` | `specs/028*`, `specs/030*`, `prototype/index.html` | `rg -n "scope 完整性术语" specs prototype/index.html` | no active contract permits partial to become complete | T028/T030 均要求 typed scope 与完整性证据 |

## 4. Verification Gate

- [x] 源 SPEC 状态和版本仍有效。
- [x] §4.1 每个冲突来源都在 Source Ledger 中。
- [x] 每行 Resolution 合法且 Evidence 非空。
- [x] Remaining 全部为 none / 无 / —。
- [x] Search Proof 覆盖所有旧术语或规则。
- [x] 已运行 `validate-source-convergence.mjs` 且无 error。

**结论**：verified  
**审核人**：Codex E2（按房总 2026-08-20 完整推送授权执行）  
**审核日期**：2026-08-20

## 5. Change Control

- 源 SPEC 升版后，本账本立即 stale。
- 新发现的旧来源必须补入本账本并重新验证。
- 现有 HTML 在工程 task 完成前仍是旧实现证据；任何交付摘要必须明确“待实现”，不得写成已实现或已验证。

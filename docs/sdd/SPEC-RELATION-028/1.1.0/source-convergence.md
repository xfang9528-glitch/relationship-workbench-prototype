---
ledger_id: CONVERGENCE-RELATION-028
spec_id: SPEC-RELATION-028
spec_version: 1.1.0
status: verified
prepared_by: "Codex E2"
prepared_at: 2026-08-20
---

# 碎银三账号完整可读范围 — Source Convergence Ledger

## 1. 收敛摘要

- **源规格**：`SPEC-RELATION-028@1.1.0`
- **触发**：房总确认现有 MCP 已支持全部所需读取，撤回生产能力依赖与 #19。
- **目标**：保留 complete/partial/隐私/分页门禁，但把能力真源纠正为 existing MCP + relationship local adapter。
- **实现状态**：`approved / old-contract-superseded / new-contract-not-issued`。

## 2. Source Ledger

| Source ID | Old Source | Conflict / Superseded Rule | Resolution | Evidence | Remaining |
|---|---|---|---|---|---|
| S001 | `SPEC-RELATION-028@1.0.0` E006/R009/R010 | 本地固定 allowlist/current-allocation 证明 production MCP 缺 persona cohort | superseded | 2026-08-20 房总确认 existing MCP capability；T028@1.1.0 R009/R010 改为 local schema/mapping gate | none |
| S002 | `contract-T028.md` | 已签发合同固定 upstream-blocked 与 production dependency | superseded | `contract-T028-supersession.md` 撤销 v1 执行授权；v2 未签发 | none |
| S003 | `upstream-dependency.md` 与 `PetWebOrg/suiyin_mcp#19` | 要求生产 MCP 新增特定 cohort API | superseded | dependency artifact 改为 withdrawal；#19 撤回为 not planned | none |
| S004 | current `scripts/suiyin-mcp-client.mjs` | 只支持旧 current-allocation path | superseded | 仅证明 local adapter gap；T028@1.1.0 要求 live schema discovery 与 existing-MCP mapping | none |

## 3. Search Proof

| Search ID | Pattern / Old Term | Scope | Command / Method | Result | Evidence |
|---|---|---|---|---|---|
| Q001 | `UPSTREAM_PERSONA_COHORT_UNAVAILABLE / upstream-blocked` | T028 current 1.1.0 SDD | `rg -n` 审计 | no active capability assertion remains | 残留只允许在撤回/禁止写法/历史合同引用中出现 |
| Q002 | `PetWebOrg/suiyin_mcp#19 / desired API / wc_ids` | T028 current 1.1.0 SDD | `rg -n` 审计 | no active production dependency remains | #19 与特定 API 只作为撤回审计史 |
| Q003 | `current-allocation / persona-complete` | T028 current 1.1.0 SDD | `rg -n` 审计 | partial/complete remain distinct | 旧 partial 兼容不代表 existing MCP capability ceiling |

## 4. Verification Gate

- [x] 源 SPEC 状态和版本仍有效。
- [x] 冲突来源均在 Source Ledger 中。
- [x] 每行 Resolution 合法且 Evidence 非空。
- [x] Remaining 全部为 none / 无 / —。
- [x] Search Proof 覆盖旧 capability、Issue/API 与 scope 语义。
- [x] 已运行 `validate-source-convergence.mjs` 且无 error。

**结论**：verified
**审核人**：Codex E2
**审核日期**：2026-08-20

## 5. Change Control

- T028@1.1.0 升版或 existing-MCP live schema 变化后，本账本立即 stale。
- 新 v2 task contract 签发前不得实施或 claim T028 完成。

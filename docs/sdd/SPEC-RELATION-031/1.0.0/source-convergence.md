---
ledger_id: CONVERGENCE-RELATION-031
spec_id: SPEC-RELATION-031
spec_version: 1.0.0
status: verified
prepared_by: "Codex E2"
prepared_at: 2026-08-20
---

# 统一真实朋友圈内容流与来源筛选 — Source Convergence Ledger

## 1. 收敛摘要

- **源规格**：`SPEC-RELATION-031@1.0.0`
- **触发**：房总于 2026-08-20 明确要求「完整推送」，且源规格 §4.1 存在冲突或替代来源。
- **目标**：冻结 trusted moment 资格、逐记录来源 provenance、来源筛选与时间语义；不把聊天上下文混入朋友圈。
- **实现状态**：`approved / issued-pending-engineering`。当前宽查询 UI 仅作为旧实现证据，不能继续作为朋友圈资格真源。

## 2. Source Ledger

| Source ID | Old Source | Conflict / Superseded Rule | Resolution | Evidence | Remaining |
|---|---|---|---|---|---|
| S001 | `specs/010-real-moments-suiyin-local-import/spec.md` 与 `prototype/local-vault.js` / `prototype/index.html` 当前宽 `graph.signals` 查询 | 后加入的 Suiyin `group_context`、excerpt 和 unknown signal 可进入“真实朋友圈”链路 | superseded | T031 R001/R002、AC-R001-01/AC-R002-01 只允许 trusted moment；旧实现明确标为工程前证据 | none |
| S002 | `specs/027-collection-location-column-filter/spec.md` 的人物 mapping“所在微信” | 人物所有 collection locations 若被复用于单条 moment，会造成来源猜测 | updated | T031 R003 与 AC-R003-01 固定逐记录 exact provenance；T027 仍只负责人物采集 lineage | none |
| S003 | `specs/028-suiyin-three-persona-complete-readable-scope/spec.md` current-allocation / persona-complete | 当前碎银聊天片段可能被误当作碎银 moments，或把 upstream-blocked 写成 0 | updated | T031 R009/R010 与 AC-R009-01/AC-R010-01 保持 moments upstream-blocked，禁止 `group_context`/mock/空数组兜底 | none |
| S004 | `specs/029-wechat-reimport-diff-receipt/spec.md` `selectedAt/importedAt/exportedAt` | source receipt 时间可能被误显示为 moment 发布时间 | updated | T031 R005/R006 固定卡片只用该 moment 的 trusted published time；无效值显示“时间未记录” | none |

## 3. Search Proof

| Search ID | Pattern / Old Term | Scope | Command / Method | Result | Evidence |
|---|---|---|---|---|---|
| Q001 | `queryGraphSignals / graph.signals / group_context / 真实朋友圈工作台` | `prototype/local-vault.js`, `prototype/index.html`, `specs/010*`, `specs/031*` | `rg -n "宽查询与群上下文术语" prototype specs` | active old wide-query locations identified; behavior authority superseded by T031 | 旧实现与新资格合同边界已逐项登记 |
| Q002 | `所在微信 / collection location / source provenance` | `specs/027*`, `specs/031*`, `prototype/index.html` | `rg -n "采集位置与记录来源术语" specs prototype/index.html` | no remaining contract authorizes inferring a moment source from all person locations | T027 人物维度与 T031 记录维度已分离 |
| Q003 | `selectedAt / importedAt / exportedAt / publishedAt` | `specs/029*`, `specs/031*`, `prototype` | `rg -n "来源回执与发布时间术语" specs prototype` | source receipt and moment publication semantics are explicitly separate | T029 保留批次审计；T031 只消费 moment published time |
| Q004 | `碎银朋友圈 / group_context / UPSTREAM_SUIYIN_MOMENTS_UNAVAILABLE` | `specs/010*`, `specs/028*`, `specs/031*`, `prototype` | `rg -n "碎银朋友圈能力术语" specs prototype` | no active contract permits chat context/mock to enter the feed | MCP 正式 Issue 承接未来能力，当前保持 blocked |

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

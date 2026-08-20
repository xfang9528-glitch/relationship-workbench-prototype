---
tasks_for: SPEC-RELATION-028
spec_version: 1.1.0
status: approved
last_updated: 2026-08-20
---

# Tasks — SPEC-RELATION-028

## T028-01 — Existing MCP adapter gate

- [ ] Use fictional `tools/list`/input-schema fixtures to make the local adapter discover and select the existing MCP read capabilities; never call real MCP in automated tests.
- [ ] Prove exact three-persona scope, applied filter/scope evidence and complete pagination without tenant-wide local filtering.
- [ ] If local mapping, permission or receipt proof is absent, emit a local typed blocked/error, stop the complete-scope path and keep the bounded current-allocation partial correction eligible; never emit `UPSTREAM_PERSONA_COHORT_UNAVAILABLE` or open a production MCP capability Issue (R001/R009, AC-R001-01/AC-R009-01).

## T028-02 — Legal RED for current local defects

- [ ] Add a nested-only `weixin_clients[]` fixture that currently yields null account label/link and placeholder person name (R002/R003).
- [ ] Add top+nested idempotent/conflict, `wcId` vs `clientWcId`, history-null precedence, roster `{id,name,nickName,wcId,online_status}` with offline-configured persona, and raw scrub fixtures (R002/R003).
- [ ] Add exact person-name order `customerNames > nickName/nickname > aliasName > remark > exact allocation nickname`; prove persona `clientName/name` never becomes the person name (R003).
- [ ] Add 29 declared / 26 read / 3 allocation-missing, 13 friend / 13 group / 16528 message unit assertions; prove missing is not failure, aggregate friend dedupes across persona, missing rows are not assigned to persona, and current UI calls messages “可读聊天” (R004/R007).

## T028-03 — Importer and domain GREEN

- [ ] Canonicalize top-level+nested persona tuples, preserve nonempty official label over history null, close links/registry, fail closed on conflict (R002).
- [ ] Implement the frozen customer display-name precedence exactly; exclude/count unnamed friends; keep groups context-only (R003).
- [ ] Add exact aggregate/per-persona scope receipt, including `allocationDeclaredCount/allocationCount/allocationMissingCount/customerCount`, and strict staging/backup validation without raw fields (R004/R007/R008).
- [ ] Until the local adapter produces a complete receipt, implement truthful `current-allocation-partial` compatibility receipt/CTA: nested/name/stat corrections, one current-generation upsert, 0 deletion/out-of-scope mutation; seed an old out-of-scope same-source person/mapping/context/excerpt/signal/message and prove every item deep-equal after commit. Same stable source ID immutable conflict must fail closed (R001/R006/R009).

## T028-04 — Sources/People GREEN and regressions

- [ ] Render distinct persona/friend/group/message/unreadable/failure units and explicit current-allocation vs complete-scope copy (R004/R006/R007/R009).
- [ ] Prove direct Suiyin People names and T027 locations use official registry; groups absent from People (R003/R005).
- [ ] Preserve T021/T024/T025/T026/T027 projections, generation/cache, source lifecycle and P0 budgets (R005/R008).

## T028-05 — Gates and bounded report

- [ ] Run project/spec/plan validators, focused three tests, frozen relevant regressions, lint/syntax/inline parse gates.
- [ ] Use only fictional fixtures; 0 real MCP/IDB/export/private DOM, 0 production writes, 0 E4/E5/legacy.
- [ ] Write `reviews/T028-preview-validation.md`: use a specific local adapter/schema/permission/receipt blocked state if evidence is incomplete; otherwise at most `PREVIEW-VALIDATED`. Never claim actual three-account completeness without authorized real evidence (R010).

## Completion boundary

- T028 local correction may be previewed and explicitly committed as current-allocation partial while the adapter mapping is incomplete; the user outcome “三账号完整可读范围” remains incomplete until the local adapter produces the required receipt from existing MCP reads.
- No production MCP work is required or authorized. Issue `PetWebOrg/suiyin_mcp#19` was based on an invalid capability assumption and must remain closed/not planned.
- No commit/push/tag/deploy/full push.

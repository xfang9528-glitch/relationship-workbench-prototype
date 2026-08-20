---
handoff_id: HANDOFF-RELATION-031
spec_id: SPEC-RELATION-031
spec_version: 1.0.0
status: approved
prepared_by: "Codex E1/E2"
prepared_at: 2026-08-20
actual_issue_creation: false
---

# 统一真实朋友圈内容流与来源筛选 — Issue Handoff

## 1. 交接摘要

- **源规格**：`SPEC-RELATION-031@1.0.0`
- **用户问题**：朋友圈工作台会把碎银群上下文混入真实朋友圈，来源不够精确；当前 MCP 又没有按官方人设有界读取朋友圈的能力。
- **完成后变化**：本机 feed 只显示 trusted moment，可按“我的微信 / 碎银 · 官方人设”筛选；碎银朋友圈只有在正式 MCP 提供安全、稳定、可证明完整性的只读能力后才进入 feed。
- **目标仓范围**：`xfang9528-glitch/relationship-workbench-prototype` 与 `PetWebOrg/suiyin_mcp`。
- **真实 Issue 授权**：房总于 2026-08-20 已授权；当前仍因远端版本化 SDD 包未发布而保持 `actual_issue_creation: false`。

## 2. Source Contract

- 唯一行为真源：`SPEC-RELATION-031@1.0.0` 的 `spec.md`。
- 来源合同：`SOURCE-CONTRACT-UNIFIED-REAL-MOMENTS-031@1.0.0`。
- Constitution：`prototype-sdd@1.4.0`。
- MCP Issue 与 `HANDOFF-RELATION-030` 的三人设 cohort 共用一个真实 Issue，但两个 SPEC、R/AC/Test 链必须分别保留。

## 3. Issue Slices

| Slice ID | Issue Title | Target Repo | Tenant | Platform | Reporter | Rules | Acceptance | Test IDs | User Problem | User Outcome | Issue Ref | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| I001 | feat(moments): 收敛真实朋友圈内容流与来源筛选（只看到真正朋友圈，并能按我的微信或碎银人设筛选） | xfang9528-glitch/relationship-workbench-prototype | 不适用 | PC | 不适用（内部发现） | R001、R002、R003、R004、R005、R006、R007、R008、R009、R010、R011 | AC-R001-01、AC-R002-01、AC-R003-01、AC-R004-01、AC-R005-01、AC-R006-01、AC-R007-01、AC-R008-01、AC-R009-01、AC-R010-01、AC-R011-01 | T-R001-01、T-R002-01、T-R003-01、T-R004-01、T-R005-01、T-R006-01、T-R007-01、T-R008-01、T-R009-01、T-R010-01、T-R011-01 | 群聊上下文会混入朋友圈，来源与时间可能误导，大数据量筛选会重绘整页 | 只看到可信朋友圈，来源与时间清楚，筛选和分页保持有界响应 | — | ready |
| I002 | feat(mcp): 增加三人设客户范围与朋友圈只读能力（房总可以核对三个碎银账号的完整好友，并按人设查看真实朋友圈） | PetWebOrg/suiyin_mcp | 碎银 | 不适用 | 不适用（内部发现） | R003、R009、R010 | AC-R003-01、AC-R009-01、AC-R010-01 | T-R003-02、T-R009-02、T-R010-02 | 当前 MCP 没有 persona-filtered read-only moments，原型只能阻断，不能按官方人设查看真实朋友圈 | MCP 按官方人设安全返回真实朋友圈及完整性回执，群聊永不作为朋友圈 fallback | — | ready |

## 4. Production Issue Draft — I002

- request 必须锁定 `environment=bzds`、exact official persona selectors、`pageSize<=50` 与 stable cursor/snapshot。
- response 必须回显 exact applied persona selectors/labels、稳定 snapshot、per-persona declared/readable/failure/completeness 与 next cursor。
- row 必须提供 stable source-owned moment/publisher identity、publisher display、published instant、body/media text description 和 exact persona attribution。
- 只读、不能全租户扫描后本机过滤；不能把客户、群聊或聊天 message 混入 moments；不允许 stub、mock 或空数组成功。
- typed error 不能泄漏 raw client/WC/customer/person/cursor/snapshot ID。
- PR 必须同时回链 `HANDOFF-RELATION-030` 与本 Handoff，并保留两个 Test Contract 的 Test ID/AC-ID。

## 5. Handoff Gate

- [x] 源 SPEC 为 `approved`，版本锁定 `1.0.0`。
- [x] 所有 MUST R-ID 与 AC-ID 已分配到 Slice。
- [x] 每个 Slice 都写清用户问题、用户结果和有效 metadata。
- [x] 每个 Slice 引用的 Test ID 均存在于同目录 Test Contract。
- [x] 房总已明确授权建立正式 Handoff/Issue。
- [ ] 远端版本化 SDD 包已发布并可由工程师访问。
- [ ] 真实 MCP Issue 已创建并回填 Issue Ref。

## 6. Change Control

- MCP moments schema、persona selector、pagination/snapshot、completeness 或 official registry 变化后，Source Contract、Handoff 与 Test Contract 全部 stale。
- 生产实现只在 `PetWebOrg/suiyin_mcp` 独立 Issue → worktree → Phase → PR → review 中完成。

---
handoff_id: HANDOFF-RELATION-031
spec_id: SPEC-RELATION-031
spec_version: 1.1.0
status: approved
prepared_by: "Codex E1/E2"
prepared_at: 2026-08-20
actual_issue_creation: false
---

# 统一真实朋友圈内容流与来源筛选 — Issue Handoff

## 1. 交接摘要

- **源规格**：`SPEC-RELATION-031@1.1.0`
- **用户问题**：朋友圈工作台会把碎银 `group_context` 混入真实朋友圈，来源不够精确；本地 adapter 尚未把现有 MCP 的朋友圈读取结果接入可信 feed。
- **完成后变化**：feed 只显示 trusted moment，可按“我的微信 / 碎银 · 官方人设”筛选；碎银由本地 adapter 复用现有 MCP，exact persona provenance、稳定分页和完整性回执不成立时具体 fail closed。
- **目标仓范围**：仅私有 `xfang9528-glitch/relationship-workbench-prototype`；现有 MCP 是读取来源，不是修改目标。
- **纠错**：生产 MCP Slice 与 `PetWebOrg/suiyin_mcp#19` 已撤回；当前没有为 T031 创建真实 Issue，故 `actual_issue_creation:false`。

## 2. Source Contract

- 唯一行为真源：`SPEC-RELATION-031@1.1.0` 的 `spec.md`。
- 来源合同：`SOURCE-CONTRACT-UNIFIED-REAL-MOMENTS-031@1.1.0`。
- Constitution：`prototype-sdd@1.4.0`。
- 禁止漂移：`group_context`/chat excerpt 永不进入朋友圈；现有 MCP 的具体工具名/参数只由 live schema discovery 决定；“只读”仅为关系助手调用边界。

## 3. Issue Slices

| Slice ID | Issue Title | Target Repo | Tenant | Platform | Reporter | Rules | Acceptance | Test IDs | User Problem | User Outcome | Issue Ref | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| I001 | feat(moments): 统一真实朋友圈内容流与来源筛选（只看到真正朋友圈，并能按我的微信或碎银官方人设筛选） | xfang9528-glitch/relationship-workbench-prototype | 不适用 | PC | 不适用（内部发现） | R001、R002、R003、R004、R005、R006、R007、R008、R009、R010、R011 | AC-R001-01、AC-R002-01、AC-R003-01、AC-R004-01、AC-R005-01、AC-R006-01、AC-R007-01、AC-R008-01、AC-R009-01、AC-R010-01、AC-R011-01 | T-R001-01、T-R002-01、T-R003-01、T-R004-01、T-R005-01、T-R006-01、T-R007-01、T-R008-01、T-R009-01、T-R010-01、T-R011-01 | 群聊上下文混入朋友圈，本地 adapter 又未消费现有 MCP moments，导致来源不可信 | feed 永久排除聊天；本地 adapter 复用现有 MCP，以精确 persona 来源展示真实朋友圈 | — | ready |

## 4. Existing MCP Local Adapter Contract

- 通过 live `tools/list`/input schema 发现并 allowlist 现有无副作用读取工具；文档不得编造新的 MCP 工具、参数或 API。
- 本地 canonical mapping 必须产生 stable moment/publisher identity、published instant、body/media text、exact persona provenance、stable pagination 与 completeness/failure receipt。
- mapping/schema/permission/pagination/receipt 失败返回 `LOCAL_SUIYIN_MOMENTS_ADAPTER_PENDING` 或更具体 typed error；禁止空数组成功、mock、`group_context` fallback 或 tenant-wide local guess。
- 自动测试只用 code-authored fictional live schemas/responses；0 真实 MCP/IDB/导出/private DOM。
- 不修改 `suiyin_mcp`、suiyin-go、Flutter、React 或 Go 生产仓。

## 5. Handoff Gate

- [x] 源 SPEC 为 `approved`，版本锁定 `1.1.0`。
- [x] 所有 MUST R-ID、AC-ID 与 Test ID 均分配到 I001。
- [x] I001 写清用户问题、用户结果和有效 metadata。
- [x] 生产 MCP Slice/#19 已从当前合同撤回。
- [x] `actual_issue_creation:false`，I001 为 ready，不冒充 created/doing/released。

## 6. Change Control

- SPEC、existing-MCP live schema、persona provenance、pagination/completeness 或 official registry 变化后，Source Contract、Handoff 与 Test Contract 全部 stale。
- 本地实现须另签版本化 task contract；本 Handoff 不创建真实 Issue，也不授权生产仓修改。

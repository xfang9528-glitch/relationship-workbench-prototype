---
handoff_id: HANDOFF-RELATION-030
spec_id: SPEC-RELATION-030
spec_version: 1.1.0
status: approved
prepared_by: "Codex E1/E2"
prepared_at: 2026-08-20
actual_issue_creation: true
---

# 微信与碎银统一六项来源覆盖回执 — Issue Handoff

## 1. 交接摘要

- **源规格**：`SPEC-RELATION-030@1.1.0`
- **用户问题**：微信与碎银来源卡的统计单位和完整性状态不一致，完整好友、聊天、消息和朋友圈容易被误读。
- **完成后变化**：两张卡固定展示同序六项；微信 roster 由独立 exporter 交付，碎银由关系助手本地 adapter 复用现有 MCP，按 exact/partial/blocked 和具体失败状态诚实投影。
- **目标仓范围**：私有关系助手原型与私有微信 exporter；不修改 `PetWebOrg/suiyin_mcp`。
- **纠错**：`PetWebOrg/suiyin_mcp#19` 基于错误能力假设创建，已撤回并应关闭为 not planned。`actual_issue_creation: true` 仅因为 exporter Issue #1 真实存在。

## 2. Source Contract

- 唯一行为真源：`SPEC-RELATION-030@1.1.0` 的 `spec.md`。
- 来源合同：`SOURCE-CONTRACT-UNIFIED-COVERAGE-030@1.1.0`。
- Constitution：`prototype-sdd@1.4.0`。
- 禁止漂移：Issue 只承接本表 R/AC；不得把单聊观察对象冒充完整好友，不得把旧 current-allocation 路径当成 MCP 能力上限，不得用 `group_context`/空数组/mock 冒充朋友圈。

## 3. Issue Slices

| Slice ID | Issue Title | Target Repo | Tenant | Platform | Reporter | Rules | Acceptance | Test IDs | User Problem | User Outcome | Issue Ref | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| I001 | feat(sources): 统一微信与碎银六项覆盖回执（能逐项看清已读取、部分、未知和受阻，不再把消息数当聊天数） | xfang9528-glitch/relationship-workbench-prototype | 不适用 | PC | 不适用（内部发现） | R001、R002、R003、R004、R005、R006、R007、R008、R009、R010 | AC-R001-01、AC-R002-01、AC-R003-01、AC-R004-01、AC-R005-01、AC-R006-01、AC-R007-01、AC-R008-01、AC-R009-01、AC-R010-01 | T-R001-01、T-R002-01、T-R003-01、T-R004-01、T-R005-01、T-R006-01、T-R007-01、T-R008-01、T-R009-01、T-R010-01 | 两张来源卡单位不一致，旧本地碎银 adapter 又未完整消费现有 MCP，容易把局部范围误读成能力缺失 | 两张卡使用同一六项；碎银本地 adapter 复用现有 MCP，并按实际回执诚实展示 | — | ready |
| I002 | feat(exporter): 导出可信联系人 roster 与完整性回执（来源页能显示有证据的完整微信好友数，不再只能显示受阻） | xfang9528-glitch/wechat-export-toolkit | 不适用 | Win | 不适用（内部发现） | R003 | AC-R003-01 | T-R003-02 | 当前 exporter 只证明来源中出现过的人，不能证明完整通讯录 | exporter 提供可验证 roster 后，来源页能诚实显示完整好友数 | xfang9528-glitch/wechat-export-toolkit#1 | created |

## 4. Exporter Production Slice

- 独立私有工程仓：`xfang9528-glitch/wechat-export-toolkit`；真实导出、配置和敏感文件不得进入 GitHub。
- roster 必须来自 exporter 自身可证明的联系人范围，包含 stable source-owned identity、范围/失败/完整性回执和 schema revision。
- 不得从会话、朋友圈发布者、昵称或列表顺序反推完整好友；媒体、聊天正文和本机路径不进入 roster。
- PR 测试必须保留 `T-R003-02` 或 `AC-R003-01`。

## 5. Existing MCP Local Slice

- I001 通过 live `tools/list`/input schema 发现并 allowlist 现有读取工具；具体工具名/参数不得由旧本地代码臆造。
- “只读”只约束关系助手调用副作用：显式点击、0 自动读取、0 分配/发送/切环境/改备注；它不是 MCP 新能力。
- fictional tests 覆盖 persona/customer/chat/moments 映射、exact/partial/blocked、分页/权限/完整性、稳定去重与 0 敏感公开输出。
- 不创建新的 MCP Issue，不修改 `suiyin_mcp`、suiyin-go、Flutter、React 或 Go 生产仓。

## 6. Handoff Gate

- [x] 源 SPEC 为 `approved`，版本锁定 `1.1.0`。
- [x] 所有 MUST R-ID 与 AC-ID 已分配到 Slice。
- [x] 每个 Slice 都写清用户问题、用户结果和有效 metadata。
- [x] 每个 Slice 引用的 Test ID 均存在于同目录 Test Contract。
- [x] 房总已授权修正工程 Handoff；唯一生产 Issue 为 exporter #1。
- [x] 错误的 MCP Slice/#19 已从当前 Handoff 撤回。

## 7. Change Control

- SPEC、来源合同或现有 MCP live schema 变化后本 Handoff 自动 stale，必须重跑追踪校验。
- exporter 实现只在正式 Issue → worktree → Phase → PR → review 中完成。
- I001 在本规格中只是 ready；另签本地 task contract 前不得宣称实现或验证。

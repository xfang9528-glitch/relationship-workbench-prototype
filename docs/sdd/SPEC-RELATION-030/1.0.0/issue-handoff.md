---
handoff_id: HANDOFF-RELATION-030
spec_id: SPEC-RELATION-030
spec_version: 1.0.0
status: approved
prepared_by: "Codex E1/E2"
prepared_at: 2026-08-20
actual_issue_creation: false
---

# 微信与碎银统一六项来源覆盖回执 — Issue Handoff

## 1. 交接摘要

- **源规格**：`SPEC-RELATION-030@1.0.0`
- **用户问题**：微信与碎银来源卡的统计单位和完整性状态不一致，完整好友、聊天、消息和朋友圈能力容易被误读。
- **完成后变化**：两张卡固定展示同序六项，并明确 exact、partial、legacy-unknown、upstream-unsupported 或 blocked；可信上游到位后，完整好友和三人设范围有可核验回执。
- **目标仓范围**：关系助手原型、未来独立微信 exporter 工程仓、`PetWebOrg/suiyin_mcp`。
- **真实 Issue 授权**：房总于 2026-08-20 已授权；私有工程仓 `xfang9528-glitch/wechat-export-toolkit` 已建立，当前仅因远端版本化 SDD 包尚未发布而保持 `actual_issue_creation: false`。

## 2. Source Contract

- 唯一行为真源：`SPEC-RELATION-030@1.0.0` 的 `spec.md`。
- 来源合同：`SOURCE-CONTRACT-UNIFIED-COVERAGE-030@1.0.0`。
- Constitution：`prototype-sdd@1.4.0`。
- 禁止漂移：Issue 只承接本表 R/AC；上游实现不能把观察到的单聊对象冒充完整好友，也不能把 current allocation 冒充三人设完整范围。

## 3. Issue Slices

| Slice ID | Issue Title | Target Repo | Tenant | Platform | Reporter | Rules | Acceptance | Test IDs | User Problem | User Outcome | Issue Ref | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| I001 | feat(sources): 统一微信与碎银六项覆盖回执（能逐项看清已读取、部分、未知、受阻和不支持，不再把消息数当聊天数） | xfang9528-glitch/relationship-workbench-prototype | 不适用 | PC | 不适用（内部发现） | R001、R002、R003、R004、R005、R006、R007、R008、R009、R010 | AC-R001-01、AC-R002-01、AC-R003-01、AC-R004-01、AC-R005-01、AC-R006-01、AC-R007-01、AC-R008-01、AC-R009-01、AC-R010-01 | T-R001-01、T-R002-01、T-R003-01、T-R004-01、T-R005-01、T-R006-01、T-R007-01、T-R008-01、T-R009-01、T-R010-01 | 两张来源卡单位不一致，未知与零、片段与完整范围容易混淆 | 两张卡用同一六项和显式状态展示，用户能判断每项实际覆盖范围 | — | ready |
| I002 | feat(exporter): 导出可信联系人 roster 与完整性回执（来源页能显示有证据的完整微信好友数，不再只能显示受阻） | xfang9528-glitch/wechat-export-toolkit | 不适用 | Win | 不适用（内部发现） | R003 | AC-R003-01 | T-R003-02 | 当前 exporter 只证明来源中出现过的人，不能证明完整通讯录，来源页只能把好友数标为受阻 | exporter 提供可验证的完整联系人 roster 与范围回执后，来源页能诚实显示完整好友数 | — | planned |
| I003 | feat(mcp): 增加三人设客户范围与朋友圈只读能力（房总可以核对三个碎银账号的完整好友，并按人设查看真实朋友圈） | PetWebOrg/suiyin_mcp | 碎银 | 不适用 | 不适用（内部发现） | R006、R007、R008、R009 | AC-R006-01、AC-R007-01、AC-R008-01、AC-R009-01 | T-R006-02、T-R007-02、T-R008-02、T-R009-02 | 现有 MCP 只能读 current allocation 片段，不能证明三个官方人设的完整客户范围，也没有朋友圈能力 | MCP 能按官方人设有界、稳定、只读地返回完整客户与朋友圈范围，并提供 applied filter 和 completeness 回执 | — | ready |

## 4. Production Issue Drafts

### I002 — 微信 exporter 联系人 roster

- 必须先建立独立、私有且可正式走 worktree/PR 的 exporter 工程仓；当前本机目录不是 GitHub 仓，不能把跟踪仓冒充代码仓。
- roster 必须是 exporter 自身可证明的联系人范围，包含稳定 source-owned identity、范围/失败/完整性回执和 schema/revision。
- 不得从会话、朋友圈发布者、昵称或列表顺序反推完整好友；媒体、聊天正文和本机路径不进入 roster。
- PR 测试必须保留 `T-R003-02` 或 `AC-R003-01`。

### I003 — 碎银 MCP 三人设 cohort

- `search_customer` 暴露并严格校验 `wc_ids`，回显 canonical `applied_wc_ids`；`client_ids` 等未生效过滤必须 fail closed。
- 返回真实分页 metadata、稳定 snapshot/cursor 与 per-persona completeness/failure；正常有界量不要求改 `suiyin-go`，超过 10k 时必须稳定游标或明确受阻。
- current-allocation 仍为 partial；只有 3/3 persona、过滤回显、稳定分页和 0 completeness failure 才可标 complete。
- public 输出只保留安全 label/hash/count，raw ID 仅在 importer 局部内存使用。
- 本 Issue 还会同时引用 `SPEC-RELATION-031@1.0.0` 的 Suiyin moments 合同。

## 5. Handoff Gate

- [x] 源 SPEC 为 `approved`，版本锁定 `1.0.0`。
- [x] 所有 MUST R-ID 与 AC-ID 已分配到 Slice。
- [x] 每个 Slice 都写清用户问题、用户结果和有效 metadata。
- [x] 每个 Slice 引用的 Test ID 均存在于同目录 Test Contract。
- [x] 房总已明确授权建立正式 Handoff/Issue。
- [ ] 远端版本化 SDD 包已发布并可由工程师访问。
- [ ] 微信 exporter 独立工程仓已确定。
- [ ] 真实 Issue 已创建并回填 Issue Ref。

## 6. Change Control

- SPEC、来源合同或上游 schema 变化后本 Handoff 自动 stale，必须重跑追踪校验。
- 生产实现只在各自正式仓独立 Issue → worktree → Phase → PR → review 中完成。
- `actual_issue_creation` 只有在两个真实 Issue 建成并通过创建后 DR-072 校验后才可改为 `true`。

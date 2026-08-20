---
test_contract_id: TEST-CONTRACT-RELATION-030
spec_id: SPEC-RELATION-030
spec_version: 1.0.0
status: approved
prepared_by: "Codex E1/E2"
prepared_at: 2026-08-20
---

# 微信与碎银统一六项来源覆盖回执 — Test Contract

## 1. 测试摘要

- **源规格**：`SPEC-RELATION-030@1.0.0`
- **对应 Handoff**：`HANDOFF-RELATION-030`
- **目标**：同时约束本机六项回执、微信 roster 上游和碎银三人设完整性上游。
- **边界**：所有自动测试使用 code-authored fictional fixtures；真实数据、真实 MCP 和生产实现只在对应正式工程流程运行。

## 2. Coverage Matrix

| Test ID | Slice ID | Rule | Acceptance | Layer | Automation | Target Repo | Planned Test Path | Oracle | CI Evidence | Manual Reason |
|---|---|---|---|---|---|---|---|---|---|---|
| T-R001-01 | I001 | R001 | AC-R001-01 | e2e | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-pilot.mjs | 微信与碎银卡均以固定顺序输出六项且聊天数与消息数分离 | planned | — |
| T-R002-01 | I001 | R002 | AC-R002-01 | domain | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-local-vault.mjs | 每项恰有一态，只有 exact 或 partial 可带非负整数，其余 value 为 null | planned | — |
| T-R003-01 | I001 | R003 | AC-R003-01 | e2e | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-pilot.mjs | 无 roster 时好友 blocked，观察人数仅显示为本批次单聊出现人数 | planned | — |
| T-R004-01 | I001 | R004 | AC-R004-01 | domain | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-local-vault.mjs | 虚构 canonical 输入的单聊、群聊、各自消息和 moments 精确对账 | planned | — |
| T-R005-01 | I001 | R005 | AC-R005-01 | integration | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-local-vault.mjs | coverage receipt 同 generation 提交、备份恢复不变、legacy 打开 0 migration | planned | — |
| T-R006-01 | I001 | R006 | AC-R006-01 | integration | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-suiyin-mcp.mjs | current-allocation 五项为 partial，moments 为 upstream-unsupported/null | planned | — |
| T-R007-01 | I001 | R007 | AC-R007-01 | contract | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-suiyin-mcp.mjs | 任一 3/3、filter echo、pagination 或 completeness 条件失败均不能 exact | planned | — |
| T-R008-01 | I001 | R008 | AC-R008-01 | domain | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-suiyin-mcp.mjs | per-persona 保留、aggregate 按 stable identity 去重，交集不明整批 blocked | planned | — |
| T-R009-01 | I001 | R009 | AC-R009-01 | security | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-pilot.mjs | DOM、日志、错误和 backup receipt 不含 raw ID、姓名、正文、路径或 handle | planned | — |
| T-R010-01 | I001 | R010 | AC-R010-01 | contract | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-prototype.mjs | 无真实数据与 E4/E5 时报告上限为 PREVIEW-VALIDATED，阻断态保持 | planned | — |
| T-R003-02 | I002 | R003 | AC-R003-01 | contract | automated | xfang9528-glitch/wechat-export-toolkit | tests/test_export_contacts.py | 虚构数据库中 roster 数量、稳定 ID、范围与 completeness 回执精确；缺表或缺页 fail closed | planned | — |
| T-R006-02 | I003 | R006 | AC-R006-01 | contract | automated | PetWebOrg/suiyin_mcp | internal/tools/search_customer_scope_test.go | 未请求 complete 或仅 current allocation 时响应明确 partial，不产生 exact 完整范围 | planned | — |
| T-R007-02 | I003 | R007 | AC-R007-01 | integration | automated | PetWebOrg/suiyin_mcp | internal/tools/search_customer_wc_ids_test.go | wc_ids 严格转发并回显 applied_wc_ids，分页/权限/过滤任一失配 fail closed | planned | — |
| T-R008-02 | I003 | R008 | AC-R008-01 | integration | automated | PetWebOrg/suiyin_mcp | internal/tools/persona_complete_receipt_test.go | 三 persona 分页稳定，per-persona 与 aggregate 可对账，未知交集不简单相加 | planned | — |
| T-R009-02 | I003 | R009 | AC-R009-01 | security | automated | PetWebOrg/suiyin_mcp | internal/tools/persona_scope_redaction_test.go | typed error 与公开回执不泄漏 raw client、wc、customer、cursor 或正文 | planned | — |

## 3. Test Data & Profiles

| Data ID | Tenant / Profile | 前置数据 | 隐私处理 | 覆盖 Test IDs |
|---|---|---|---|---|
| D001 | owner_local / bzds prototype | 纯虚构微信、碎银 partial/complete、legacy、backup 与 poison fixtures | 不读取真实导出、IDB 或 MCP | T-R001-01、T-R002-01、T-R003-01、T-R004-01、T-R005-01、T-R006-01、T-R007-01、T-R008-01、T-R009-01、T-R010-01 |
| D002 | Windows exporter | 纯虚构联系人数据库，含空表、重复、分页漂移、删除和权限失败 | 不从真实微信数据库采样或脱敏 | T-R003-02 |
| D003 | bzds MCP | httptest 虚构 persona、客户、分页和过滤回显 | 0真实账号、token、客户或聊天正文 | T-R006-02、T-R007-02、T-R008-02、T-R009-02 |

## 4. CI Gates

- 两个生产 Issue 的 PR 必须运行其 Slice 对应 Test IDs，并在测试名、报告或 artifact 中保留 Test ID 或 AC-ID。
- exporter 仓未建立前 `T-R003-02` 只能保持 planned，不能宣称已验证。
- MCP 只有 filter echo、stable pagination、permission intersection 和 completeness 全部通过后才可解除 T028 blocker。
- 任一测试的业务 Oracle 有争议时回到 `SPEC-RELATION-030@1.0.0`，不得由生产实现反向改写。

## 5. Evidence

| Evidence ID | Test IDs | 类型 | 位置 | 保留时机 |
|---|---|---|---|---|
| EV001 | T-R001-01、T-R002-01、T-R003-01、T-R004-01、T-R005-01、T-R006-01、T-R007-01、T-R008-01、T-R009-01、T-R010-01 | local CI / preview report | planned relationship-workbench PR and review artifacts | prototype PR / preview |
| EV002 | T-R003-02 | exporter CI | planned dedicated exporter repository actions artifact | exporter PR |
| EV003 | T-R006-02、T-R007-02、T-R008-02、T-R009-02 | Go CI | planned PetWebOrg/suiyin_mcp actions artifact | MCP PR |

## 6. Change Control

- SPEC、roster schema、MCP filter/pagination 或 source contract 变化后本合同立即 stale。
- `approved` 只表示测试合同可用于建单；Evidence 仍是 planned，不得解释为通过。

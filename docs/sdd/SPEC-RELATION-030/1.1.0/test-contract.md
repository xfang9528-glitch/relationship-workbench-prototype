---
test_contract_id: TEST-CONTRACT-RELATION-030
spec_id: SPEC-RELATION-030
spec_version: 1.1.0
status: approved
prepared_by: "Codex E1/E2"
prepared_at: 2026-08-20
---

# 微信与碎银统一六项来源覆盖回执 — Test Contract

## 1. 测试摘要

- **源规格**：`SPEC-RELATION-030@1.1.0`
- **对应 Handoff**：`HANDOFF-RELATION-030`
- **目标**：约束本机六项回执、现有 MCP 的本地 adapter 映射，以及微信 exporter roster。
- **边界**：本地自动测试只使用 code-authored fictional MCP schemas/responses、导出和图；不读取真实 MCP、真实导出、IDB 或私人 DOM。生产代码只存在于 exporter #1 的独立工程流程。

## 2. Coverage Matrix

| Test ID | Slice ID | Rule | Acceptance | Layer | Automation | Target Repo | Planned Test Path | Oracle | CI Evidence | Manual Reason |
|---|---|---|---|---|---|---|---|---|---|---|
| T-R001-01 | I001 | R001 | AC-R001-01 | e2e | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-pilot.mjs | 微信与碎银卡均以固定顺序输出六项且聊天数与消息数分离 | planned | — |
| T-R002-01 | I001 | R002 | AC-R002-01 | domain | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-local-vault.mjs | 每项恰有一态，只有 exact/partial 可带非负整数，其余为 null；当前碎银不投影 upstream-unsupported | planned | — |
| T-R003-01 | I001 | R003 | AC-R003-01 | e2e | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-pilot.mjs | 无 roster 时好友 blocked，观察人数仅显示为本批次单聊出现人数 | planned | — |
| T-R004-01 | I001 | R004 | AC-R004-01 | domain | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-local-vault.mjs | 虚构 canonical 输入的单聊、群聊、各自消息和 moments 精确对账 | planned | — |
| T-R005-01 | I001 | R005 | AC-R005-01 | integration | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-local-vault.mjs | receipt 同 generation 提交、备份恢复不变、legacy 打开 0 migration | planned | — |
| T-R006-01 | I001 | R006 | AC-R006-01 | integration | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-suiyin-mcp.mjs | fictional existing-MCP schema/response 可映射好友、会话、消息和 moments；complete 为 exact，受限读取为 partial/blocked | planned | — |
| T-R007-01 | I001 | R007 | AC-R007-01 | contract | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-suiyin-mcp.mjs | 任一 3/3、scope evidence、pagination 或 completeness 条件失败均不能 exact，并返回具体 local typed 状态 | planned | — |
| T-R008-01 | I001 | R008 | AC-R008-01 | domain | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-suiyin-mcp.mjs | per-persona 保留、aggregate 按 stable identity 去重，交集不明整批 blocked | planned | — |
| T-R009-01 | I001 | R009 | AC-R009-01 | security | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-pilot.mjs | DOM、日志、错误和 backup receipt 不含 raw ID、姓名、正文、路径或 handle | planned | — |
| T-R010-01 | I001 | R010 | AC-R010-01 | contract | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-prototype.mjs | 无真实数据/E4/E5 时上限为 PREVIEW-VALIDATED，且不把本地接线失败写成 MCP 能力缺失 | planned | — |
| T-R003-02 | I002 | R003 | AC-R003-01 | contract | automated | xfang9528-glitch/wechat-export-toolkit | tests/test_export_contacts.py | 虚构数据库中 roster 数量、stable ID、范围与 completeness 精确；缺表、缺页或漂移 fail closed | planned | — |

## 3. Test Data & Profiles

| Data ID | Tenant / Profile | 前置数据 | 隐私处理 | 覆盖 Test IDs |
|---|---|---|---|---|
| D001 | owner_local / bzds prototype | 纯虚构微信、existing-MCP tool schemas/responses、碎银 complete/partial/failure、legacy、backup 与 poison fixtures | 不读取真实导出、IDB 或 MCP | T-R001-01、T-R002-01、T-R003-01、T-R004-01、T-R005-01、T-R006-01、T-R007-01、T-R008-01、T-R009-01、T-R010-01 |
| D002 | Windows exporter | 纯虚构联系人数据库，含空表、重复、分页漂移、删除和权限失败 | 不从真实微信数据库采样或脱敏 | T-R003-02 |

## 4. CI Gates

- 本地 I001 在另签 task contract 后运行其 Test IDs；在此之前 Evidence 保持 planned。
- exporter #1 的 PR 必须运行 `T-R003-02`，并在测试名、报告或 artifact 中保留 Test ID 或 AC-ID；仓已建立，但实现前 CI Evidence 仍是 planned。
- 不存在 MCP/Go 生产 Slice 或 PR Gate；schema mapping、stable pagination、permission 和 completeness 全部由本地 fictional adapter contract 验证，真实联通另受 E4/E5 边界约束。
- 任一业务 Oracle 有争议时回到 `SPEC-RELATION-030@1.1.0`，不得由代码或旧 Issue 反向改写。

## 5. Evidence

| Evidence ID | Test IDs | 类型 | 位置 | 保留时机 |
|---|---|---|---|---|
| EV001 | T-R001-01、T-R002-01、T-R003-01、T-R004-01、T-R005-01、T-R006-01、T-R007-01、T-R008-01、T-R009-01、T-R010-01 | local CI / preview report | planned relationship-workbench review artifacts | local task / preview |
| EV002 | T-R003-02 | exporter CI | planned private exporter actions artifact | exporter PR |

## 6. Change Control

- SPEC、roster schema、existing-MCP live schema/mapping 或 source contract 变化后本合同立即 stale。
- `approved` 只表示测试合同可供执行；Evidence 仍是 planned，不得解释为通过。

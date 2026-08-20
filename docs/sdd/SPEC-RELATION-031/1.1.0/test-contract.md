---
test_contract_id: TEST-CONTRACT-RELATION-031
spec_id: SPEC-RELATION-031
spec_version: 1.1.0
status: approved
prepared_by: "Codex E1/E2"
prepared_at: 2026-08-20
---

# 统一真实朋友圈内容流与来源筛选 — Test Contract

## 1. 测试摘要

- **源规格**：`SPEC-RELATION-031@1.1.0`
- **对应 Handoff**：`HANDOFF-RELATION-031`
- **目标**：证明 feed 资格、来源、隐私、性能，以及现有 MCP → 本地 moments canonical mapping 都可机器判定。
- **边界**：全部测试使用 code-authored fictional graph、MCP schemas/responses 和 privacy canaries；不读取真实客户、聊天、朋友圈、IDB、导出或 MCP。

## 2. Coverage Matrix

| Test ID | Slice ID | Rule | Acceptance | Layer | Automation | Target Repo | Planned Test Path | Oracle | CI Evidence | Manual Reason |
|---|---|---|---|---|---|---|---|---|---|---|
| T-R001-01 | I001 | R001 | AC-R001-01 | domain | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-local-vault.mjs | trusted moments 可见；group_context/excerpt/unknown/untrusted 为 0 卡、0计数 | planned | — |
| T-R002-01 | I001 | R002 | AC-R002-01 | domain | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-local-vault.mjs | kindless trusted WeChat 只读兼容；Suiyin/unknown 同 shape 不兼容；0 migration/write | planned | — |
| T-R003-01 | I001 | R003 | AC-R003-01 | integration | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-suiyin-mcp.mjs | fictional existing-MCP mapping 仅从 record provenance 产生“我的微信/碎银·official”；冲突不猜号 | planned | — |
| T-R004-01 | I001 | R004 | AC-R004-01 | e2e | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-pilot.mjs | 来源同组 OR，与文本/身份/分类 AND；变化回第1页 | planned | — |
| T-R005-01 | I001 | R005 | AC-R005-01 | e2e | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-pilot.mjs | 卡片字段完整、长文本可读、0顺序编号 | planned | — |
| T-R006-01 | I001 | R006 | AC-R006-01 | security | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-pilot.mjs | 0 raw epoch/ID/alias/path；generation-bound opaque token stale 0写 | planned | — |
| T-R007-01 | I001 | R007 | AC-R007-01 | integration | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-pilot.mjs | 10k/20k 下每页/live cards≤50、每generation一次基础投影、200ms latest-wins、feed-only render | planned | — |
| T-R008-01 | I001 | R008 | AC-R008-01 | integration | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-local-vault.mjs | generation 变化丢弃旧 timer/token/cache；全部只读动作 persistent write=0 | planned | — |
| T-R009-01 | I001 | R009 | AC-R009-01 | contract | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-suiyin-mcp.mjs | existing-MCP fictional schema/output 可发现映射；local mismatch/permission/page/receipt 具体 fail closed，0 upstream-missing 断言 | planned | — |
| T-R010-01 | I001 | R010 | AC-R010-01 | integration | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-suiyin-mcp.mjs | exact persona provenance、stable page/snapshot/completeness 闭合后 moments 进入 staging；0 mock/group fallback/production API need | planned | — |
| T-R011-01 | I001 | R011 | AC-R011-01 | integration | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-prototype.mjs | T028@1.1.0 partial/complete receipt 与 T029 diff/CAS/time/legacy 不变 | planned | — |

## 3. Test Data & Profiles

| Data ID | Tenant / Profile | 前置数据 | 隐私处理 | 覆盖 Test IDs |
|---|---|---|---|---|
| D001 | owner_local / bzds prototype | mixed canonical/legacy/group/unknown、existing-MCP tool schemas/moments、多页、filters、stale、10k/20k fixtures | 全部人为虚构，0真实正文/IDB/MCP | T-R001-01、T-R002-01、T-R003-01、T-R004-01、T-R005-01、T-R006-01、T-R007-01、T-R008-01、T-R009-01、T-R010-01、T-R011-01 |

## 4. CI Gates

- I001 在版本化本地 task contract 签发后运行全部 11 个 Test ID；在此之前 Evidence 均为 planned。
- R009/R010 必须证明 existing-MCP local mapping、exact provenance、stable pagination/completeness 和 0 chat fallback；不建立 MCP/Go 生产 PR Gate。
- 无真实数据/E4/E5 时最多 `PREVIEW-VALIDATED`，不得把 fictional adapter tests 表述为 live 联通。
- 任一业务 Oracle 有争议时回到 `SPEC-RELATION-031@1.1.0`，不得由旧 #19 或代码反向改写。

## 5. Evidence

| Evidence ID | Test IDs | 类型 | 位置 | 保留时机 |
|---|---|---|---|---|
| EV001 | T-R001-01、T-R002-01、T-R003-01、T-R004-01、T-R005-01、T-R006-01、T-R007-01、T-R008-01、T-R009-01、T-R010-01、T-R011-01 | local CI / preview report | planned relationship-workbench review artifacts | local task / preview |

## 6. Change Control

- SPEC、existing-MCP schema/mapping、persona provenance、pagination/completeness 或 source contract 变化后本合同立即 stale。
- `approved` 只表示测试合同可执行；Evidence 仍是 planned，不得解释为通过。

---
test_contract_id: TEST-CONTRACT-RELATION-031
spec_id: SPEC-RELATION-031
spec_version: 1.0.0
status: approved
prepared_by: "Codex E1/E2"
prepared_at: 2026-08-20
---

# 统一真实朋友圈内容流与来源筛选 — Test Contract

## 1. 测试摘要

- **源规格**：`SPEC-RELATION-031@1.0.0`
- **对应 Handoff**：`HANDOFF-RELATION-031`
- **目标**：证明 feed 资格、来源、隐私、性能和碎银 moments 上游能力都可机器判定。
- **边界**：本机测试只用虚构 graph；生产 MCP 测试只用 Go fixtures/httptest，不读取真实客户、聊天或朋友圈。

## 2. Coverage Matrix

| Test ID | Slice ID | Rule | Acceptance | Layer | Automation | Target Repo | Planned Test Path | Oracle | CI Evidence | Manual Reason |
|---|---|---|---|---|---|---|---|---|---|---|
| T-R001-01 | I001 | R001 | AC-R001-01 | domain | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-local-vault.mjs | mixed fixture 只投影 trusted moment，group_context、excerpt、unknown/untrusted 均 0 卡 0 计数 | planned | — |
| T-R002-01 | I001 | R002 | AC-R002-01 | domain | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-local-vault.mjs | kindless legacy 仅 trusted active WeChat 可见，open/search/reopen graph write 为 0 | planned | — |
| T-R003-01 | I001 | R003 | AC-R003-01 | security | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-pilot.mjs | 每条记录按自身 provenance 显示我的微信或 exact 官方人设，冲突来源不猜测 | planned | — |
| T-R004-01 | I001 | R004 | AC-R004-01 | e2e | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-pilot.mjs | 来源同组 OR，与文本、身份、分类 AND，任一变化回第 1 页 | planned | — |
| T-R005-01 | I001 | R005 | AC-R005-01 | e2e | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-pilot.mjs | 卡片字段完整、空态明确、无顺序编号，长文本可访问 | planned | — |
| T-R006-01 | I001 | R006 | AC-R006-01 | security | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-pilot.mjs | DOM/action/log/error 0 raw epoch、ID、alias；stale opaque token 0写 | planned | — |
| T-R007-01 | I001 | R007 | AC-R007-01 | integration | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-pilot.mjs | 10k/20k fixture 每页和 live cards 不超过 50，同 generation 投影一次、200ms latest-wins、feed-only render | planned | — |
| T-R008-01 | I001 | R008 | AC-R008-01 | integration | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-local-vault.mjs | generation 变化丢弃旧 timer/token/cache，重建后所有只读动作 graph/persistent-cache write 为 0 | planned | — |
| T-R009-01 | I001 | R009 | AC-R009-01 | contract | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-pilot.mjs | current capability 固定 upstream-blocked，0伪 moments 调用、0 mock、0 group fallback | planned | — |
| T-R010-01 | I001 | R010 | AC-R010-01 | contract | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-prototype.mjs | 上游未通过新 source contract 与 task contract 前 adapter 不存在且状态不变 | planned | — |
| T-R011-01 | I001 | R011 | AC-R011-01 | integration | automated | xfang9528-glitch/relationship-workbench-prototype | scripts/test-local-vault.mjs | T028 partial/blocker 与 T029 diff/CAS/receipt/time/legacy 在 feed 操作后 deep-equal 保持 | planned | — |
| T-R003-02 | I002 | R003 | AC-R003-01 | contract | automated | PetWebOrg/suiyin_mcp | internal/tools/moments_persona_attribution_test.go | exact applied persona 与每条 moment attribution 可闭合，缺失或冲突整批 fail closed | planned | — |
| T-R009-02 | I002 | R009 | AC-R009-01 | integration | automated | PetWebOrg/suiyin_mcp | internal/tools/list_persona_moments_test.go | MCP 只返回 moment rows，不混客户、群聊或聊天 message，缺能力返回 typed unavailable | planned | — |
| T-R010-02 | I002 | R010 | AC-R010-01 | integration | automated | PetWebOrg/suiyin_mcp | internal/tools/persona_moments_pagination_test.go | exact persona filter、稳定 snapshot/cursor、per-persona completeness 和 next page 在多页下无重漏 | planned | — |

## 3. Test Data & Profiles

| Data ID | Tenant / Profile | 前置数据 | 隐私处理 | 覆盖 Test IDs |
|---|---|---|---|---|
| D001 | owner_local / bzds prototype | mixed canonical/legacy/group/unknown、filters、stale 与 10k/20k code fixtures | 全部人为虚构，0真实正文/IDB/MCP | T-R001-01、T-R002-01、T-R003-01、T-R004-01、T-R005-01、T-R006-01、T-R007-01、T-R008-01、T-R009-01、T-R010-01、T-R011-01 |
| D002 | bzds MCP | httptest 虚构 persona、moments、多页、失败和 attribution 冲突 | 0真实账号、客户、聊天、朋友圈、token | T-R003-02、T-R009-02、T-R010-02 |

## 4. CI Gates

- 原型 Slice 的 local CI 必须证明 0 group_context feed、0 raw ID、0 open-time write 与 10k/20k 有界性能。
- MCP PR 必须证明 read-only、exact filter echo、稳定 pagination/snapshot、typed unavailable 和 0 chat fallback。
- MCP Issue 只有同时通过本合同与 `TEST-CONTRACT-RELATION-030` 的上游测试后，才能解除 T028/T031 blocker。
- Evidence 仍为 planned；任何 Issue/PR 不得把 planned 解释为已经通过。

## 5. Evidence

| Evidence ID | Test IDs | 类型 | 位置 | 保留时机 |
|---|---|---|---|---|
| EV001 | T-R001-01、T-R002-01、T-R003-01、T-R004-01、T-R005-01、T-R006-01、T-R007-01、T-R008-01、T-R009-01、T-R010-01、T-R011-01 | local CI / Chrome review | planned relationship-workbench PR and review artifacts | prototype PR / preview |
| EV002 | T-R003-02、T-R009-02、T-R010-02 | Go CI | planned PetWebOrg/suiyin_mcp actions artifact | MCP PR |

## 6. Change Control

- SPEC 或上游 moments contract 升版后本合同立即 stale。
- 业务 Oracle 只能由源 SPEC 修改；测试实现不能静默放宽 eligibility、privacy 或 completeness。

---
supersession_id: SUPERSESSION-CONTRACT-T028-V1
status: effective
source_spec: SPEC-RELATION-028@1.1.0
superseded_contract: contract-T028.md
superseded_spec_version: 1.0.0
effective_at: 2026-08-20
approved_by: 房总
---

# CONTRACT-T028 v1 撤销 / 取代记录

`contract-T028.md` 是为 `SPEC-RELATION-028@1.0.0` 签发并按字节冻结的历史任务合同。本记录不篡改该历史合同，但自 2026-08-20 起撤销其当前执行授权：不得再按其中 `fictional-preview-only-upstream-blocked`、`UPSTREAM_PERSONA_COHORT_UNAVAILABLE`、生产 MCP dependency 或 `PetWebOrg/suiyin_mcp#19` 相关前提实施、验证或 claim。

撤销原因：房总确认现有 MCP 已支持本项目全部读取能力；旧合同把关系助手本地 adapter 的固定 allowlist/current-allocation 路径误当成 MCP 能力上限。

后续若实施 T028，必须基于 `SPEC-RELATION-028@1.1.0`：

- 重新冻结 input revision 与允许写集合；
- 另签版本化 v2 task contract；
- 只在关系助手内完成 live schema discovery、read-only allowlist、existing-MCP mapping 和完整性回执；
- 不修改生产 MCP，不创建 MCP 能力 Issue；
- 自动测试只用 code-authored fictional schemas/responses，真实联通仍受 E4/E5 与显式数据授权边界约束。

旧合同与旧 SHA 仅保留为不可变审计史，不再是 active authorization。

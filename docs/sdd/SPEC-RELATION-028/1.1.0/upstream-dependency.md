---
dependency_id: DEP-RELATION-028-UPSTREAM-PERSONA-COHORT
status: withdrawn-invalid-assumption
source_spec: SPEC-RELATION-028@1.1.0
owner: 房总
recorded_at: 2026-08-20
supersedes: SPEC-RELATION-028@1.0.0-upstream-assumption
---

# T028 上游依赖撤回记录

## 1. 纠正结论

房总于 2026-08-20 明确确认：现有碎银 MCP 已支持关系助手所需的全部读取能力。此前把关系助手本地 `scripts/suiyin-mcp-client.mjs` 的固定 allowlist、current-allocation 路径和局部 schema 当成 MCP 的完整能力清单，进而要求新增“三人设客户范围与朋友圈只读能力”，属于错误的证据外推。

“只读”是关系助手的调用约束：只允许无副作用工具、只能由房总显式触发、默认不自动读取、0 发送/分配/改备注/切环境。它不是需要在 MCP 里再建设的一种能力。

## 2. 撤回范围

- 撤回 `UPSTREAM_PERSONA_COHORT_UNAVAILABLE` 作为默认 capability 结论。
- 撤回为 `search_customer` 新增特定参数/API 的工程需求；具体工具和字段只从现有 MCP live schema 选择，不在 SDD 中编造。
- 撤回生产 Issue `PetWebOrg/suiyin_mcp#19`；该 Issue 应关闭为 not planned，并保留纠错说明，不进入 worktree/PR。
- 保留完整性合同：exact persona scope、过滤/范围生效证据、稳定分页、权限边界、0 completeness failure 和安全公开回执仍必须成立。
- 保留 current-allocation partial 作为旧 adapter 路径的兼容回执，但它不能代表 MCP 的能力上限。

## 3. 正确工程边界

需要完成的工作只在 `E:/AI 项目/关系维护助手`：

1. 通过 `tools/list` 与 input schema 发现现有读取工具；
2. 建立只读 allowlist，并验证不会触发任何写副作用；
3. 将既有 MCP 返回映射为 T028/T030/T031 所需的 persona、客户、聊天、朋友圈和完整性回执；
4. 对 schema 不匹配、权限不足、分页漂移、运行失败和不完整回执 typed fail closed；
5. 自动测试只使用 code-authored fictional schema/response，不读取私人数据。

本记录不授权修改 `suiyin_mcp`、Flutter、React、Go 或任何生产仓。

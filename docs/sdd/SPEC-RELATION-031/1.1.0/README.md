# SPEC-RELATION-031@1.1.0 — 远端 SDD 纠正版交付包

本目录是“统一真实朋友圈内容流与来源筛选”的工程可接力合同快照，行为真源固定为 `SPEC-RELATION-031@1.1.0`。旧 `1.0.0` 包保留为不可变历史，但其“碎银 MCP 缺朋友圈读取能力”判断已被撤销。

工程师从这里继续：

1. 先读 [spec.md](./spec.md)，确认 R001-R011 与验收标准。
2. 再读 [plan.md](./plan.md)、[tasks.md](./tasks.md)、[source-contract.md](./source-contract.md) 与 [operational-profile.md](./operational-profile.md)。
3. 按 [issue-handoff.md](./issue-handoff.md) 承接唯一的本地 existing-MCP adapter/feed Slice。
4. 按 [test-contract.md](./test-contract.md) 建立可机器判定证据。
5. 用 [source-convergence.md](./source-convergence.md) 核对朋友圈资格、逐记录来源与时间语义已收敛。
6. 规则变化必须先回源 SPEC 升版，不得只改 Issue 或代码。

交付边界：

- 碎银读取复用现有 MCP，由 `xfang9528-glitch/relationship-workbench-prototype` 的本地 adapter 映射；不新增 MCP 工具/API。
- 错误 Issue `PetWebOrg/suiyin_mcp#19` 已撤回；本版本 `actual_issue_creation:false`，不创建替代生产 Issue。
- 原型目标：`xfang9528-glitch/relationship-workbench-prototype`，本包不宣称 T031 已实现或 live 验证。
- 本地实现须另签版本化 task contract；本次完整推送只交付纠正后的 SDD，不写产品或生产代码。
- 远端入口：`docs/sdd/SPEC-RELATION-031/1.1.0`。
- 交付标签：`v2026082002-existing-mcp-read-correction`。

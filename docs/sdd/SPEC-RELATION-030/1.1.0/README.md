# SPEC-RELATION-030@1.1.0 — 远端 SDD 纠正版交付包

本目录是“微信与碎银统一六项来源覆盖回执”的工程可接力合同快照，行为真源固定为 `SPEC-RELATION-030@1.1.0`。旧 `1.0.0` 包保留为不可变历史，但其中“碎银 MCP 缺读取能力”的判断已被本版本撤销。

工程师从这里继续：

1. 先读 [spec.md](./spec.md)，确认 R001-R010 与验收标准。
2. 再读 [plan.md](./plan.md)、[tasks.md](./tasks.md)、[source-contract.md](./source-contract.md) 与 [operational-profile.md](./operational-profile.md)。
3. 按 [issue-handoff.md](./issue-handoff.md) 承接本地 existing-MCP adapter 与 exporter 两个 Slice。
4. 按 [test-contract.md](./test-contract.md) 建立可机器判定证据。
5. 用 [source-convergence.md](./source-convergence.md) 核对旧统计口径已被新合同取代。
6. 规则变化必须先回源 SPEC 升版，不得只改 Issue 或代码。

交付边界：

- exporter 目标：私有仓 `xfang9528-glitch/wechat-export-toolkit`。
- exporter Issue：[xfang9528-glitch/wechat-export-toolkit#1](https://github.com/xfang9528-glitch/wechat-export-toolkit/issues/1)。
- 碎银目标：在 `xfang9528-glitch/relationship-workbench-prototype` 的本地 adapter 中复用现有 MCP，不新增 MCP 工具/API；错误 Issue #19 已撤回。
- 原型目标：`xfang9528-glitch/relationship-workbench-prototype`，本包不宣称 T030 已实现或 live 验证。
- 生产实现必须走正式 Issue、独立 worktree、测试、PR 与房总 review；本次完整推送不写生产代码。
- 远端入口：`docs/sdd/SPEC-RELATION-030/1.1.0`。
- 交付标签：`v2026082002-existing-mcp-read-correction`。

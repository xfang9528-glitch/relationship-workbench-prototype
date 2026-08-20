# SPEC-RELATION-030@1.0.0 — 远端 SDD 交付包

本目录是“微信与碎银统一六项来源覆盖回执”的工程可接力合同快照，行为真源固定为 `SPEC-RELATION-030@1.0.0`。

工程师从这里继续：

1. 先读 [spec.md](./spec.md)，确认 R001-R010 与验收标准。
2. 再读 [plan.md](./plan.md)、[tasks.md](./tasks.md)、[source-contract.md](./source-contract.md) 与 [operational-profile.md](./operational-profile.md)。
3. 按 [issue-handoff.md](./issue-handoff.md) 分别承接 exporter、碎银 MCP 与本地原型三个 Slice。
4. 按 [test-contract.md](./test-contract.md) 建立可机器判定证据。
5. 用 [source-convergence.md](./source-convergence.md) 核对旧统计口径已被新合同取代。
6. 规则变化必须先回源 SPEC 升版，不得只改 Issue 或代码。

交付边界：

- exporter 目标：私有仓 `xfang9528-glitch/wechat-export-toolkit`。
- 碎银上游目标：`PetWebOrg/suiyin_mcp`。
- exporter Issue：[xfang9528-glitch/wechat-export-toolkit#1](https://github.com/xfang9528-glitch/wechat-export-toolkit/issues/1)。
- 碎银 MCP Issue：[PetWebOrg/suiyin_mcp#19](https://github.com/PetWebOrg/suiyin_mcp/issues/19)。
- 原型目标：`xfang9528-glitch/relationship-workbench-prototype`，本包不宣称 T030 已实现。
- 生产实现必须走正式 Issue、独立 worktree、测试、PR 与房总 review；本次完整推送不写生产代码。
- 远端入口：`docs/sdd/SPEC-RELATION-030/1.0.0`。
- 交付标签：`v2026082001-unified-source-moments-sdd`。

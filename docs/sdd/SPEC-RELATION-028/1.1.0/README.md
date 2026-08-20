# SPEC-RELATION-028@1.1.0 — 远端 SDD 纠正版交付包

本目录纠正“碎银三账号完整可读范围”的能力前提：现有 MCP 已支持所需读取；关系助手只需在本地 adapter 复用并形成可验证回执。旧 `1.0.0` 合同与 upstream dependency 保留为审计史，但不再授权执行。

工程师从这里继续：

1. 先读 [spec.md](./spec.md)、[source-contract.md](./source-contract.md) 和 [operational-profile.md](./operational-profile.md)。
2. 读 [contract-T028-supersession.md](./contract-T028-supersession.md)，确认旧 v1 task contract 已撤销；另签 v2 前不得实施。
3. 读 [upstream-dependency.md](./upstream-dependency.md)，确认生产 MCP dependency/#19 已撤回。
4. 按 [plan.md](./plan.md) 与 [tasks.md](./tasks.md) 只在私有关系助手内准备 live schema discovery、read-only allowlist、existing-MCP mapping 与完整性回执。
5. 用 [source-convergence.md](./source-convergence.md) 核对旧能力误判已收敛。

交付边界：

- 不修改 `PetWebOrg/suiyin_mcp`、suiyin-go、Flutter、React 或 Go 生产仓。
- 不创建替代 MCP Issue；#19 关闭为 not planned。
- 自动测试只使用 code-authored fictional schemas/responses；本包不宣称真实数据或 live E4/E5 已验证。
- 远端入口：`docs/sdd/SPEC-RELATION-028/1.1.0`。
- 交付标签：`v2026082002-existing-mcp-read-correction`。

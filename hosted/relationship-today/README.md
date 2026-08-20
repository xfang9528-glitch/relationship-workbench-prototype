# 关系·今天 — 本机有状态实现快照

这是 `SPEC-RELATION-028@1.1.0`、`SPEC-RELATION-030@1.1.0` 与 `SPEC-RELATION-031@1.1.0` 的可运行源码快照。它补齐了统一六项来源回执、复用现有碎银 MCP 的只读本地适配，以及只显示可信朋友圈的内容流。

本目录是面向公开原型仓的净化副本：运行逻辑与本机实现一致，但人设名称、演示人物、统计夹具和测试环境全部使用显式虚构值；真实配置、真实统计和私人数据只留在本机，不与本目录逐字相同。

## 运行边界

- 运行类型：`hosted-stateful / local-loopback-only`。
- 只允许通过 `127.0.0.1:8765` 在本机 Chrome 中使用；仓库根目录 `_redirects` 会把 Pages 的 `/hosted/*` 请求重定向到静态演示首页，本目录不是公开在线产品入口。
- 页面数据只落在浏览器本机加密库，不登录、不云同步、不自动发送。
- 仓库内只包含源码与代码编写的纯虚构测试夹具，不包含真实联系人、聊天、朋友圈正文、账号凭据、浏览器数据库或本机截图。
- “只读”是关系助手调用现有 MCP 时的 allowlist 与副作用边界，不是要求碎银 MCP 新增一套只读接口。
- 本快照不携带 `SUIYIN_MCP_COMMAND`、`SUIYIN_MCP_ARGS` 或 `SUIYIN_MCP_ENVIRONMENT` 配置；任一必要配置缺失时，读取会安全返回 `MCP_UNAVAILABLE`，不会尝试自动寻找或调用 MCP。

## 本地预览

在本目录执行：

```powershell
node scripts/start-local-preview.mjs
```

然后用 Chrome 打开：

`http://127.0.0.1:8765/prototype/index.html#/sources`

真实碎银接线由本机私有配置提供：`SUIYIN_MCP_COMMAND` 指向 MCP 启动程序，`SUIYIN_MCP_ARGS` 是可选 JSON 字符串数组，`SUIYIN_MCP_ENVIRONMENT` 是期望环境标识。对应程序必须通过 stdin/stdout 提供逐行 JSON-RPC MCP stdio；配置值、凭据和真实环境名都不属于本公开仓。

真实微信导入依赖外部 exporter 生成页面“首次使用”列出的 canonical 目录；本仓只附带手写纯虚构 fixture，不包含 exporter 或真实导出。

## 可见变化

- 微信与碎银两张来源卡按同一顺序展示六项：好友、1 对 1 聊天、1 对 1 消息、群聊、群消息、朋友圈内容。
- 未闭合的范围显示明确状态，不把未知或受阻数据补成 `0`。
- 下半区为“真实朋友圈内容流”，永久排除群上下文、聊天摘录、未知或不可信来源。
- 支持“我的微信”与“碎银 · 官方人设”的来源筛选；来源多选为 OR，其他筛选为 AND。
- 每页最多 50 条、搜索 200ms latest-wins，只刷新内容区；DOM 不暴露原始 source/person/signal ID。
- 分类动作使用当前 generation 绑定的 opaque token，旧页面或旧 generation 不能写入。

## 验证

```powershell
node --check prototype/local-vault.js
node --check scripts/suiyin-mcp-client.mjs
node --check scripts/start-local-preview.mjs
node scripts/test-local-vault.mjs
node scripts/test-suiyin-mcp.mjs
node scripts/test-pilot.mjs
node scripts/lint-prototype.mjs
```

上述命令不读取真实 MCP 或浏览器私人数据。完整结果见 [`VALIDATION.md`](VALIDATION.md)，逐文件哈希见 [`implementation-manifest.json`](implementation-manifest.json)。

本快照在 Node.js `v24.14.0` 验证；测试必须从 `hosted/relationship-today` 目录执行，且只依赖 Node 内置模块。

## 需求真源

- [`SPEC-RELATION-028@1.1.0`](../../docs/sdd/SPEC-RELATION-028/1.1.0/README.md)
- [`SPEC-RELATION-030@1.1.0`](../../docs/sdd/SPEC-RELATION-030/1.1.0/README.md)
- [`SPEC-RELATION-031@1.1.0`](../../docs/sdd/SPEC-RELATION-031/1.1.0/README.md)

`v2026082002-existing-mcp-read-correction` 下的 `1.1.0` SDD 是签约时的不可变快照，其中“尚未实现”的文字准确记录了当时状态。本次 `v2026082003-unified-source-moments-implementation` 只新增后续本地实现与验证证据，不改写 SDD 版本、需求规则或历史标签，也不恢复已撤回的碎银 MCP 能力 Issue。

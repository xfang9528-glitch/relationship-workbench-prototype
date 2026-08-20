---
plan_for: SPEC-RELATION-030
spec_version: 1.0.0
status: approved
artifact_class: hosted-stateful
exception_status: approved
exception_approved_by: 房总
exception_approved_at: 2026-08-13
operational_profile: "E:/AI 项目/关系维护助手/specs/030-unified-source-six-metric-receipts/operational-profile.md"
last_updated: 2026-08-20
---

# Prototype Plan — 微信与碎银统一六项来源覆盖回执

> 本 Plan 已随 `SPEC-RELATION-030@1.0.0` 由房总于 2026-08-20 批准。产品/测试实现仍须先签发独立版本化 task contract；生产依赖只走正式 Handoff/Issue。

## 1. Constitution Check

| 原则 | 结论 | 证据 / 例外理由 |
|---|---|---|
| 用户结果优先 | PASS | 两卡同六项直接解决统计不可比 |
| 事实与推断分离 | PASS | 完整好友、partial、unsupported、blocked 严格分态 |
| 逻辑先于界面 | PASS | source-contract 先冻结六项与 receipt state |
| 状态完整 | PASS | exact/partial/legacy/unsupported/blocked + loading/error/stale |
| 平台与租户边界 | PASS | 仅房总本机 / bzds |
| 真实能力承诺 | PASS | T028 complete 与碎银朋友圈不冒充可用 |
| 运行类型与生产隔离 | PASS | 复用已批准本机 hosted-stateful 例外；0生产修改 |
| 精确依赖与证据闭环 | PASS | SPEC-RELATION-002/010/017/022/028/029 精确锁定 |

## 2. Artifact Boundary

- **运行类型**：`hosted-stateful`。
- **为什么**：新 coverage receipt 随现有 IndexedDB AES-GCM business graph、generation 与 backup/restore 持久，不是纯静态展示。
- **有状态信号**：浏览器目录选择、loopback 只读 MCP staging、AES-GCM graph、current-generation CAS、backup/restore。
- **例外**：继承房总于 2026-08-13 批准的“仅房总本机运行、无共享/无外发/无云同步”例外；本规格不扩展网络权限。
- **Operational Profile**：`specs/030-unified-source-six-metric-receipts/operational-profile.md`。
- **生产边界**：不进入 wechat-export-toolkit、suiyin_mcp、suiyin-go、Flutter、React 或任何生产仓；缺能力只显示 blocked/unsupported。

## 3. 复用地图

| 类型 | 复用对象 | 路径 / 组件 | 复用理由 | 需要调整 |
|---|---|---|---|---|
| HTML | 数据来源两卡 | `prototype/index.html` source-card/source-stats | 已是房总当前审阅入口 | 固定六项同序与状态文案 |
| Domain | 微信 parser/receipt | `prototype/local-vault.js` | 已有 conversationKind/isGroup/moments、T029 receipt | 新增严格加法 coverage receipt/projector |
| Domain | 碎银 staging | `scripts/suiyin-mcp-client.mjs` | 已有 friend/group、excerpt/group_context、perPersona | 拆 direct/group conversation/message partial counts |
| State | graph/backup/diff/CAS | `prototype/local-vault.js` | 继承 T002/T022/T029 | allowlist + strict validate + legacy 0 migration |
| Test | focused fictional fixtures | `scripts/test-local-vault.mjs`, `scripts/test-suiyin-mcp.mjs`, `scripts/test-pilot.mjs` | 不读真实业务数据 | 新增六项、五态、privacy canary |

## 4. 文件与路由

| 文件 | 路由 / 页面 | 动作 | 对应规则 |
|---|---|---|---|
| `prototype/local-vault.js` | source receipt/domain | 修改 | R002–R005、R008/R009 |
| `scripts/suiyin-mcp-client.mjs` | local loopback staging | 修改 | R006–R009 |
| `prototype/index.html` | `#/sources` | 修改 | R001–R004、R006/R007、R009 |
| `scripts/test-local-vault.mjs` | focused domain | 修改 | R002–R005、R008/R009 |
| `scripts/test-suiyin-mcp.mjs` | fictional MCP | 修改 | R006–R009 |
| `scripts/test-pilot.mjs` | UI contract | 修改 | R001–R010 |
| `scripts/lint-prototype.mjs` | static guard | 必要时修改 | R009/R010 |

## 5. 信息结构

- 页面骨架：保留“数据来源”页；微信与碎银卡各含状态头、批次/范围说明、同序六项指标、补充说明与既有动作。
- 主操作：沿既有“选择微信导出 / 确认导入”和“读取碎银 / 确认 partial”流程；本规格不新增自动读取。
- 次操作：查看 per-persona 明细、移除来源。
- 状态反馈区域：每项 metric value + state 文案；卡片级 scope summary；好友观察数和排除项放补充区。
- 返回 / 关闭：沿现有路由；未确认 preview 丢弃，active graph 不变。

## 6. 交互实现

| 触发 | 默认态 | 进行中 | 成功 | 失败 | 取消 / 重试 | 规则 |
|---|---|---|---|---|---|---|
| 打开 sources | 从 graph 只读投影 | vault loading | 六项或逐项 legacy | vault typed error | 重开/解锁 | R001/R002/R005 |
| 选择微信导出 | 既有来源可见 | parser/preview | 五项 exact/blocked + 好友观察数 | prior graph 保留 | 取消 0 写 / 重选 | R003–R005 |
| 读取碎银 | prior receipt 可见 | MCP loading | partial 六项；future complete 按 T028 | typed reason + prior 保留 | 0 写 / 重试 | R006–R009 |
| 备份恢复 | current receipt | strict validate | round-trip 保留 | 整份拒绝 | 选择其他备份 | R005/R009 |

## 7. Mock 方案

| 数据集 | 表达的场景 | 关键字段 | 敏感信息处理 |
|---|---|---|---|
| wechat-six-metric | personal/group/moments 拆分 | isGroup/conversationKind/moments/excluded | code-authored fictional |
| wechat-no-roster | 有单聊对象但无 roster | observedDirectParticipantCount + blocked friend | code-authored fictional |
| legacy-source | 缺 coverageReceipt | legacy-unknown/null | 无业务 payload |
| suiyin-partial | 3 persona current allocation 片段 | perPersona + aggregate partial | 官方名使用虚构安全 label |
| suiyin-complete-gate | complete 成功/门禁失败 | scopeComplete/applied filter/pagination fixture | 不调用真实 MCP |
| privacy-canary | raw ID/正文/路径 canary | DOM/log/backup scan | 只用明显虚构 canary |

## 8. 验证计划

| 验收 ID | 操作路径 | 预期 | 视觉检查 |
|---|---|---|---|
| AC-R001/002 | 打开两卡所有五态 fixture | 同序六项、value/state 互斥 | 桌面/窄屏换行 |
| AC-R003/004 | 微信 preview/reopen | 好友 blocked；观察数另名；五项正确 | 文案不冒充完整 |
| AC-R005 | commit/reimport/backup/legacy | additive、CAS、round-trip、0 migration | legacy 清晰 |
| AC-R006/007 | partial/complete gate | partial 不升级；complete 只认 T028 | scope badge 清晰 |
| AC-R008 | perPersona/aggregate | stable 去重与对账 | 明细可读 |
| AC-R009 | privacy canary | 0 raw ID/姓名/正文/路径/handle | DOM 无泄漏 |
| AC-R010 | report gate | 最多 preview-validated | blocked/unsupported 保留 |

## 9. 风险与回退

- 可能影响的既有行为：source schema allowlist、backup strict validation、T029 diff 与 T028 staging reference validation。
- 兼容策略：只新增 `coverageReceipt`；旧总字段不删不改，legacy 读取不写。
- 原型回退方式：UI/projector 可退回旧字段显示；新 receipt 仍作为允许但不消费的加法字段保留，不做破坏性 migration。
- 未联通能力提示：微信完整好友 roster blocked；T028 persona-complete upstream-blocked；碎银朋友圈 upstream-unsupported。

## 10. 预览计划

- 本地服务：复用 `127.0.0.1:8765`。
- Chrome 目标 URL：`http://127.0.0.1:8765/prototype/index.html#/sources`。
- 首屏定位：微信/碎银并排来源卡及六项指标。
- 需要展示的状态：微信 exact+blocked、legacy；碎银 partial+unsupported、complete-blocked；窄屏折行。

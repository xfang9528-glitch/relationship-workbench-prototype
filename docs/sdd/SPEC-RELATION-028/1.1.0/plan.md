---
plan_for: SPEC-RELATION-028
spec_version: 1.1.0
status: approved
artifact_class: hosted-stateful
exception_status: approved
exception_approved_by: 房总
exception_approved_at: 2026-08-13
operational_profile: "E:/AI 项目/关系维护助手/specs/028-suiyin-three-persona-complete-readable-scope/operational-profile.md"
last_updated: 2026-08-20
---

# Prototype Plan — 碎银三账号完整可读范围与真实人物归属

## 1. Constitution Check

| 原则 | 结论 | 证据 / 例外理由 |
|---|---|---|
| 用户结果优先 | PASS | 解决三账号范围不完整、人物/账号占位与统计误解 |
| 事实与推断分离 | PASS | official roster/tuple、scope receipt、typed missing；0猜号 |
| 逻辑先于界面 | PASS | source contract 先冻结 cohort、tuple、entity、completeness |
| 状态完整 | PASS | roster/cohort/complete/incomplete/adapter-blocked/retry/commit |
| 平台与租户边界 | PASS | 房总PC、bzds、loopback-only |
| 真实能力承诺 | PASS | 复用现有 MCP 读取能力；adapter/回执不完整即 blocked，不伪造三账号全量 |
| 运行类型与生产隔离 | PASS | hosted-stateful approved；只改本地 adapter，不修改生产 MCP |
| 精确依赖与证据闭环 | PASS | 002/010/015/017/021/022/023/026/027 exact |

## 2. Artifact Boundary

- **运行类型**：`hosted-stateful`。
- **为什么**：使用本机 loopback MCP、真实来源 preview、IndexedDB AES-GCM generation。
- **有状态信号**：loopback API、本机数据库、加密持久化。
- **例外**：房总 2026-08-13 批准现有本机单用户例外；OP-028 不扩大到生产仓。
- **Operational Profile**：`operational-profile.md`。
- **生产边界**：`E:/dev/suiyin_mcp`、Flutter、Go 均不进入；房总已确认现有 MCP 能力足够，缺口只在本地 adapter/schema mapping。

## 3. 复用地图

| 类型 | 复用对象 | 路径 / 组件 | 复用理由 | 需要调整 |
|---|---|---|---|---|
| Importer | T010/T021/T024 collector | `scripts/suiyin-mcp-client.mjs` | 已有只读、stable IDs、registry/link | roster gate、nested tuple、scope receipt |
| Domain | graph staging/merge/projection | `prototype/local-vault.js` | 已有 strict staging/AES-GCM/backup/T027 | receipt schema、display-name exclusion、counts |
| UI | Sources/People | `prototype/index.html` | 已有显式读取、preview、location filter | 分persona与分单位、blocked reason |
| Tests | focused fictional | `scripts/test-suiyin-mcp.mjs`, `test-local-vault.mjs`, `test-pilot.mjs` | 0真实数据 | nested-only、scope complete/incomplete |

## 4. 文件与路由

| 文件 | 路由 / 页面 | 动作 | 对应规则 |
|---|---|---|---|
| `scripts/suiyin-mcp-client.mjs` | importer | 修改 | R001–R004/R006–R009 |
| `prototype/local-vault.js` | graph/receipt/projection | 修改 | R002–R008 |
| `prototype/index.html` | `#/sources`, `#/people` | 修改 | R004–R010 |
| `scripts/test-suiyin-mcp.mjs` | fictional source oracle | 修改 | R001–R004/R006/R007/R009 |
| `scripts/test-local-vault.mjs` | fictional domain oracle | 修改 | R002–R008 |
| `scripts/test-pilot.mjs` | fictional UI oracle | 修改 | R004/R006/R007/R009/R010 |
| `scripts/lint-prototype.mjs` | strict additive | 可选修改 | R010 |
| `reviews/T028-preview-validation.md` | report | 新增 | R010 |

任何 production file 不进入允许修改清单。若本地 adapter 尚不能证明 exact scope，产品变更只可交付明确 `current-allocation-partial` 的 nested/name/统计修正与0-deletion upsert；不得宣称 full cohort，也不得称为 MCP 能力缺失。

## 5. 信息结构

- Sources：三账号 roster → 每账号进度/好友/群/消息/不可读/失败 → aggregate → 完整性状态与动作。
- People：人物真实名字；所在微信继续 T027 official label；群不进入人物列表。
- current-allocation-partial：明确“只更新当前分配（不是三账号全量）”，使用独立CTA且0 deletion。
- adapter-blocked：完整CTA明确“本地适配尚未形成完整回执”，给本项目修正说明。

## 6. 交互实现

| 触发 | 默认态 | 进行中 | 成功 | 失败 | 取消 / 重试 | 规则 |
|---|---|---|---|---|---|---|
| 读取碎银 | 已保存 receipt | live schema discovery + roster + 3 cohorts/current snapshot | complete或partial preview | adapter/schema/permission/incomplete typed | partial 0-delete / 只重试failed | R001/R006/R009 |
| 确认 | complete/current | committing | one generation | prior graph | 可安全重试 | R008 |
| 查看统计 | safe aggregate | progressive per-persona | distinct units | unknown不填0 | 重开读receipt | R004/R007 |

## 7. Mock 方案

| 数据集 | 表达的场景 | 关键字段 | 敏感信息处理 |
|---|---|---|---|
| nested-only-3p | 三人设、nested tuple、好友/群 | fictional IDs/labels/wcId | code-authored，assert raw scrub |
| tuple-conflict | top-level+nested冲突 | conflicting official label/wcId | fictional |
| incomplete | persona page/history fail/unreadable | receipt counts/status | fictional |
| current-allocation | declared29/read26/missing3；13好友/13群/16528消息 | missing≠failure、unit copy、old same-source preservation | aggregate fictional |
| partial-preserve | 范围外旧同源事实 | person/mapping/context/excerpt/signal/message + stable-ID conflict | fictional deep-equal/collision |
| adapter-schema-mismatch | live MCP 有读取能力、本地固定 allowlist/映射不匹配 | local blocked + current partial CTA | 无真实外部调用 |

## 8. 验证计划

| 验收 ID | 操作路径 | 预期 | 视觉检查 |
|---|---|---|---|
| AC-R001-01 | roster/cohort fixture | exact3/full or typed blocked | 三账号状态 |
| AC-R002-01 | tuple fixtures | dedupe/conflict/0raw | official labels |
| AC-R003-01 | friend/group/exact name precedence | no placeholder/persona-as-person-name | People name/location |
| AC-R004/007 | stats fixtures | allocation declared/read/missing/customer与friend/group/message/failure分列 | Sources cards |
| AC-R006 | stable partial + failed retry | partial 0-delete；真实failure prior equal | reason+retry |
| AC-R008 | commit/reopen | one generation/0 MCP reopen | saved receipt |
| AC-R009/010 | adapter/schema mapping/report | local typed blocked only；不归因为 MCP capability | truthful copy |

## 9. 风险与回退

- 可能影响的既有行为：T010 current-allocation importer、T021 registry、T024 links、T026 analysis、T027 filters。
- 兼容策略：old source receipt只读；同 source complete commit才替换；partial不删除。
- 原型回退方式：恢复 T027 final tuple；不删库、不重读真实源。
- 未联通提示：schema mapping、权限、分页或完整性未被回执证明时 local typed blocked；current allocation partial 单列可用、0 deletion；`upstream-dependency.md` 记录旧能力误判已撤回。

## 10. 预览计划

- 本地服务：复用 `127.0.0.1:8765`。
- Chrome 目标 URL：`?refresh=T028-preview#/sources`，随后 `#/people`。
- 首屏定位：碎银来源卡与三账号 receipt。
- 需要展示的状态：nested fixed、distinct counts、incomplete、adapter blocked、People official location。

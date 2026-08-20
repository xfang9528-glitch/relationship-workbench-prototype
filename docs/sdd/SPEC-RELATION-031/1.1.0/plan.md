---
plan_for: SPEC-RELATION-031
spec_version: 1.1.0
status: approved
artifact_class: hosted-stateful
exception_status: approved
exception_approved_by: 房总
exception_approved_at: 2026-08-13
operational_profile: "E:/AI 项目/关系维护助手/specs/031-unified-real-moments-feed/operational-profile.md"
last_updated: 2026-08-20
---

# Prototype Plan — 统一真实朋友圈内容流与来源筛选

> 本 Plan 已随 `SPEC-RELATION-031@1.1.0` 由房总于 2026-08-20 纠正批准。它只描述可逆原型实现路径；签发独立版本化 task contract 前，不授权修改产品/测试；不再需要生产 MCP Handoff/Issue。

## 1. Constitution Check

| 原则 | 结论 | 证据 / 例外理由 |
|---|---|---|
| 用户结果优先 | PASS | 目标是把误混的群聊上下文移出朋友圈，并让来源可读、可筛 |
| 事实与推断分离 | PASS | moment来源取自记录自身可信provenance；不按昵称、正文或序号猜人设 |
| 逻辑先于界面 | PASS | 先定义moment eligibility、source contract、generation/token边界，再定义卡片 |
| 状态完整 | PASS | checking、empty、filtered-empty、stale、saving/error、adapter-blocked均入合同 |
| 平台与租户边界 | PASS | 仅房总本机browser profile + loopback origin |
| 真实能力承诺 | PASS | 微信已有 moment 可展示；碎银复用现有 MCP，本地映射/回执未闭合时具体阻断 |
| 运行类型与生产隔离 | PASS | hosted-stateful沿用已批准本机例外；0生产仓、0真实MCP测试 |
| 精确依赖与证据闭环 | PASS | 源SPEC锁定002/008/010/021/022/023/027/028/029 exact版本 |

## 2. Artifact Boundary

- **运行类型**：`hosted-stateful`。
- **为什么静态HTML不足**：feed读取本机IndexedDB中的AES-GCM committed graph；分类动作沿用generation CAS；恢复、备份和source lifecycle均属于现有本机状态边界。
- **例外依据**：房总已于2026-08-13批准“本机、单用户、loopback、无云同步”的hosted-stateful总边界，并于2026-08-20批准本T031增量Profile；产品/测试仍须 task contract 才可实施。
- **新增状态**：只允许session-only、generation-scoped的moment projection cache、筛选状态、200ms timer和opaque action-token映射；不得建立新的persistent cache。
- **网络与生产边界**：只复用既有 loopback MCP bridge，不新增远端 API，不修改`E:/dev`生产仓。碎银 moments 的本地 adapter 接线必须由新 task contract 授权，并以 fictional live-schema fixtures 验证。
- **遗留兼容**：缺`kind`的legacy record只在active trusted WeChat source + existing moment shape下做0write projection，不迁移graph。

## 3. 复用地图

| 类型 | 复用对象 | 路径 / 组件 | 复用理由 | 批准后需要调整 |
|---|---|---|---|---|
| Domain | T010 moment shape/query | `prototype/local-vault.js` | 已有真实微信moment与50/页语义 | 收窄为trusted moment eligibility，排除group_context |
| Domain | T022 generation/CAS/reopen | `prototype/local-vault.js` | 已有stale与0重导边界 | token/cache绑定active generation |
| Performance | T023 bounded projection | vault/index控制器 | 已有generation cache、200ms latest-wins模式 | 建moment专用只读projection与feed sink |
| Provenance | T021/T027 safe labels | source registry/projection | 已有“我的微信 / 碎银 · official”真源 | 每条moment按自身provenance投影 |
| Adapter | T028@1.1.0 existing-MCP receipt | `scripts/suiyin-mcp-client.mjs` | 已有 loopback read bridge 与 partial 兼容路径 | live schema discovery、moments 映射、persona provenance 与完整性回执 |
| Receipt | T029 source times | source receipt projection | 已定义批次/选择/导入/导出时间 | 明确它们都不是moment发布时间 |
| UI | existing Sources moment cards | `prototype/index.html#/sources` | 已有卡片、分页、身份/分类动作 | 去编号、加来源多选、只局部刷新feed |

## 4. 文件与路由

下列是**未来批准并签发task contract后**的候选写集合；本次五件套创建不修改这些文件。

| 文件 | 路由 / 页面 | 候选动作 | 对应规则 |
|---|---|---|---|
| `prototype/local-vault.js` | moment query/projection | 修改 | R001–R003/R006–R010 |
| `prototype/index.html` | `#/sources` feed sink | 修改 | R003–R011 |
| `scripts/suiyin-mcp-client.mjs` | existing-MCP local adapter | 修改 | R003/R009/R010 |
| `scripts/test-local-vault.mjs` | fictional domain oracle | 修改 | R001–R003/R006–R010 |
| `scripts/test-suiyin-mcp.mjs` | fictional live-schema/response oracle | 修改 | R003/R009/R010 |
| `scripts/test-pilot.mjs` | fictional UI/controller oracle | 修改 | R003–R011 |
| `scripts/lint-prototype.mjs` | strict-additive静态门禁 | 仅必要时修改 | R006/R011 |
| `reviews/T031-preview-validation.md` | isolated preview报告 | 新增 | R001–R011 |

任意 production MCP/Flutter/React/Go 文件不在候选写集合。现有 MCP 只作为读取来源，不能在 T031 中偷渡生产修改。

## 5. 信息结构

1. 数据来源页既有本机加密库状态、source receipts与来源卡保持原区域、原渲染边界。
2. “真实朋友圈内容流”是独立feed shell，包含：
   - capability/真实总数摘要；
   - 来源多选：`我的微信`与当前可用的`碎银 · 官方人设`；
   - 文本、身份、分类条件；
   - 最多50张内容卡与分页；
   - 微信 ready 与碎银 exact/partial/adapter-blocked 可按真实回执同时呈现。
3. 每卡只呈现发布者、格式化时间、正文/“无文字”、媒体文字描述、source label、身份/分类和允许的分类动作。
4. feed节点不能显示sequence number、raw epoch、source/person/signal ID、raw alias、path/handle。

## 6. 交互实现

| 触发 | 默认态 | 进行中 | 成功 | 失败 | 取消 / 重试 | 规则 |
|---|---|---|---|---|---|---|
| 打开Sources | prior page shell | vault checking/projection build | 微信moment feed或真实空态 | vault unavailable | 重试恢复，不重导 | R001/R002/R008 |
| 来源多选 | empty=全部eligible | feed局部计算 | OR后page=1 | conflict记录fail closed排除 | 清空选择 | R003/R004 |
| 文本输入 | current cards保留 | 200ms debouncing | latest query与其他条件AND | stale callback丢弃 | 继续输入 | R004/R007/R008 |
| 翻页 | current page | feed sink局部刷新 | ≤50 live cards | 越界回最后有效页 | 上/下一页 | R007 |
| 分类 | current opaque token | 单卡saving | one generation commit | stale/error 0写 | current generation重试 | R006/R008 |
| generation变化 | current filters | cache/token重建 | 安全筛选保留、内容重投影 | invalid source排除 | 重新恢复vault | R008 |
| 显式读取碎银朋友圈 | prior feed可见 | existing-MCP local mapping | exact/partial moments进入可信staging/feed | adapter/schema/permission/pagination typed reason | 0写/重试 | R009/R010 |

### 6.1 组合查询顺序

1. 读取current committed graph与active generation。
2. 建立/复用同graph reference + generation的eligible moment基础projection。
3. 根据每条record自身trusted provenance产生safe source token/label。
4. 来源多选同组OR；文本、身份、分类与来源结果按AND。
5. 稳定排序后切页；只把当前页最多50张卡交给feed sink。
6. 任一generation失配时丢弃timer、token与projection，0 stale write。

## 7. Fictional Fixture 方案

| 数据集 | 表达场景 | 关键字段 | 隐私处理 |
|---|---|---|---|
| mixed-kind | 微信moment、kindless trusted WeChat、group_context、excerpt、unknown | source/kind/shape | code-authored虚构值 |
| source-label | 我的微信、3个虚构official persona、missing/conflict provenance | exact per-record attribution | 标签与ID均虚构 |
| content-shape | 正文/媒体描述/时间各种空值与长文本 | publisher/time/body/media | 不对应真人 |
| filter-matrix | 多来源+文本+身份+分类 | OR within source, AND across groups | 虚构关键词 |
| stale-actions | G1 token/timer与G2 graph | generation mismatch | canary opaque token |
| perf-10k/20k | moments与同量非moment signals | cache count/live DOM/render sink | 纯生成fixture |
| regression | T028 partial/complete receipt、T029 receipt/legacy | approved exact shapes | 不读真实数据 |

## 8. 验证计划

| 验收 ID | 操作路径 | 预期 | 证据 |
|---|---|---|---|
| AC-R001-01/AC-R002-01 | mixed-kind + reopen | 0 group_context；trusted kindless WeChat可见且0写 | local-vault oracle |
| AC-R003-01/AC-R004-01 | source/filter matrix | exact labels；source OR + text/identity/classification AND | domain + DOM oracle |
| AC-R005-01/AC-R006-01 | content/privacy matrix | 完整可读字段；0编号/raw epoch/ID/alias | public DOM canary |
| AC-R007-01/AC-R008-01 | 10k/20k + debounce/generation | ≤50卡、single projection/generation、latest-wins、partial render、stale0写 | deterministic counters |
| AC-R009-01/AC-R010-01 | existing-MCP adapter gate | fictional schema/output mapping、exact provenance/page/receipt、typed local failure、0 mock/group fallback | adapter oracle |
| AC-R011-01 | T028/T029 frozen fixtures | 计数、回执、CAS、legacy不变 | focused regression |

### 8.1 批准后建议门禁

- 环境：`node --version`
- Project workflow：`node scripts/project-workflow.mjs validate`
- SPEC：`node "E:/AI 项目/prototype-sdd/scripts/validate-spec.mjs" "specs/031-unified-real-moments-feed/spec.md"`
- Plan：`node "E:/AI 项目/prototype-sdd/scripts/validate-plan-boundary.mjs" "specs/031-unified-real-moments-feed/plan.md"`
- Functional：`node scripts/test-local-vault.mjs`、`node scripts/test-pilot.mjs`
- Existing gates：`node scripts/test-prototype.mjs`、`node scripts/lint-prototype.mjs`
- Syntax/inline scripts与精确SHA/input tuple由未来task contract冻结。

本次批准与工程交接阶段只运行治理 validators；不得把未执行的产品门禁写成已通过。

## 9. 风险与回退

- **误把group_context算moment**：资格函数必须显式kind/source boundary；混合fixture强制0渲染。
- **legacy shape过宽**：仅trusted active WeChat source兼容；Suiyin/unknown同shape仍排除。
- **用人物全局来源误标一条内容**：source label只读取record自身provenance；缺失/冲突fail closed。
- **性能回退**：用deterministic counters验证每generation一次基础projection、feed-only render和≤50 live cards。
- **stale分类写错generation**：opaque token绑定generation；domain CAS仍是最终守卫。
- **现有 MCP schema 与本合同映射不一致**：typed local fail closed，重审 source contract/adapter，不创建新能力 Issue 或兼容猜测。
- **原型回退**：恢复未来合同冻结的pre-T031 tuple；不清库、不迁移、不要求重导。

## 10. 预览计划

- **当前状态**：未获实施授权，不启动预览。
- **批准后的本地入口**：`http://127.0.0.1:8765/prototype/index.html?refresh=T031-preview#/sources`。
- **隔离要求**：全新empty browser profile、loopback origin、只用code-authored fictional fixtures；0真实导出、IDB、MCP或private DOM。
- **重点画面**：微信 populated + 碎银 exact/partial/adapter-blocked；多来源OR+文本AND；filtered-empty；长正文/媒体描述；invalid time；50卡分页。
- **完成上限**：预览报告最多写`PREVIEW-VALIDATED`；没有E4/E5与生产授权，不得宣称生产完成。

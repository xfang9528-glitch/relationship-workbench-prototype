---
tasks_for: SPEC-RELATION-031
spec_version: 1.0.0
status: approved-ready-for-contract
last_updated: 2026-08-20
---

# Tasks — SPEC-RELATION-031

> Package status：`approved`。Execution status：`blocked-contract`。  
> 本清单不等于task contract；房总已批准SPEC/Plan/Profile/Source Contract，但签发独立版本化合同前，任何产品、测试或预览写入仍未获授权。生产写入始终只能走正式 Issue/worktree/PR。

## State Truth

| 项 | 当前事实 |
|---|---|
| SPEC | `SPEC-RELATION-031@1.0.0`，approved |
| Plan | approved |
| Operational Profile delta | approved；继承2026-08-13本机hosted-stateful总例外 |
| Source Contract | approved；Suiyin moments upstream capability unavailable |
| Task Contract | not-issued |
| E3 implementation | blocked |
| E4/E5 / production | not-authorized |

## T031-00 — Approval and Serial Gate

- [x] 房总审核并明确批准`SPEC-RELATION-031@1.0.0`、Plan、Operational Profile增量与Source Contract。
- [ ] 重新读取T028/T029/T030最终治理状态与所有将触碰文件，机械冻结input SHA tuple。
- [ ] 签发单独`contract-T031.md`，精确列出allowed files、forbidden actions、commands与outputs。
- [ ] 确认没有并行task claim `prototype/index.html`、`prototype/local-vault.js`及focused tests。

**Status**：ready-for-contract  
**Rules**：R009–R011

## T031-01 — Legal Fictional RED: Eligibility and Legacy

- [ ] 写mixed-kind RED：trusted WeChat moment可见；Suiyin `group_context`、excerpt、unknown/untrusted均0卡、0计数（AC-R001-01）。
- [ ] 写legacy无`kind` RED：active trusted WeChat + existing moment shape可见；同shape来自Suiyin/unknown仍排除；open/search/reopen均0写（AC-R002-01）。
- [ ] RED只用code-authored fictional graph，不打开真实导出、IDB、MCP、private DOM或网络。

**Status**：blocked  
**Rules**：R001/R002

## T031-02 — Domain GREEN: Moment Projection and Provenance

- [ ] 收窄moment eligibility；不删除或迁移既有`group_context`，仅从feed projection排除。
- [ ] 以record自身trusted source provenance生成safe source label与generation-bound opaque source token。
- [ ] 规范化moment发布时间并产生格式化label；invalid time仅显示“时间未记录”，不透出raw epoch。
- [ ] 冲突/missing source attribution fail closed；不按人物全局badge、昵称、正文、顺序或ID猜persona。

**Status**：blocked  
**Rules**：R001–R003/R006/R008

## T031-03 — Legal Fictional RED: Filters, Cards and Privacy

- [ ] 来源多选OR，与文本/身份/分类AND；无来源选择=全部eligible；变化page=1（AC-R004-01）。
- [ ] 卡片包含发布者、格式化时间、正文/无文字、媒体文字描述、来源、身份/分类；0sequence number（AC-R005-01）。
- [ ] public DOM/action/log/error canary证明0 raw epoch、source/person/signal ID、raw alias/path/handle；stale opaque token 0写（AC-R006-01）。

**Status**：blocked  
**Rules**：R003–R006

## T031-04 — UI/Controller GREEN: Feed-only Interaction

- [ ] 在`#/sources`建立独立feed sink；来源、搜索、翻页只更新feed，不重绘source cards、receipts、backup或其他Sources区域。
- [ ] 来源选项只显示`我的微信`与exact`碎银 · 官方人设`；缺/冲突来源不生成猜测选项。
- [ ] 保留现有身份/分类动作，但只用current-generation opaque token；single action与CAS失败可恢复。
- [ ] 微信ready与碎银upstream-blocked可以同时呈现，不用“0条/已读取”冒充上游完成。

**Status**：blocked  
**Rules**：R003–R006/R008–R010

## T031-05 — Performance GREEN

- [ ] 建generation-scoped、session-only基础projection/sort cache；同graph reference + active generation最多计算一次。
- [ ] 200ms latest-wins文本搜索；旧timer/generation结果丢弃。
- [ ] 每页与live DOM cards均≤50；筛选/翻页feed-only render。
- [ ] 在10k与20k纯虚构moments并混合非moment signals下记录deterministic compute/render/write counters；所有只读操作graph/cache write=0。

**Status**：blocked  
**Rules**：R007/R008

## T031-06 — Upstream Blocker and Future Re-review

- [ ] 固定current state为`UPSTREAM_SUIYIN_MOMENTS_UNAVAILABLE`，并证明0 MCP moments调用、0 mock/空成功、0 group fallback、0 tenant scan。
- [ ] 仅当production MCP真实提供persona-filtered read-only moments、stable pagination/snapshot与exact applied-persona receipt后，另开生产变更与T031 source-contract重审。
- [ ] 上游到位后必须签发新的实现合同；当前任务不得新增adapter或stub。

**Status**：blocked-upstream  
**Rules**：R009/R010

## T031-07 — T028/T029 and Vault Regression

- [ ] 保持T028 current-allocation partial、29/26/3、13 friend/13 group/16528 messages、persona-complete blocker与official registry语义。
- [ ] 保持T029 diff/domain guard/CAS、batchName/selectedAt/importedAt/exportedAt、legacy fallback与0 picker/reimport。
- [ ] 保持AES-GCM backup/reopen、source removal/purge、分类generation与0 open-time migration。
- [ ] 不改T030；source cards六项统计不属于T031。

**Status**：blocked  
**Rules**：R011

## T031-08 — Gates and Isolated Preview

- [ ] 运行future task contract冻结的spec/plan/project、focused、lint、syntax、inline与SHA gates。
- [ ] 只在isolated empty-profile + fictional fixtures中预览populated/empty/filtered/stale/blocked/overflow/focus状态。
- [ ] 生成`reviews/T031-preview-validation.md`，完成状态上限`PREVIEW-VALIDATED`。
- [ ] 0真实导出、0真实IDB、0真实MCP、0private DOM、0E4/E5、0生产仓、0commit/push/tag/deploy。

**Status**：blocked  
**Rules**：R001–R011

## Completion Boundary

- 五件套通过治理validator不等于功能完成，也不等于允许实施。
- 只有房总批准、版本化task contract已签发、legal RED → minimal GREEN → frozen gates全部通过，T031才可进入implemented候选。
- Suiyin朋友圈能力若仍缺失，允许的诚实结果仍是upstream-blocked；禁止为了“完成”而造数据或复用群聊。

# Tasks — 微信与碎银统一六项来源覆盖回执

> Spec: `SPEC-RELATION-030@1.0.0`  
> Plan: `plan.md`  
> Status: approved-ready-for-contract — 未签发版本化 task contract 前不得执行产品/测试修改

## Phase 0 — Approval and serial gate

- [x] T030-00 房总明确批准 SPEC-RELATION-030@1.0.0；更新 approved 元数据并重跑 validators（R010）
- [ ] T030-01 冻结 T028/T029 当前 final inputs 与工作树；若依赖版本/实现漂移则回到 review（R005/R007）

## Phase 1 — Contract RED

- [ ] T030-02 为六项固定顺序、metric state/value 互斥、strict coverage receipt shape 建立纯函数 RED（R001/R002，AC-R001/002）
- [ ] T030-03 建立微信 no-roster、五项 canonical 拆分、moments absent、legacy/backup/diff RED（R003–R005，AC-R003–005）
- [ ] T030-04 建立碎银 partial、perPersona/aggregate、complete gate 与朋友圈 unsupported RED（R006–R008，AC-R006–008）
- [ ] T030-05 建立 DOM/log/backup privacy canary 与 report gate RED（R009/R010，AC-R009/010）

## Phase 2 — Domain GREEN

- [ ] T030-06 在微信 preview 计算 direct/group conversation/message、moments 与 observed direct participants；不生成完整 friendCount（R003/R004）
- [ ] T030-07 新增严格加法 `coverageReceiptVersion=1` schema/projector/validator，接入 one-generation commit、T029 diff/CAS、backup/restore/legacy 0 migration（R002/R005）
- [ ] T030-08 在碎银 staging 拆 direct/group conversation/message partial counts，并保持 T028 complete gate 与 stable dedupe（R006–R008）
- [ ] T030-09 收紧 public receipt/typed error/allowlist，证明 0 raw ID、姓名、正文、路径和 handle（R009）

## Phase 3 — UI GREEN

- [ ] T030-10 将微信/碎银来源卡改为固定同序六项，不以 0 表示 unknown/unsupported/blocked（R001/R002）
- [ ] T030-11 微信好友 blocked 与“本批次单聊中出现 N 人”补充说明分离；moments 未提供显示 blocked（R003/R004）
- [ ] T030-12 碎银 partial/complete/unsupported 文案和 per-persona 明细与 aggregate 对账（R006–R008）
- [ ] T030-13 完成 loading/legacy/error/stale/窄屏/overflow/focus 状态（R001/R002/R005）

## Phase 4 — Regression and preview

- [ ] T030-14 跑 focused local-vault、suiyin-mcp、pilot 与 lint gates；不得读取真实导出/MCP/IDB（R001–R010）
- [ ] T030-15 验证 T025/T026/T027 location、T028 partial、T029 reimport 与 source remove/backup/purge 无回归（R005–R009）
- [ ] T030-16 在 Google Chrome 打开 `#/sources`，留六项 exact/blocked/partial/unsupported/legacy 和窄屏证据（AC-R001–010）
- [ ] T030-17 产出 preview report；无真实数据/E4/E5 时最多 `PREVIEW-VALIDATED`，T028 complete 保持 `UPSTREAM-BLOCKED`（R010）

## 完成条件

- 所有 MUST 规则和 AC 均有实现/证据映射。
- 两张卡同序六项；好友观察数不冒充完整好友；partial/unsupported/blocked 不补 0。
- coverage receipt additive、AES-GCM/backup round-trip、legacy 0 migration、privacy canary 通过。
- 不修改生产仓、不在本地实现任务中创建 Issue、不真实读取私人数据；获授权的上游工程 Issue 由独立 Handoff 流程创建。
- Plan 已通过 `validate-plan-boundary.mjs`；未执行 commit/push/tag，除非房总明确说“完整推送”。

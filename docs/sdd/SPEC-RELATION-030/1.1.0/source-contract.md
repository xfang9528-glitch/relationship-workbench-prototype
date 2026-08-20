---
source_contract_id: SOURCE-CONTRACT-UNIFIED-COVERAGE-030
version: 1.1.0
status: approved
source_spec: SPEC-RELATION-030@1.1.0
prepared_by: "Codex E1"
prepared_at: 2026-08-20
approved_by: "房总"
approved_at: 2026-08-20
---

# Source Contract — 微信与碎银统一六项覆盖回执

> 本合同已由房总按推荐方案批准；它约束本机原型与正式工程 Handoff 的来源语义，但不授权本工作区修改 exporter、MCP 或其他生产仓。

## 1. Authority Order

1. 房总 2026-08-20 纠正：现有 MCP 已支持全部所需读取；只读是关系助手调用边界，不是新 MCP 能力。
2. `SPEC-RELATION-030@1.1.0`：六项名称、状态与用户语义。
3. `SPEC-RELATION-029@1.0.0`：微信 canonical、safe receipt、diff/CAS、legacy 与 backup。
4. `SPEC-RELATION-028@1.1.0`：碎银 current-allocation partial、existing-MCP persona-complete gate、官方 persona 与 stable dedupe。
5. `SPEC-RELATION-010@1.0.0`：微信 moments 与 loopback 基础边界；其“碎银朋友圈 unsupported”判断已被用户纠正取代。
6. 当前 HTML/旧 source 总字段只作兼容输入，不得反向改写上述合同。

## 2. Additive Receipt Shape

来源对象只新增一个严格 allowlisted 对象；旧字段不删、不改名、不改语义：

```text
coverageReceipt: {
  version: 1,
  scopeKind: "wechat-export-batch-v1" |
             "suiyin-current-allocation-partial-v1" |
             "suiyin-persona-complete-v1",
  scopeComplete: boolean,
  metrics: {
    friends,
    directConversations,
    directMessages,
    groupConversations,
    groupMessages,
    moments
  },
  observedDirectParticipantCount?: nonNegativeInteger,
  excludedCount?: nonNegativeInteger,
  perPersona?: [{ officialLabel, metrics }]
}

metric = {
  value: nonNegativeInteger | null,
  state: "exact" | "partial" | "legacy-unknown" |
         "upstream-unsupported" | "blocked",
  reason?: safeReasonCode
}
```

Shape invariants:

- `exact|partial` 必须 `value` 为非负整数；其他三态必须 `value=null`。
- `legacy-unknown` 只由缺失 v1 receipt 的旧 source projector 产生，不写回 graph。
- `upstream-unsupported` 是通用历史/schema 状态，仅可在确有权威证据证明某来源能力不存在时使用；房总已确认当前碎银 MCP 覆盖本项目全部读取能力，因此不得用于碎银六项。adapter/schema/permission/pagination/receipt 未闭合应使用 `blocked` 或 typed error。
- `observedDirectParticipantCount` 是辅助观察值，不属于六项 `friends.value`，不得在 UI 命名为好友/通讯录总数。
- `perPersona` 只允许 T028 官方安全 label 与六项 metric；不得保存 raw persona/client/customer/source ID。

## 3. Metric Semantics

| Metric | 微信导出 | 碎银 partial | 碎银 complete |
|---|---|---|---|
| friends | 无可信完整 roster → blocked/null；另算 observed direct participants | 已读 current allocation 中 stable friend people → partial | T028 complete cohort 中 stable friend people 去重 → exact |
| directConversations | canonical `isGroup=false` 会话数 → exact | 已读 friend customer histories 去重 → partial | 三 persona friend histories 去重 → exact |
| directMessages | validated canonical personal message rows → exact | friend excerpts stable message 去重 → partial | complete cohort friend messages stable 去重 → exact |
| groupConversations | canonical `isGroup=true` 会话数 → exact | group contexts 去重 → partial | complete cohort group contexts 去重 → exact |
| groupMessages | validated canonical group message rows → exact | group_context stable message 去重 → partial | complete cohort group messages stable 去重 → exact |
| moments | `moments/data.js` 存在且 schema/count 通过 → exact；文件未提供 → blocked/null | 旧 adapter 回执未映射 moments → blocked/null | 现有 MCP moments 读取经 exact persona/provenance/pagination/completeness 映射 → exact；受限或失败 → partial/blocked |

“exact”只表示该 `scopeKind` 内合同允许并通过校验的完整计数，不自动等于微信完整通讯录、全租户或所有历史媒体。排除项必须另计并显示范围说明。

## 4. WeChat Derivation and Commit

- 只从 T029 已允许的 canonical preview 派生，不新增目录或递归读取。
- conversation 分组以 canonical `isGroup` 为准；message 分组以通过 T029 enrichment/validation 的 `conversationKind/conversationId` 为准。kind 缺失、冲突或无法闭合时该指标 blocked，不按姓名、文件名或序号猜测。
- `observedDirectParticipantCount` 仅由本批次 valid personal rows 的 stable source person 去重；它不是可信好友 roster。
- moments 可选文件缺失表示未提供，不能据此声称 0 条。
- confirm 前 receipt 只在内存；成功 confirm 与 source/content 使用同一 committed generation。重导复用 T029 mutual diff/CAS，不为补统计绕过 conflict/stale guard。

## 5. Suiyin Partial and Complete Gates

- 旧本地 deployed adapter 的 current-allocation 路径只可形成 `suiyin-current-allocation-partial-v1`；这只说明旧映射范围，不代表 MCP 能力上限。
- direct/group conversation 以规范化 friend/group customer/context stable identity 去重；消息分别以 excerpt/group_context stable message identity 去重。
- perPersona 使用 T028 canonical official registry；同一消息或好友跨 persona 出现时 perPersona 各自保留，aggregate 按 stable identity 去重，禁止简单求和制造总数。
- 本地 adapter 必须通过 live schema discovery 复用现有 MCP，并记录 3/3 roster、exact persona scope/applied-range evidence、稳定分页/总数、0 completeness failure；全部成立才可形成 `suiyin-persona-complete-v1` 并标 exact。
- 朋友圈使用现有 MCP 读取结果；exact persona provenance、稳定分页和完整性回执成立才标 exact。未映射、权限不足、分页漂移或读取失败均 typed fail closed，不能写成 upstream-unsupported、空数组成功或 `group_context` fallback。

## 6. Legacy, Backup and Failure

- legacy source 缺 `coverageReceipt`：projector 为六项逐个返回 `legacy-unknown/null`；普通 open/reopen/refresh 0 write、0 migration。
- 新 backup 必须 strict validate version、scopeKind、metric keys、value/state 互斥、safe reason、perPersona shape；未知字段或非法值整份 fail closed。
- source remove/purge 删除同来源 coverage receipt；backup/restore round-trip；prior valid graph 在 parse/schema/CAS/MCP/backup failure 时 deep-equal 保留。
- 不从旧 `conversationCount/messageCount/momentCount` 猜拆分值；旧字段只保留历史展示 fallback。

## 7. Safe Public Projection

允许进入 DOM/log/error/report 的字段仅限：

- 六项固定 label、nonnegative aggregate value、五态、allowlisted reason copy；
- `scopeKind/scopeComplete` 的用户可理解文案；
- `observedDirectParticipantCount`、`excludedCount` 聚合；
- T028 已验证的官方人设 label。

禁止：raw source/customer/client/person/message ID、姓名、正文、媒体 URL、路径、FileSystemHandle、token、上游 response body。reason 必须是 allowlisted typed code，不能拼接业务字段。

## 8. Verification Boundary

- 仅使用 code-authored fictional canonical preview、partial/complete MCP staging、legacy/backup 和 privacy canary。
- 不读取真实 exporter、真实 MCP、真实 IndexedDB、真实聊天/朋友圈或私人 DOM；不跑 E4/E5。
- 验证必须覆盖六项顺序、五态互斥、微信 no-roster、moments absent、partial/complete gate、perPersona/aggregate dedupe、backup strictness、legacy 0 migration 与 0 sensitive public output。
- 无真实数据/E4/E5 的最终结论最多 `PREVIEW-VALIDATED`；必须说明 live integration 尚未验证，并保留具体 adapter/schema/permission/pagination/receipt 状态，不得声称 MCP capability missing。

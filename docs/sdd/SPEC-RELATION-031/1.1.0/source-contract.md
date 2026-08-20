---
source_contract_id: SOURCE-CONTRACT-UNIFIED-REAL-MOMENTS-031
version: 1.1.0
status: approved
source_spec: SPEC-RELATION-031@1.1.0
prepared_by: "Codex E1/E2"
prepared_at: 2026-08-20
approved_by: "房总"
approved_at: 2026-08-20
---

# Source Contract — 统一真实朋友圈内容流

## 1. Authority and Current Capability

本合同只定义feed可消费的数据资格，不授权生产读取或实现。

| Source lane | 当前权威输入 | 当前能力 | Feed结论 |
|---|---|---|---|
| 我的微信 | current AES-GCM graph中已保存的trusted WeChat moment | available | 可按本合同只读投影 |
| 碎银官方人设 | 现有 MCP 的读取能力，经关系助手本地 adapter 规范化 | available / local adapter pending | 合规回执后进入 feed；否则具体 local typed blocked/error |
| 碎银group context/chat history | T028 current-allocation聊天上下文 | available但非朋友圈 | 永久排除，不作fallback |

T028的29上游声明、26实际读取、3缺口、13 friend、13 group、16528 readable messages是聊天范围回执，不证明朋友圈范围，也不能推导moment数量。

## 2. Canonical Moment Eligibility

记录只有满足以下之一时才可进入feed：

1. active trusted source下具有明确canonical moment kind，且publisher、source provenance与time/body/media shape通过校验；或
2. legacy记录缺`kind`，但它来自active trusted `wechat-export-toolkit` source，并符合既有批准moment shape。

以下记录无条件排除：

- `kind="group_context"`、群聊context、chat excerpt/message；
- 无source或source已删除/inactive；
- unknown kind/untrusted source；
- 仅凭name/body/person badge看起来像朋友圈的记录；
- 同shape但来自Suiyin、unknown或conflicted source的legacy记录。

Legacy兼容只发生在session projection中；0 graph write、0 migration、0 backup rewrite、0 open-time generation。

## 3. Canonical Feed Projection

每条eligible moment进入UI前产生最小安全projection：

```text
{
  opaqueToken,
  publisherLabel,
  publishedAtLabel,
  bodyLabel,
  mediaDescriptionLabel?,
  sourceToken,
  sourceLabel,
  identityLabel,
  classificationLabel,
  classificationAllowed
}
```

- `opaqueToken/sourceToken`只在当前页面session + active generation有效，不能反推stable ID。
- `publisherLabel`来自记录自己的trusted publisher relation；缺失时记录fail closed，不以“待确认身份”创建假发布者。
- `bodyLabel`允许“无文字”；`mediaDescriptionLabel`只接收exporter/upstream提供的文字描述，不打开图片、语音、视频或附件原件。
- projection不得包含sourceId/personId/signalId/clientId/wcId/customerId、raw alias、sequence number、path/handle或raw timestamp。

## 4. Safe Source Attribution

### 4.1 我的微信

- exact source evidence：record属于active trusted `wechat-export-toolkit` source。
- public label：`我的微信`。
- 不显示export root、batch path、source ID或safe internal alias。

### 4.2 碎银官方人设

- exact source evidence：existing-MCP mapped moment row 携带可验证的 source-owned persona attribution，能与 T021/T028@1.1.0 的 encrypted official registry 精确闭合。
- public label：`碎银 · {官方人设名}`。
- 若 attribution 缺失、冲突、persona 不在 current registry 或 mapped scope receipt 不闭合，整条/整批按 local adapter contract fail closed；不得猜“1/2/3号”。

人物可能在多个采集位置出现，但人物的全局collection-location badge不能决定某条moment的来源。来源只取该moment自身provenance。

## 5. Existing MCP → Local Canonical Mapping

本合同不要求生产 MCP 新增同名工具/API。关系助手通过 live `tools/list` 与 input schema 选择现有无副作用读取路径，并在本地规范化为以下回执；字段名只是 canonical adapter output：

```text
request:
  environment = exact "bzds"
  officialPersonaSelectors = exact nonempty selected registry keys
  pageSize <= 50
  cursor/page = stable pagination input

response:
  rows[]
  stable snapshot/generation token
  exact applied persona selectors/labels
  declared/readable/failure or completeness receipt
  next cursor/page information

row:
  stable source-owned moment identity
  stable source-owned publisher identity
  publisher display name
  published instant
  body text or null
  media textual description or null
  exact persona attribution
```

现有 MCP 字段可由本地 adapter 映射，但以下证明不可省略：

- exact persona scope 必须由 existing-MCP 请求/响应事实证明，不能先全租户扫描再由 prototype 猜分配；
- read-only、稳定分页与稳定snapshot，翻页期间不重复/漏读；
- stable moment/publisher identity，不能用列表顺序或显示名当主键；
- 返回exact applied persona receipt与per-persona completeness/failure事实；
- response不能把群聊、客户列表或聊天message混进rows；
- source attribution必须与official registry闭合；
- typed error中不泄漏raw client/WC/customer/person IDs。

本地 mapping、schema、permission、pagination 或 completeness 尚未闭合时，唯一合法结果是 `LOCAL_SUIYIN_MOMENTS_ADAPTER_PENDING` 或更具体 typed local/read error。禁止 adapter stub、mock、空数组成功、group_context fallback 或环境切换工具；不得把本地缺口写成 MCP capability missing。

## 6. Timestamp Contract

- moment发布时间只来自该moment自己的trusted published instant。
- 接受canonical ISO instant；受支持legacy epoch必须在domain内部严格规范化为ISO后再投影。
- public label固定为本地可读`YYYY-MM-DD HH:mm`；无效/缺失为`时间未记录`。
- raw epoch、timezone parser error或原始字段值不得进入DOM/log/error/report。
- T029的`selectedAt/importedAt/exportedAt`是source receipt，不得替代published instant。

## 7. Query, Filter and Pagination Contract

- 基础集合：current active generation的eligible moments。
- source filter：多选同组OR；空集合表示全部eligible。
- cross-filter：source结果与normalized text、identity、classification按AND。
- text target：publisher display、body text、media textual description和safe source label；不得搜索内部ID/alias。
- 任一filter变化回到page 1。
- page size固定≤50；live DOM cards≤50。
- 排序必须稳定；相同时间使用内部稳定比较，但tie-breaker不得公开。
- 同graph reference + active generation的eligibility/source/sort基础projection在session内只计算一次；generation变化全部失效。
- text search 200ms latest-wins；过期timer或generation结果不得覆盖current feed。
- source/filter/page只刷新feed sink，不重绘source cards、receipts、backup区。
- 所有查询、筛选、分页与cache动作graph/persistent-cache write=0。

## 8. Classification Write Boundary

- 查看、搜索、筛选、分页全部只读。
- 分类只允许confirmed eligible moment，并使用current-generation opaque action token。
- controller enabled状态不是唯一守卫；domain必须重新验证token、record eligibility与expected generation。
- stale/invalid token或CAS failure为0 graph/cache write，并返回不含内部ID的typed reason。
- 分类成功只沿既有关系图语义创建一个new generation；不得顺便迁移legacy kind或补写source receipt。

## 9. Privacy and Logs

Public DOM、aria、dataset、URL、toast、error、log与review report中禁止：

- source/person/signal/moment/customer/client/WC numeric或stable IDs；
- raw safe alias、cursor/snapshot token、generation ID；
- raw epoch、full path、DirectoryHandle或filesystem metadata；
- 真实正文、发布者、媒体描述或搜索词测试证据。

自动测试、性能测量与报告只使用code-authored fictional fixtures与aggregate counters。真实业务UI仍按现有本机权限显示房总自己的内容，但不把内容复制到日志/报告。

## 10. T028/T029 Compatibility

- T028 current-allocation partial、allocation missing、friend/group/message counts、per-persona official labels 与 persona-complete receipt gate 保持不变。
- `group_context`仍可作为T028分析context保存，但永不进入T031 moment feed。
- T029 reimport diff/domain guard/CAS与`batchName/selectedAt/importedAt/exportedAt`保持；T031只读projection不修改receipt。
- source removal/purge/backup/restore触发new generation后，旧projection/token必须失效。

## 11. Verification Boundary

必须以fictional fixtures覆盖：

- mixed canonical moment / trusted legacy / group_context / excerpt / unknown；
- 我的微信与3个虚构official personas，以及missing/conflict attribution；
- ISO/legacy epoch/invalid time；
- body/media空值与长文本；
- source OR + text/identity/classification AND；
- 10k/20k moments和同量非moment signals；
- debounce/generation/classification stale；
- T028/T029 frozen regression与privacy canary。

禁止真实picker、真实export、真实IDB、真实MCP、private DOM、network/model/upload/send、E4/E5和production仓操作。

## 12. Re-review and Approval

出现以下任一变化，本合同必须回到review并升版：

- existing-MCP moments schema/mapping发生变化；
- persona selector、pagination/snapshot/completeness语义变化；
- official registry或source attribution映射变化；
- persistent cache、网络、共享、部署或生产端范围变化。

当前审核结论：approved。
当前批准人：房总，2026-08-20。
当前实施授权：本机原型/adapter 仍须独立 task contract；不创建生产 MCP Handoff/Issue，不授权本工作区跨仓实现。

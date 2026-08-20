---
profile_id: OPERATIONAL-RELATION-031
project: "关系·今天"
artifact_class: hosted-stateful
status: approved
owner: "房总"
approved_by: "房总"
approved_at: 2026-08-20
last_updated: 2026-08-20
---

# 关系·今天 — T031 Operational Profile

## 1. Profile Status and Inherited Exception

- 本Profile是`SPEC-RELATION-031@1.0.0`的已批准能力增量合同。
- 项目整体继续继承房总于2026-08-13批准的本机、单用户、loopback hosted-stateful例外；该既有例外不代表T031业务规格或新增能力已经获批。
- 房总已批准本Profile、源SPEC与Plan；签发版本化task contract前，T031仍不得修改产品、测试或运行状态。

## 2. 为什么静态 HTML 不足

- feed需要读取当前browser profile/origin的AES-GCM encrypted committed graph，并随active generation重建只读projection。
- 既有moment分类动作会创建新的业务generation并依赖CAS、backup/reopen与source lifecycle。
- 静态fixture无法证明真实本机vault的generation、stale和恢复边界；因此未来实施仍属于已有hosted-stateful原型，而不是static HTML。

## 3. 本增量允许与禁止的能力

### 3.1 批准后可允许

- 从已经打开的current committed graph只读投影trusted moment。
- session-only保存来源多选、文本/身份/分类筛选、当前页、200ms timer和generation-scoped projection cache。
- 为current generation生成不可逆向的ephemeral opaque source/action tokens。
- 房总显式触发既有moment分类时，沿用current-generation CAS完成一次加密本地写入。
- 刷新/重开从encrypted graph恢复，不自动picker、不自动导入、不自动MCP读取。

### 3.2 明确禁止

- 把`group_context`、chat excerpt、unknown signal当朋友圈。
- 打开Sources时自动扫描目录、读取微信导出或调用碎银MCP。
- 建persistent projection cache、迁移legacy kind、补写来源或把筛选状态写入graph。
- 存储/展示raw source/person/signal/customer/client/WC ID、raw alias、epoch、full path、DirectoryHandle或文件metadata。
- 上传、登录、云同步、共享、自动发送、模型推断来源。
- 修改MCP/Flutter/React/Go生产仓或把future capability当作已存在。

## 4. 用户、入口、身份与租户

- **使用者**：房总。
- **本地入口**：`http://127.0.0.1:8765/prototype/index.html#/sources`。
- **线上入口**：无。
- **身份边界**：当前Windows用户 + browser profile + loopback origin；无远端账户。
- **授权方式**：查看/筛选是本地只读；分类写入必须由房总逐次显式动作。
- **租户范围**：仅`bzds`当前本机关系库；不跨环境、不做全租户扫描。
- **未授权/失配反馈**：typed reason、0 write；不得泄漏内部ID。

## 5. 数据、缓存与生命周期

| 对象 | 生命周期 | 持久化 | 失效条件 | 隐私 |
|---|---|---|---|---|
| committed graph | 既有T002/T022生命周期 | AES-GCM IndexedDB/backup | source removal/purge/restore | 高敏感 |
| moment base projection | 当前页面session + generation | 否 | graph reference或generation变化 | 不含public raw IDs |
| source/filter token | 当前页面session + generation | 否 | generation变化/页面关闭 | opaque |
| search timer/result | 200ms latest-wins | 否 | 新输入/generation变化 | 不记录查询日志 |
| current filters/page | 当前页面session | 否 | 页面关闭；invalid token被移除 | safe label only |
| classification | 用户显式一次动作 | encrypted graph | CAS失败0写 | 沿既有关系库边界 |

- Legacy无`kind`仅做trusted WeChat projection；0 schema migration、0 open-time write、0 backup rewrite。
- 删除source、冷藏/purge或restore后，feed必须随new generation重建，不保留指向已删记录的token。

## 6. Source Capability

### 6.1 微信

- 只消费当前graph内已存在、符合T031 eligibility的trusted WeChat moment。
- 来源标签固定`我的微信`；批次/选择/导入/导出时间仍按T029 source receipt显示，不冒充moment发布时间。

### 6.2 碎银

- current production MCP没有persona-filtered read-only moments能力；状态固定`UPSTREAM_SUIYIN_MOMENTS_UNAVAILABLE`。
- 不创建adapter stub、不返回mock/空成功、不调用聊天history后转成朋友圈、不从`group_context`降级。
- future capability必须经正式生产变更、`source-contract.md`重审与新task contract授权，才可改变此状态。

## 7. API、网络与生产边界

- 当前T031不新增服务端API、网络请求、登录或shared persistence。
- 既有本机File System Access、IndexedDB与loopback server边界不扩大。
- 只允许未来task contract列明的`E:/AI 项目/关系维护助手`原型、focused fictional tests与review报告。
- 禁止修改`E:/dev/suiyin_mcp`及任意Flutter/React/Go/exporter仓。
- 禁止真实数据自动测试、真实MCP探测、private DOM、E4/E5、commit/push/tag/deploy。

## 8. 日志、错误与可观测性

- 允许：typed code、aggregate fictional counters、cache compute count、feed render count、graph/cache write count、duration budget。
- 禁止：真实发布者/正文/媒体描述、搜索词、source/person/signal ID、raw alias、epoch、path/handle。
- public错误使用稳定文案；上游缺失不显示“0条/已读取”，只显示能力尚未提供。
- 性能证据仅使用10k/20k code-authored fictional fixtures，不能抽样真实关系库。

## 9. 故障、恢复与回退

- vault unavailable：保留“数据未删除”事实，可重试恢复；不要求重导。
- projection/timer stale：丢弃旧结果并在current generation重建；0 persistent write。
- classification stale/error：0 write、保留页面结果，允许房总重试。
- source conflict/invalid time：对应record fail closed或显示安全fallback；不在UI猜测修复。
- 回退：恢复未来contract冻结的pre-T031原型tuple；不清库、不迁移、不删除`group_context`。

## 10. 房总批准

- [x] hosted-stateful增量能力与2026-08-13既有例外边界一致。
- [x] session cache、generation、分类写入与legacy 0write准确。
- [x] 微信可用、碎银moments upstream-blocked的能力事实准确。
- [x] 网络、日志、真实数据与生产仓禁区准确。
- [x] 可以由独立task contract授权实施。

**审核结论**：approved；本机增量不扩展网络或共享边界，碎银 moments 继续 upstream-blocked。  
**审核人**：房总  
**审核日期**：2026-08-20  

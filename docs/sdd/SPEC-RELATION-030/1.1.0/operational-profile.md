---
profile_id: OPERATIONAL-RELATION-030
project: "关系·今天"
artifact_class: hosted-stateful
status: approved
owner: "房总"
exception_approved_by: "房总"
exception_approved_at: 2026-08-13
reviewed_for_spec: SPEC-RELATION-030@1.1.0
last_updated: 2026-08-20
---

# 关系·今天 — T030 Operational Profile

## 1. 例外范围

- **为什么静态 HTML 不足以验证**：六项来源回执需要随现有 IndexedDB AES-GCM business graph、generation 与 backup/restore 持久，并消费显式微信 picker 与碎银 loopback staging。
- **本次允许的 hosted-stateful 能力**：仅在现有本机例外内新增严格加法 coverage receipt、纯聚合 projector、一次确认写入和备份恢复。
- **明确禁止扩展的能力**：新增远端 API、自动扫描/监听/导入、自动 MCP、切环境、上传、登录、共享、外发、生产仓修改、真实数据测试。
- **批准关联 SPEC / Plan**：`SPEC-RELATION-030@1.1.0` / `plan.md` 已于 2026-08-20 纠正批准；未签发版本化 task contract 前不得实施。

## 2. 用户与入口

- 使用者：房总。
- 本地入口：`http://127.0.0.1:8765/prototype/index.html#/sources`。
- 线上入口：无。
- 是否属于真实业务入口：本机个人试用，不是共享生产服务。

## 3. 身份、权限与租户

- 认证方式：本机 browser profile/origin，无远端账户。
- 授权方式：每次 picker、MCP read、confirm 均继承既有房总显式动作；查看六项回执本身只读。
- 角色与权限：房总可查看/选择/读取/确认/移除；应用只读来源、加密写本库。
- 租户隔离键：owner_local + bzds + browser origin + active generation。
- 未授权访问反馈：typed reason，0 write，不降级到 mock/0。

## 4. API、数据与迁移

- 服务端 API：不新增；复用浏览器 File System Access 与现有本机只读 MCP bridge。
- 共享持久化：无。
- 数据库 / binding：现有 AES-GCM graph/backup；仅新增 `coverageReceiptVersion=1` 与安全聚合。
- schema / migration：strict additive；旧来源缺字段只读 `legacy-unknown`，普通 open/reopen 0 migration。
- 数据分类与敏感性：聚合数字、状态与官方人设 label；raw ID、姓名、正文、路径、handle 不得进入 receipt/DOM/log/error。
- 备份、恢复和回滚：新 backup strict allowlist/shape；非法 receipt 整份 fail closed；失败/stale 保持 prior generation。

## 5. 部署与运维

- 托管平台：本机 loopback preview。
- 部署动作与责任人：无；未获完整推送。
- 监控 / 日志：固定 typed code 与聚合计数；不记录业务 payload。
- 故障联系人：房总。
- 下线与数据保留：沿 T002 source removal/backup/purge；新增 receipt 与来源同生命周期。

## 6. 生产边界

- 只允许 `E:/AI 项目/关系维护助手` 内批准后的原型、focused fictional tests 与治理文件。
- 不修改 wechat-export-toolkit、suiyin_mcp、suiyin-go、Flutter、React 或其他生产仓。
- 微信完整好友 roster 仍由 exporter #1 承接；T028 persona-complete 与碎银朋友圈复用现有 MCP。adapter/schema/permission/pagination/receipt 未闭合时必须具体 blocked/error，不得写成 MCP capability missing；本 Profile 不授权生产仓修改。
- capability/permission/storage/tenant 范围变化时 SPEC、Plan 与 Profile 一并回 review。

## 7. 房总审核

- [x] 例外理由与能力范围准确。
- [x] 身份、权限、租户与数据边界准确。
- [x] 备份、恢复、部署和下线责任清楚。
- [x] 不会覆盖工作区生产仓铁律。

**审核结论**：approved，继承 2026-08-13 本机 hosted-stateful 例外，不扩权。
**审核人**：房总
**审核日期**：2026-08-20

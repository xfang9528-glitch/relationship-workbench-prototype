---
profile_id: OPERATIONAL-RELATION-028
project: "关系·今天"
artifact_class: hosted-stateful
status: approved
owner: "房总"
approved_by: "房总"
approved_at: 2026-08-13
last_updated: 2026-08-20
---

# 关系·今天 — T028 Operational Profile

## 1. 例外范围

- **为什么静态 HTML 不足以验证**：来源预览通过本机 loopback 只读 MCP 形成 staging，确认后写入当前浏览器 AES-GCM IndexedDB graph。
- **本次允许的 hosted-stateful 能力**：现有 `127.0.0.1:8765`、显式用户点击、current `bzds`、批准的只读 persona/customer/history tools、内存 preview、一次本机加密 commit。
- **明确禁止扩展的能力**：自动 MCP、全租户无界扫描、写型 tool、上传/遥测/发送、共享/登录、生产仓修改、真实数据自动测试。
- **批准关联 SPEC / Plan**：`SPEC-RELATION-028@1.1.0` / `plan.md`。

## 2. 用户与入口

- 使用者：房总本人。
- 本地入口：`http://127.0.0.1:8765/prototype/index.html#/sources`。
- 线上入口：无。
- 是否属于真实业务入口：是，本机个人试用；不是多人/云端生产服务。

## 3. 身份、权限与租户

- 认证方式：无远端登录；本机浏览器 profile + loopback origin。
- 授权方式：每次由房总显式点击读取/重试/确认。
- 角色与权限：房总只读 MCP；应用仅可本地加密写关系图。
- 租户隔离键：current environment 必须 exact `bzds`。
- 未授权访问反馈：typed error；0 staging/graph write。

## 4. API、数据与迁移

- 服务端 API：本机 preview server 通过 live schema discovery 建立 MCP 读取工具 allowlist；allowlist 只控制本项目调用副作用，不定义 MCP 能力上限。
- 共享持久化：无。
- 数据库 / binding：当前浏览器 IndexedDB + non-extractable AES-GCM key。
- schema / migration：新增 receipt 字段严格 allowlist；旧 graph 缺字段只读兼容、0 open-time write。
- 数据分类与敏感性：客户、账号、聊天最高敏感；公开只展示 safe label/count。
- 备份、恢复和回滚：沿 T002/T021/T022；failure 保留 prior generation。

## 5. 部署与运维

- 托管平台：本机 Node preview + Chrome。
- 部署动作与责任人：无部署；未获完整推送。
- 监控 / 日志：固定 typed code 与聚合数；0 raw ID/name/body。
- 故障联系人：房总 / 关系助手本地 adapter 工程流程。
- 下线与数据保留：沿现有本地 source removal/purge/backup 合同。

## 6. 生产边界

- 本 Profile 只批准 `E:/AI 项目/关系维护助手` 内的原型与本机 adapter。
- 房总已确认 deployed MCP 具备全部所需读取能力；固定 allowlist、schema mapping、字段归一和回执缺口均在本项目修正，不得转成生产 MCP Issue。
- 不得进入 `E:/dev/suiyin_mcp`、Flutter、Go，也不得使用全租户扫描规避；若未来真实生产接口发生变化，再另行回到 source-contract review。

## 7. 房总批准

- [x] 例外理由与能力范围准确。
- [x] 身份、权限、租户与数据边界准确。
- [x] 备份、恢复、部署和下线责任清楚。
- [x] 不会覆盖工作区生产仓铁律。

**审核结论**：approved，继承 2026-08-13 本机 hosted-stateful 例外；2026-08-20 确认复用现有 MCP 读取能力，只修关系助手本地 adapter，production MCP 不在变更范围。
**审核人**：房总
**审核日期**：2026-08-19

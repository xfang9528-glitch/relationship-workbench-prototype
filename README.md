# 关系·今天：关系维护工作台原型

这是一个用于快速迭代关系维护工作台 UX/UI 的独立静态原型仓库。

## 当前范围

- 维护工作台：身份 → 标签 → 联系 → 反馈
- 全部关系：按姓名、标签或来源搜索
- 数据来源：区分微信与不同碎银账号
- 标签管理：在当前人物上下文中弹窗编辑，不跳页
- 联系内容：只生成和复制，不自动发送

页面只使用虚构演示数据，不包含真实联系人、聊天内容或账号凭据。

## 本地预览

直接打开 `index.html`，或使用任意静态文件服务器。

## Cloudflare Pages

项目名：`relationship-workbench-prototype`

```powershell
npx --yes wrangler@4.110.0 pages deploy . --project-name relationship-workbench-prototype --branch main
```

仓库采用纯 HTML/CSS/JavaScript，无构建步骤和外部运行依赖。

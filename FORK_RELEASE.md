# 账号中心前端 fork

配套后端为 `WILSONowo/rustdesk-api` 的 `codex/account-review-v1` 分支。前端使用同名分支，发布时记录两个仓库的提交号。

本版本包含注册/邮箱验证/管理员审核、邮箱换绑与找回密码、个人/共享通讯录、客户端下载及配置复制、账号页面统一样式、固定导航布局和表格宽度优化。

```sh
npm ci
npm test
npm run build
```

需要 Node.js 22。`dist/` 是构建产物，不提交 Git。生产推荐通过后端 `Dockerfile.source` 同时构建 Web/API；后端工作目录旁需有 `rustdesk-api-web` 目录。

`VITE_SERVER_API=/api/admin` 使用同域 API；这是构建时配置，不要把 SMTP 凭据、私钥或运行密码放进 Vite 环境变量。运行数据保存在后端数据卷，前端仓库不包含账号或客户端导入码。

`.github/workflows/verify.yml` 只安装锁定依赖、运行密码表单辅助逻辑测试并构建，不上传网站或发布镜像。

部署和邮件说明见后端 `FORK_RELEASE.md`、`ACCOUNT_V1.md`、`EMAIL_SETUP.md`；原许可证和版权声明保持不变。

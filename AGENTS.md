# NaiveClassSchedule 管理后台知识库

## 概述

Vue3 + Vite + Naive UI 网页管理后台，用于配置课表、调休规则、倒计时等。

## 项目结构

```
NaiveClassSchedule/
├── index.html              # 入口 HTML
├── package.json            # 依赖配置
├── vite.config.js          # Vite 构建配置
├── src/
│   ├── main.js             # 应用入口
│   ├── App.vue             # 根组件
│   ├── global.js           # 全局配置（API地址）
│   ├── api/                # API 封装层
│   │   ├── autorun.js      # 自动任务 API
│   │   ├── backup.js       # 备份 API
│   │   └── countdown.js    # 倒计时 API
│   ├── components/         # 公共组件
│   ├── router/             # 路由配置
│   ├── utils/              # 工具函数
│   └── views/              # 页面组件
│       ├── Home.vue        # 首页/总览
│       ├── Autorun.vue     # 自动任务列表
│       ├── Countdown.vue   # 倒计时列表
│       ├── ScheduleConfig.vue  # 课程表配置
│       ├── TimetableConfig.vue # 作息表配置
│       ├── SubjectsConfig.vue  # 学科配置
│       ├── SettingsConfig.vue  # 设置配置
│       └── Tools.vue       # 工具页
```

## 查找位置

| 任务 | 位置 | 说明 |
|------|------|------|
| API 调用 | `src/api/` | 封装后端 API 请求 |
| 页面组件 | `src/views/` | 各功能页面 |
| 路由配置 | `src/router/index.js` | 页面路由定义 |
| 全局配置 | `src/global.js` | API 服务器地址 |
| 工具函数 | `src/utils/` | 作用域工具等 |
| 公共组件 | `src/components/` | ConfirmPasswordModal 等 |

## 约定

### 编码规范
- **缩进**：2 空格（JS/CSS/HTML/package.json）
- **行尾**：CRLF（Windows）
- **编码**：UTF-8
- **尾部空格**：自动修剪
- **模块系统**：ES Modules（`"type": "module"`）

### 路径别名
- `@` 映射到 `./src` 目录
- 使用示例：`import xxx from '@/utils/xxx'`

### API 调用
- 使用 `vue-request` 库管理请求状态
- 支持轮询（如首页 1 秒轮询统计）
- 认证方式：BasicAuth（用户在界面输入密码）
- Serverless 模式下，总览页根据 `/web/statistic` 返回的 `serverless` 字段决定是否轮询和显示数据

### 路由结构
- 模式：HTML5 History 模式
- 所有路由采用懒加载
- 参数：`:school`、`:grade`、`:cls`（班级）、`:id`

## 反模式

### 安全相关
- **禁止** 在代码中存储密码（密码仅在界面输入，不持久化）
- **禁止** 跳过 BasicAuth 验证进行写操作

### 代码质量
- **禁止** 在 `src/views/` 中添加非页面组件
- **禁止** 使用 `any` 类型（虽然不是 TypeScript，但应避免松散类型）
- **禁止** 直接修改 `naive-ui` 组件源码

### 构建相关
- **禁止** 提交 `dist/` 目录（构建产物）
- **禁止** 提交 `node_modules/` 目录
- **禁止** 在生产环境暴露 Source Map

## 独特风格

### 动态菜单驱动
- 侧边栏菜单从后端 API（`/web/menu`）动态获取
- 支持多级学校/年级/班级结构
- 菜单结构由后端控制，前端仅渲染

### 作用域系统
- 使用 `学校/年级/班级` 格式的路径字符串
- 支持学校级、年级级、班级级三种粒度
- 路由参数自动解析作用域

### 主题适配
- 自动检测系统主题（深色/浅色）
- 使用 Naive UI 的主题系统
- 使用 `useOsTheme` 响应系统主题变化

### 实时监控
- 首页通过 1 秒轮询显示 WebSocket 连接状态
- 显示客户端统计和各班连接状态表格

## 命令

```bash
# 开发服务器
bun run dev

# 生产构建
bun run build

# 预览构建结果
bun run preview

# Docker 开发
bun run docker-dev

# Docker 预览
bun run docker-preview
```

## 注意事项

### 开发环境
- 需要 Node.js v18+
- 使用 Bun 包管理器
- 使用 Vite 开发服务器（支持热重载）
- 推荐安装 Vue.volar VSCode 扩展

### API 服务器
- 默认地址：`http://127.0.0.1:9000`
- 生产地址：通过 `src/global.js` 配置
- 开发服务器允许主机：`manager.khbit.cn`

### 认证机制
- 所有写操作需要 BasicAuth 密码验证
- 用户名：`ElectronClassSchedule`
- 密码：由用户在界面输入

### 数据备份
- 支持导出/导入备份（JSON 格式）
- 支持完整备份（包括配置和自动任务）
- 支持跨数据库类型迁移（MySQL ↔ SQLite）

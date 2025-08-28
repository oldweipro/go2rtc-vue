# go2rtc Vue 监控大屏

一个基于 Vue 3 + TypeScript 开发的现代化监控视频管理系统，专为 [go2rtc](https://github.com/AlexxIT/go2rtc) 设计的 Web 客户端。

![Vue](https://img.shields.io/badge/Vue-3.4-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ 特性

### 🎯 核心功能
- **多路视频监控**：支持同时查看多个 RTSP 视频流
- **灵活布局**：支持 1x1、2x2、3x3、4x4、5x5 多种网格布局
- **实时流媒体**：基于 go2rtc 的 MSE (Media Source Extensions) 技术
- **用户认证**：安全的登录系统和会话管理
- **响应式设计**：完美适配桌面和移动端设备

### 🎨 用户界面
- **现代化设计**：采用 ChatGPT 风格的清新界面
- **暗色主题**：自动适配系统主题偏好
- **动画交互**：流畅的过渡动画和微交互
- **直观操作**：拖拽式布局，点击即可预览
- **状态指示**：实时显示连接状态和监控状态

### 🔧 技术特性
- **TypeScript**：完整的类型安全支持
- **组件化架构**：可复用的 Vue 3 Composition API
- **HMR 支持**：开发时热模块替换
- **PWA 就绪**：支持离线使用和桌面安装
- **性能优化**：懒加载、代码分割、资源压缩

### ⚙️ 配置管理
- **智能配置**：首次使用自动引导配置
- **本地存储**：配置信息保存在浏览器中
- **配置验证**：确保服务器连接信息正确
- **灵活管理**：支持配置修改和重置

## 🚀 快速开始

### 前置要求

- Node.js 18.0 或更高版本
- go2rtc 服务器正在运行

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd go2rtc-vue

# 安装依赖
npm install

# 开发模式启动
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 📖 使用指南

### 1. 首次配置

首次访问系统时，会自动弹出配置对话框：

1. **服务器地址**：填入 go2rtc 服务器的 IP 地址或域名
2. **HTTP 端口**：通常是 1984（go2rtc 默认端口）
3. **WebSocket 端口**：如与 HTTP 端口不同则填写，否则留空

### 2. 添加监控

1. 点击左侧边栏的 "**新建监控**" 按钮
2. 填写监控名称和 RTSP 地址
3. 系统会自动验证并添加到 go2rtc 服务器

### 3. 视频预览

1. 点击右侧网格中的空白位置
2. 从弹出的监控列表中选择要预览的监控
3. 视频将实时加载并显示

### 4. 布局管理

- 使用顶部工具栏的布局选择器切换网格大小
- 支持 1x1 到 5x5 多种布局
- 点击左侧监控项可高亮对应的网格位置

## 🔧 开发指南

### 项目结构

```
src/
├── components/          # Vue 组件
│   ├── MonitorGrid.vue     # 监控网格组件
│   ├── MonitorSidebar.vue  # 侧边栏组件
│   ├── MonitorPlayer.vue   # 视频播放器组件
│   └── ServerSettings.vue  # 服务器设置组件
├── composables/         # 组合式 API
│   ├── useAuth.ts          # 认证逻辑
│   ├── useMonitors.ts      # 监控管理
│   ├── useServerConfig.ts  # 服务器配置
│   └── useMSE.ts          # MSE 媒体流处理
├── services/           # 服务层
│   ├── api.ts             # API 请求封装
│   └── websocket.ts       # WebSocket 连接
├── types/              # TypeScript 类型定义
├── views/              # 页面组件
│   ├── Dashboard.vue      # 主控制台
│   └── Login.vue          # 登录页面
└── router/             # 路由配置
```

### 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run typecheck

# 代码格式化
npm run format

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 代码规范

项目使用以下工具确保代码质量：

- **ESLint**：代码检查和风格统一
- **Prettier**：代码格式化
- **TypeScript**：类型安全
- **Vue 3 Composition API**：现代 Vue 开发模式

## 🌐 部署

### 生产构建

```bash
npm run build
```

构建文件将生成在 `dist/` 目录中。

### 静态托管

构建后的文件可以部署到任何静态文件服务器：

- **Nginx**
- **Apache**
- **Vercel**
- **Netlify**
- **GitHub Pages**

### Docker 部署

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t go2rtc-vue .
docker run -p 80:80 go2rtc-vue
```

## 🔧 配置选项

### 环境变量

```env
# .env.local
VITE_DEFAULT_SERVER_HOST=localhost
VITE_DEFAULT_SERVER_PORT=1984
```

### go2rtc 配置

确保您的 go2rtc 服务器配置允许 Web 访问：

```yaml
# go2rtc.yaml
api:
  listen: ":1984"
  
webrtc:
  listen: ":8555"
  
streams:
  # 您的流配置
```

## 🐛 常见问题

### Q: 无法连接到服务器
A: 检查服务器地址和端口是否正确，确保 go2rtc 服务正在运行。

### Q: 视频无法播放
A: 确保浏览器支持 MSE，推荐使用 Chrome、Firefox 或 Edge。

### Q: 配置丢失
A: 配置保存在浏览器的 localStorage 中，清除浏览器数据会丢失配置。

### Q: 移动端体验
A: 系统支持移动端访问，但推荐在平板或更大屏幕上使用以获得最佳体验。

## 🤝 贡献

欢迎提交 Pull Request 或创建 Issue！

1. Fork 本项目
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [go2rtc](https://github.com/AlexxIT/go2rtc) - 优秀的流媒体服务器
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集

---

🎉 **开始您的监控之旅吧！** 如有问题，请随时创建 Issue 或联系维护者。
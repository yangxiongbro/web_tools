# Web Tools

基于 Vue 3、Element Plus 和 Vite 构建的网页工具集合，当前包含：

- JSON 字符串格式化、校验、错误定位、层级折叠与复制
- 命名规范转换：下划线转驼峰、驼峰转下划线小写、驼峰转下划线大写

## 环境要求

- Node.js 18 或更高版本（推荐 Node.js 20 LTS）
- npm

可以使用以下命令检查本地环境：

```bash
node --version
npm --version
```

## 安装依赖

首次运行或重新拉取项目后，在项目根目录执行：

```bash
npm install
```

## 本地启动

启动 Vite 开发服务器：

```bash
npm run dev
```

默认访问地址：

```text
http://localhost:5173/
```

Vite 配置已将开发服务器监听地址设置为 `0.0.0.0`。启动后，终端中还会显示可供同一局域网设备访问的网络地址。

开发服务器支持热更新，修改源码后页面会自动刷新。

## 生产打包

执行生产构建：

```bash
npm run build
```

构建完成后，静态文件会生成到：

```text
dist/
```

生产构建会将 JavaScript 和 CSS 内联到 `dist/index.html`，因此可以直接双击该文件在浏览器中打开，也可以将 `dist` 目录部署到 Nginx、Apache、IIS 或任意静态文件服务器。

## 运行测试

执行项目单元测试：

```bash
npm test
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm install` | 安装项目依赖 |
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm test` | 运行单元测试 |

## 项目结构

```text
web_tools/
├── public/                  # 可选：无需编译的静态资源
├── src/
│   ├── components/          # 页面组件
│   ├── styles/              # 全局样式
│   ├── utils/               # JSON、命名转换及测试工具
│   ├── App.vue              # 应用入口组件
│   └── main.js              # Vue 应用入口
├── index.html               # HTML 模板
├── vite.config.js           # Vite 配置
├── package.json             # 项目依赖与命令
└── README.md
```

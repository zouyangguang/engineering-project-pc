<h1 align="center">项目管理平台（web前端）</h1>

### 项目介绍

&emsp;

### 环境准备

```
# 安装 Node

  版本：18.20+

# 开发工具

  VSCode
```

### 项目启动 | 打包

```
# 安装依赖
npm install

# 运行开发环境
npm run dev

# 运行生产环境
npm run prod

# 打包生产环境
npm run build:prod
```

### 分支版本

| 分支名  | 说明                                                                                                   |
| ------- | ------------------------------------------------------------------------------------------------------ |
| master  | 主分支，生产环境运行的代码                                                                             |
| release | 预发布分支，用于代码上线前的准备测试 & bug 修复。基于此分支的修改合并提交至 master分支 和 release 分支 |
| develop | 开发分支，feature & bugfix 基于此分支                                                                  |
| feature | 功能分支，开发新功能模块使用，开发完成自测后合并提交 develop 分支，并删除该分支                        |
| bugfix  | bug 修复分支，基于此分支的修改合并提交至 release 分支，并删除该分支                                    |

### 目录结构

```
├─public -- 公共库
├─src -- 源代码
│   ├─api -- API接口
│   ├─assets -- 资源
│   ├─components -- 公共组件
│   ├─hooks -- 封装函数
│   ├─interface -- 类型约束
│   ├─layout -- 项目结构
│   ├─routers -- 路由表
│   ├─stores -- Pinia状态管理
│   ├─styles -- 样式
│   │   ├─element.scss -- elementUI自定义样式
│   │   └─index.scss -- 全局样式
│   ├─utils -- 插件
│   │   ├─handle.ts -- 数据处理
│   │   └─iconpark.js -- 图标库
│   └─views -- 页面模块
│   │   ├─dashboard -- 控制台
│   │   ├─error -- 报错页
│   │   ├─login -- 登录
│   │   ├─system -- 系统配置模块
│   │   │   ├─dept -- 部门管理
│   │   │   ├─post -- 岗位管理
│   │   │   └─staff -- 员工管理
│   ├─App -- 根组件
│   ├─main.js -- 入口文件
│   └─vite-env.d.ts -- 全局类型声明
├─.env.development -- 测试环境配置
├─.env.production -- 生产环境配置
├─.eslintignore -- 配置eslint忽略文件
├─.eslintrc.cjs -- eslint配置（规范代码工具）
├─.gitignore -- 配置git忽略文件
├─.prettierignore -- 配置prettier忽略文件
├─.prettierrc.cjs -- prettier配置（规范代码工具）
├─index.html -- 根页面
├─package-lock.json -- 记录模块之间依赖关系，锁定包版本
├─package.json -- 项目描述文件
├─README.md -- 项目介绍
├─tsconfig.app.json -- ts 应用程序 配置
├─tsconfig.json -- ts配置
├─tsconfig.node.json -- ts node环境 配置
└─vite.config.js -- 脚手架配置
```

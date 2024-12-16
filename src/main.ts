import { createApp } from "vue"
import App from "./App.vue"
import Router from "./routers"
import Pinia from "./stores/index.ts"

import ElementPlus from "element-plus"
import zhCn from "element-plus/es/locale/lang/zh-cn"
import * as ElementPlusIconsVue from "@element-plus/icons-vue"
import IconPark from "./utils/iconpark.ts"

import "@/styles/index.scss"
import "@icon-park/vue-next/styles/index.css"

// 创建 app
const app = createApp(App)

// 注册路由
app.use(Router)
// 注册pinia
app.use(Pinia)
// 注册 IconPark
app.use(IconPark)
// 注册 Element-Plus
app.use(ElementPlus, {
  locale: zhCn
})
// 注册 Element-Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 挂载
app.mount("#app")

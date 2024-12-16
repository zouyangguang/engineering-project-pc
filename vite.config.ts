import { defineConfig, loadEnv, ConfigEnv, UserConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import path from "path"
// gzip压缩
import viteCompression from "vite-plugin-compression"

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
  // 获取配置文件别名配置
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [vue(), viteCompression()],
    server: {
      host: true, // 监听所有地址
      port: 10086, // 端口号
      hmr: true, // 热更新
      open: true, // 启动时自动在浏览器打开
      proxy: {
        // 跨域配置
        "/api": {
          target: env.VITE_PROXY_URL,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, "")
        }
      }
    },
    resolve: {
      // 配置路径别名
      alias: [{ find: "@", replacement: path.resolve("./src") }]
    },
    css: {
      // css全局变量使用，@/styles/variable.scss文件
      preprocessorOptions: {
        scss: {
          javascriptEnabled: true,
          additionalData: '@import "./src/styles/variable.scss";'
        }
      }
    },
    esbuild: {
      // 去除console 和 debugger
      pure: env.VITE_DROP_CONSOLE ? ["console.log", "debugger"] : []
    }
  }
})

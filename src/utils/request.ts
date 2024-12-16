import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios"
import { ref, h } from "vue"
import { ElMessage, ElNotification } from "element-plus"
import { handleNumber } from "./handle.ts"
import Progress from "@/components/Progress/index.vue"

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // 默认请求接口
  headers: { "Content-Type": "application/json;charset=utf-8" },
  timeout: 30000 // 请求超时时间
})

// 下载任务箱
const taskBox = ref<any[]>([])
// 关闭下载进度框，移除任务
const closeNotification = (currentURL: any) => {
  taskBox.value.find((item: any, index: any) => {
    if (item.url === currentURL) {
      item.noticeId.close()
      taskBox.value.splice(index, 1)
      return true
    }
  })
}

// 请求拦截器
service.interceptors.request.use(
  // 请求成功
  (config: InternalAxiosRequestConfig) => {
    // 请求头添加 token
    if (localStorage.engineeringToken) {
      config.headers.token = localStorage.engineeringToken
    }

    // 请求地址包含 download 时
    if (config.url?.includes("download")) {
      // 实例 - 取消请求
      const controller = new AbortController()
      config.signal = controller.signal
      // 取消超时限制
      config.timeout = 0
      // 文件下载进度条
      const downloadProgress = ref(0)

      // 显示下载进度框
      const notice = ElNotification({
        title: config.params.name,
        duration: 0,
        offset: 50,
        message: h(Progress, { percentage: downloadProgress }),
        onClose() {
          // 主动取消请求操作
          controller.abort()
        }
      })

      // 当前请求正在执行下载任务，则添加到任务箱中
      taskBox.value.push({
        url: config.url,
        noticeId: notice
      })

      // 进度赋值
      config.onDownloadProgress = (event: any) => {
        downloadProgress.value = handleNumber(2, event.progress * 100)
      }
    }
    return config
  },

  // 请求失败，抛出异常
  (error: any) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  // 响应成功，返回数据
  (success: AxiosResponse) => {
    // 请求地址包含 download 时
    if (success.config.url?.includes("download")) {
      // 下载任务执行完毕，关闭下载进度框，从任务箱移除
      closeNotification(success.config.url)

      // 返回数据
      return Promise.resolve(success)
    }

    // 如果返回的状态码 < 300，说明接口请求成功，
    if (success.data.code < 300) {
      // 返回数据
      return Promise.resolve(success)
    } else {
      // 页面报错提示
      ElMessage.error(success.data.msg)

      // 抛出异常
      return Promise.reject(success)
    }
  },

  // 响应失败，抛出异常
  (error: any) => {
    // 主动取消请求
    if (error.code == "ERR_CANCELED") {
      ElMessage.success("请求取消成功")

      // 抛出异常
      return Promise.reject(error)
    }

    // 请求地址包含 download 时
    if (error.config.url?.includes("download")) {
      // 关闭下载进度框，从任务箱移除
      closeNotification(error.config.url)

      // 页面报错提示
      ElMessage.error("下载失败，接口异常或文件不存在")

      // 抛出异常
      return Promise.reject(error)
    }

    // 401，token失效
    if (error.response.data.code === 401) {
      ElMessage.error("账号登录过期，请重新登录")

      setTimeout(() => {
        // 清空缓存
        sessionStorage.clear()
        // 删除 token
        localStorage.removeItem("engineeringToken")
        // 刷新页面
        location.reload()
      }, 3000)

      // 抛出异常
      return Promise.reject(error)
    }
  }
)

export default service

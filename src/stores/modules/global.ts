import { defineStore } from "pinia"

const useGlobalStore = defineStore("global", {
  // 存储数据
  state() {
    return {
      // 是否移动设备
      isMobile: null
    }
  },

  // 业务逻辑，类似与组件的 methods
  actions: {
    checkIsMobile() {
      const agent = /(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent)
      const rect = document.body.getBoundingClientRect().width
      this.isMobile = rect < 1200 || agent

      window.addEventListener("resize", () => {
        const rect = document.body.getBoundingClientRect().width
        this.isMobile = rect < 1200 || agent
      })
    }
  },

  // 计算属性，类似与组件的 computed
  getters: {}
})

export default useGlobalStore

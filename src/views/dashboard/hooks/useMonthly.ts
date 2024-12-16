import { ref, onMounted, nextTick } from "vue"
import { useRouter } from "vue-router"
import type { MonthlyListInter } from "@/api/dashboard/types.ts"
import * as DashboardAPI from "@/api/dashboard/index.ts"

export const useMonthly = () => {
  //【实例】路由
  const router = useRouter()

  //【变量】获取当前年份
  const year = new Date().getFullYear()
  //【变量】获取当前月份
  const month = new Date().getMonth() + 1
  //【变量】月历滚动状态 - 加载中
  const scrollLoading = ref<Boolean>(false)
  //【变量】简报状态 - 加载中
  const monthlyLoading = ref<Boolean>(false)

  //【变量】是否禁止滚动
  const isDisabledScroll = ref<Boolean>(false)
  //【变量】工程月历 - 当前折叠面板(获取当前年-月)
  const currentCollapse = ref(`${year}-${month < 10 ? "0" + month : month}`)
  //【变量】工程月历 - 已生成年份(0为当年，逐渐添加)
  const countYear = ref(0)
  //【变量】工程月历列表
  const monthlyList = ref<InstanceType<typeof MonthlyListInter>[]>([])
  //【方法】工程月历 - 添加(每次生成一年 12 个月)
  const addMonthlyList = () => {
    let newData: any = []
    let currentYear = year - countYear.value
    for (let i = 1; i < 13; i++) {
      if (countYear.value != 0 || month >= i) {
        newData.unshift({
          title: `${currentYear}-${i < 10 ? "0" + i : i}`,
          children: []
        })
      }
    }

    countYear.value++
    monthlyList.value = monthlyList.value.concat(newData)

    nextTick(() => {
      scrollLoading.value = false
      isDisabledScroll.value = currentYear <= 2015
    })
  }
  //【方法】工程月历 - 滚动到底部触发
  const handleScroll = () => {
    scrollLoading.value = true
    addMonthlyList()
  }
  //【方法】工程月历 - 获取简报详情
  const getMonthlyList = (index?: number) => {
    // 判断折叠面板是否展开且不存在数据，获取简报【减少频繁请求】
    if (currentCollapse.value && monthlyList.value[index!].children.length == 0) {
      monthlyLoading.value = true
      DashboardAPI.getMonthlyList(currentCollapse.value)
        .then((res: any) => {
          monthlyList.value[index!].children = res.data.data
        })
        .finally(() => {
          monthlyLoading.value = false
        })
    }
  }
  //【方法】工程月历 - 跳转项目
  const pushToProject = (id: number) => {
    sessionStorage.projectId = id
    router.push({ path: "/project/detail" })
  }

  // 【生命周期】挂载后
  onMounted(() => {
    scrollLoading.value = true
    nextTick(() => {
      getMonthlyList(0)
    })
  })

  return {
    scrollLoading,
    monthlyLoading,
    isDisabledScroll,
    currentCollapse,
    monthlyList,
    handleScroll,
    getMonthlyList,
    pushToProject
  }
}

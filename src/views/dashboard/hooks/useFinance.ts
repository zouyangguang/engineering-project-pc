import { ref, onMounted, computed, nextTick } from "vue"
import * as echarts from "echarts"
import type { PlanAndActualInter, AverageMonthlyInter, RankingInter } from "@/api/dashboard/types.ts"
import * as DashboardAPI from "@/api/dashboard/index.ts"
export const useFinance = () => {
  //【变量】计划与实际数据
  const planAndActualData = ref<InstanceType<typeof PlanAndActualInter>>({})
  //【方法】获取计划与实际
  const getPlanAndActual = () => {
    DashboardAPI.getPlanAndActual().then((res: any) => {
      planAndActualData.value = res.data.data
    })
  }

  //【变量】每月收回款项
  const monthlyMoney = ref<InstanceType<typeof AverageMonthlyInter>[]>([])
  //【变量】平均月度收回款项
  const averageMoney = computed(() => {
    let sumMoney = 0
    monthlyMoney.value.forEach((item: any) => {
      sumMoney += item.finishMoney
    })

    return sumMoney / monthlyMoney.value.length
  })
  //【方法】获取每月收回款项
  const getAverageMonthly = () => {
    DashboardAPI.getAverageMonthly().then((res: any) => {
      monthlyMoney.value = res.data.data

      nextTick(() => {
        createChart()
      })
    })
  }
  //【echart】创建图表
  const createChart = () => {
    let myChart = echarts.init(document.getElementById("myChart"))
    myChart.setOption({
      grid: {
        top: "10%",
        left: "1%",
        right: "2%",
        bottom: "0%",
        containLabel: true
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
      },
      yAxis: { type: "value" },
      // 提示框
      tooltip: {
        show: true,
        trigger: "axis",
        // 坐标轴样式
        axisPointer: {
          type: "cross",
          label: { backgroundColor: "#1677ff" }
        }
      },
      series: [
        {
          type: "line",
          data: monthlyMoney.value.map((item: any) => item.finishMoney),
          itemStyle: { color: "#1677ff" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: "#1677ff" // 0% 处的颜色
                },
                {
                  offset: 1,
                  color: "white" // 100% 处的颜色
                }
              ],
              global: false // 缺省为 false
            }
          }
        }
      ]
    })
  }

  //【变量】最赚钱的项目排行榜
  const rankingData = ref<InstanceType<typeof RankingInter>[]>([])
  //【变量】排行榜总金额（用于进度条换算）
  const rankingCount = computed(() => {
    let sumMoney = 0
    rankingData.value.forEach((item: any) => {
      sumMoney += item.amount || 0
    })

    return sumMoney
  })
  //【方法】获取每月收回款项
  const getRankingList = () => {
    DashboardAPI.getRankingList().then((res: any) => {
      rankingData.value = res.data.data
    })
  }

  onMounted(() => {
    getPlanAndActual()
    getAverageMonthly()
    getRankingList()
  })

  return { planAndActualData, averageMoney, rankingData, rankingCount }
}

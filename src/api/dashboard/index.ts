/* 控制台 - 接口 */
import request from "@/utils/request.ts"
import type { PaginationInter } from "../../interface/index.ts"

// 获取工程月历
export const getMonthlyList = (month: string) => {
  return request({
    method: "get",
    url: "/dashboard/getMonthReport",
    params: { month }
  })
}

// 获取需要注意的工程
export const getAttentionList = (page?: PaginationInter) => {
  const params = {
    page: 1, // 当前页数
    size: 100 // 每页显示条数
  }

  return request({
    method: "get",
    url: "/dashboard/getNoticeReport",
    params
  })
}

// 获取计划与实际
export const getPlanAndActual = () => {
  return request({
    method: "get",
    url: "/dashboard/getExpectAndActStatus"
  })
}

// 获取平均阅读收回款项
export const getAverageMonthly = () => {
  return request({
    method: "get",
    url: "/dashboard/getMeanMonthlyReport"
  })
}

// 获取最赚钱的项目TOP5
export const getRankingList = () => {
  return request({
    method: "get",
    url: "/dashboard/getTop5Project"
  })
}

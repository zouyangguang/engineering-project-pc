/* 业务总览 - 接口 */
import request from "@/utils/request.ts"
import type { SearchFormInter } from "./types"

// 获取业绩总览报表
export const getPerformanceReportList = (parm: SearchFormInter, page?: any) => {
  const params = {
    projectName: parm.projectName, // 项目名称
    contractId: parm.contractId, // 合同编号
    customerManagerName: parm.customerManagerName, // 客户经理名称
    page: page.current, // 当前页数
    size: page.pagesize, // 每页显示条数
    projectIds: parm.ids // 项目ID
  }

  return request({
    method: "get",
    url: "/report/performanceReport/getCondition",
    params
  })
}

// 导出业绩总览
export const exportPerformanceReport = (params: any) => {
  return request({
    method: "get",
    url: "/report/performanceReport/exportCondition",
    params
  })
}

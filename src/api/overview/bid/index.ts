/* 招投标总览 - 接口 */
import request from "@/utils/request.ts"
import type { SearchFormInter } from "./types"

// 获取招投标总览报表
export const getBidReportList = (parm: SearchFormInter, page?: any) => {
  const params = {
    status: parm.status, // 投标状态【0投标中 1已中标 2未中标 3已撤标 4无需投标】
    bidPattern: parm.bidPattern, // 招标模式
    projectType: parm.projectType, // 项目类别
    startBidDateTime: parm.bidDate && parm.bidDate[0], // 投标开始时间
    endBidDateTime: parm.bidDate && parm.bidDate[1], // 投标结束时间
    projectName: parm.projectName, // 项目名称
    page: page.current, // 当前页数
    size: page.pagesize, // 每页显示条数
    ids: parm.ids // 项目ID
  }

  return request({
    method: "get",
    url: "/report/bidReport/getCondition",
    params
  })
}

// 导出招投标总览
export const exportBidReport = (params: any) => {
  return request({
    method: "get",
    url: "/report/bidReport/exportCondition",
    params
  })
}

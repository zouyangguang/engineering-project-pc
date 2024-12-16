/* 合同总览 - 接口 */
import request from "@/utils/request.ts"
import type { SearchFormInter } from "./types"

// 获取合同总览报表
export const getContractReportList = (parm: SearchFormInter, page?: any) => {
  const params = {
    typeId: parm.typeId, // 合同类型
    startSignDateTime: parm.signDate && parm.signDate[0], // 签约开始时间
    endSignDateTime: parm.signDate && parm.signDate[1], // 签约结束时间
    projectName: parm.projectName, // 项目名称
    name: parm.name, // 合同名称
    customerManagerName: parm.customerManagerName, // 客户经理名称
    page: page.current, // 当前页数
    size: page.pagesize, // 每页显示条数
    ids: parm.ids // 项目ID
  }

  return request({
    method: "get",
    url: "/report/contractReport/getCondition",
    params
  })
}

// 导出合同总览
export const exportContractReport = (params: any) => {
  return request({
    method: "get",
    url: "/report/contractReport/exportCondition",
    params
  })
}

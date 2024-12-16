/* 附件总览 - 接口 */
import request from "@/utils/request.ts"
import type { SearchFormInter } from "./types"

// 获取附件总览报表
export const getFileReportList = (parm: SearchFormInter, page?: any) => {
  const params = {
    projectName: parm.projectName, // 项目名称
    name: parm.name, // 合同名称
    page: page.current, // 当前页数
    size: page.pagesize, // 每页显示条数
    ids: parm.ids // 项目ID
  }

  return request({
    method: "get",
    url: "/report/attachmentReport/getCondition",
    params
  })
}

// 导出附件总览
export const exportFileReport = (params: any) => {
  return request({
    method: "get",
    url: "/report/attachmentReport/exportCondition",
    params
  })
}

// 下载附件
export const downloadFile = (path: string, name: string) => {
  return request({
    method: "get",
    responseType: "blob",
    url: "/report/attachmentReport/download/" + path,
    params: { name }
  })
}

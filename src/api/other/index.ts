/* 其它功能 - 接口 */
import request from "@/utils/request.ts"
import type { LogsSearchFormInter } from "./types.ts"
import type { PaginationInter } from "../../interface/index.ts"

// 获取下载中心任务列表
export const getDownloadTaskList = (parm: any, page?: any) => {
  const params = {
    page: page.current, // 当前页数
    size: page.pagesize // 每页显示条数
  }

  return request({
    method: "get",
    url: "/common/task/getCondition",
    params
  })
}

// 下载任务文件
export const downloadTaskFile = (path: string, name: string) => {
  return request({
    method: "get",
    responseType: "blob",
    url: "/common/task/download/" + path,
    params: { name }
  })
}

// 获取操作日志列表
export const getOperatorLogs = (parm: LogsSearchFormInter, page: PaginationInter) => {
  const params = {
    operateName: parm.operateName, // 操作类型
    operateResult: parm.operateResult, // 操作结果
    operateEmployeeName: parm.operateEmployeeName, // 操作人
    startCreateDateTime: parm.operationTime && parm.operationTime[0], // 操作开始时间（接口）
    endCreateDateTime: parm.operationTime && parm.operationTime[1], // 操作结束时间（接口）
    page: page.current, // 当前页数
    size: page.pagesize // 每页显示条数
  }

  return request({
    method: "get",
    url: "/common/log/getCondition",
    params
  })
}

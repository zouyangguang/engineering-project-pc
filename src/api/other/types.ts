/* 其它功能 - 类型声明 */

// 下载中心查询表单
export interface DownloadSearchInter {
  type: string // 任务类型【0整个项目资源导出，1报表数据导出】
  status: string // 任务状态【 0待执行，1执行中，2成功，3失败，4超时】
  createDate?: string[] // 提交任务时间（组件）
  startCreateDateTime?: string[] // 提交任务开始时间（接口）
  endCreateDateTime?: string[] // 提交任务结束时间（接口）
  page?: number // 当前页数
  size?: number // 每页显示条数
  ids?: string // 项目ID
}

// 下载中心列表
export interface DownloadTaskListInter {
  date: string // 创建时间
  children: [
    {
      id: number // 包ID
      name: string // 系统文件名
      alias: string // 导出文件名
      source: string // 来源
      status: number // 打包状态【 0待执行，1执行中，2成功，3失败，4超时】
      statusName: number // 打包状态名称
      type: number // 任务类型【0整个项目资源导出，1报表数据导出】
      typeName: number // 任务类型名称
      url: string // 下载地址
      size: number // 文件大小
      createDateTime: string // 创建时间
      finishDateTime: string // 完成时间
      employeeName: string // 创建人
      note: string // 备注
      loading: Boolean // 按钮状态
    }
  ]
}

// 操作日志列表
export interface LogsTableInter {
  id: number // 操作ID
  moduleName: string // 模块名称
  operateName: string // 操作名称
  operateEmployeeNumber: string // 员工ID
  operateEmployeeName: string // 员工名称
  operateEmployeeDepartName: string // 部门名称
  operateResult: 0 // 操作结果【1成功 2失败】
  operateResultName: string // 操作结果文本
  operateDescribe: string // 结果描述
  request: string // 请求数据
  response: string // 响应数据
  createDateTime: string // 创建时间
}

// 操作日志查询表单
export interface LogsSearchFormInter {
  operateName?: string | null // 操作类型
  operateResult?: string | null // 操作结果【1成功 2失败】
  operateEmployeeName?: string | null // 操作人
  operationTime?: string[] | null // 操作时间（组件）
  startCreateDateTime?: string | null // 操作开始时间（接口）
  endCreateDateTime?: string | null // 操作结束时间（接口）
}

/* 附件总览 - 类型声明 */

// 附件总览查询表单
export interface SearchFormInter {
  projectName: string // 项目名称
  name: string // 附件名称
  page?: number // 当前页数
  size?: number // 每页显示条数
  ids?: string // 项目ID
}

// 附件总览列表
export interface TableInter {
  id: number // 附件ID
  projectId: string // 项目ID
  projectName: string // 所属项目
  name: string // 附件名称
  size: number // 附件大小
  createEmployeeName: string // 上传人
  createDateTime: string // 上传时间
}

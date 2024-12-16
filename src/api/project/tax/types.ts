/* 缴税管理 - 类型声明 */
// 文件类型
export interface Attachment {
  orderNumber: number
  name: string
  type: string
  url: string
  note: string
  size: number
}
//纳税 类型
export interface taxInter {
  id: number //ID
  projectId: string //项目ID
  projectName: string //项目名称
  typeId: number //类型ID
  typeName: string //类型名称
  tax: number //纳税金额
  taxDateTime: string //纳税时间
  prepay: number //是否预缴
  runnerEmployeeId: number //经办人ID
  runnerEmployeeName: string //经办人姓名
  note: string //备注
  attachments: Attachment[] //附件
  version: number
}
//纳税 表单类型
export interface taxFormInter {
  projectId: string //项目ID
  runnerEmployeeId: string //经办人ID
  tax: number //纳税金额
  typeId: number | "" //类型ID
  taxDateTime: string //纳税时间
  prepay: number //是否预缴
  note: string //备注
  attachments: Attachment[] //附件
}

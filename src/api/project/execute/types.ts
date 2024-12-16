/* 工程实施、概要 - 类型声明 */

// 工程实施类型
export interface ProjectExecuteInter {
  id: number //ID
  projectId: string //项目编号
  projectName: string //项目名称
  partId: string //分序号
  teamTypeId: number //团队类型ID
  teamTypeName: string //团队类型名称
  teamName: string //班组名称
  workContent: string //工作内容
  cost: number //成本
  amount: number //计算金额
  profit: number //利润
  costPayDateTime: string //成本支出时间
  receipt: string //回执单号
  contactPerson: string //对接人
  note: string //备注
}
// 附件类型
export interface AttachmentInter {
  orderNumber: number //顺序号
  name: string //名称
  type: string //类型
  url: string //地址
  note: string //备注
  size: number //文件大小
}
// 工程实施表单
export interface formInter {
  projectId: string //项目编号
  teamTypeId: number | "" //团队类型编号
  teamName: string //团队名称
  workContent: string //工作内容
  cost: number //成本
  amount: number //结算金额
  costPayDateTime: string //成本支出时间
  receipt: string //回执单
  contactPerson: string //对接人
  note: string //备注
  attachments: AttachmentInter[] //附件列表
}

// 回款单号 类型
export interface receiptInter {
  id: number //ID
  projectId: string //项目编号
  projectName: string //项目名称
  returnedDateTime: string //回款日期
  returnedMoney: number //回款金额
  returnedPercent: number //回款占比
  receipt: string //单号
  note: string //备注
}

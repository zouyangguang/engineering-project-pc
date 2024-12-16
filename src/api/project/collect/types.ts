/* 项目回款 - 类型声明 */

//回款类型
export interface collectInter {
  id: number //ID
  projectId: string //项目编号
  projectName: string //项目名称
  returnedDateTime: string //回款日期
  returnedMoney: number //回款金额
  returnedPercent: number //回款占比
  receipt: string //单号
  note: string //备注
}
//附件列表
export interface Attachment {
  orderNumber: number //顺序
  name: string //名称
  type: string //类型
  url: string //地址
  note: string //说明
  size: number //文件大小
}
//回款表单
export interface formInter {
  projectId: string //项目编号
  returnedDateTime: string //回款日期
  returnedMoney: number //回款金额
  receipt: string //回执单号
  note: string //备注
  attachments: Attachment[] //附件列表
}

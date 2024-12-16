/* 进项管理 - 类型声明 */

//收票历史 类型
export interface invoiceHistoryInter {
  id: number //ID
  projectId: string //项目ID
  projectName: string //项目名称
  taxRate: number //税率
  taxAmount: number //含税金额
  tax: number //税额
  inManagementPoints: number //购票管理点数
  outManagementFee: number //开票管理费
  invoiceTransferDateTime: string //开票转账日期
  invoiceDateTime: string //开票日期
  materialJoinerId: number //对接人
  materialJoinerName: string //对接人姓名
  goneTotal: number //走款合计
  goneTotalPercent: number //走款占比
  backTotal: number //回款合计
  backTotalPercent: number //回款占比
  note: string //备注
  version: number //
}

//附件 类型
export interface AttachmentInter {
  orderNumber: number //顺序号
  name: string //名称
  type: string //类型
  url: string //地址
  note: string //备注
  size: number //文件大小
}

//收票 类型
export interface invoiceInter {
  id: number //ID
  projectId: string //项目ID
  projectName: string //项目名称
  taxRate: number //税率
  taxAmount: number //含税金额
  tax: number //税额
  inManagementPoints: number //购票管理点数
  outManagementFee: number //开票管理费
  invoiceTransferDateTime: string //开票转账日期
  invoiceDateTime: string //开票日期
  materialJoinerId: number //对接人
  materialJoinerName: string //材料对接姓名
  goneTotal: number //走款合计
  goneTotalPercent: number //走款占比
  backTotal: number //回款合计
  backTotalPercent: number //回款占比
  note: string //备注
  attachments: AttachmentInter[] //收票附件
  version: number //
}

//收票表单
export interface invoiceFormInter {
  projectId: string //项目ID
  taxRate: number //税率
  taxAmount: number //含税金额
  inManagementPoints: number //购票管理点数
  invoiceTransferDateTime: string //开票转账日期
  invoiceDateTime: string //开票日期
  materialJoinerId: number | "" //对接人
  note: string //备注
  attachments: AttachmentInter[] //收票附件
}

// 走款 类型
export interface goneTotalInter {
  id: number //ID
  incomeId: number | "" //进项编号（外键）
  employeeId: string //走款人员工编号
  employeeName: string //走款人员工姓名
  goneDateTime: string //走款时间
  money: number //走款金额
  note: string //备注
  version: number
}

// 收款 类型
export interface backTotallInter {
  id: number //ID
  incomeId: number | "" //进项编号（外键）
  employeeId: string //人员工编号
  employeeName: string //人员工姓名
  backDateTime: string //时间
  money: number //金额
  note: string //备注
  version: number
}
// 走款 表单 类型
export interface goneTotalFormInter {
  incomeId: number | "" //进项编号（外键）
  employeeId: string //人员工编号
  goneDateTime: string //时间
  money: number //金额
  note: string //备注
  attachments: AttachmentInter[] //收票附件
}

// 收款 表单 类型
export interface backTotallFormInter {
  incomeId: number | "" //进项编号（外键）
  employeeId: string //人员工编号
  backDateTime: string //时间
  money: number //金额
  note: string //备注
  attachments: AttachmentInter[] //收票附件
}
//对接人
export interface employeeIdListInter {
  id: number
  name: string
}

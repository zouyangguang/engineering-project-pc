/* 销项管理 - 类型声明 */
//附件 类型
export interface AttachmentInter {
  orderNumber: number //顺序号
  name: string //名称
  type: string //类型
  url: string //地址
  note: string //备注
  size: number //文件大小
}

//开票历史 类型
export interface outgoHistoryInter {
  id: number //开票历史id
  contractId: string //合同编号
  dutyRate: number //税率
  projectId: string //项目编号
  projectName: string //项目名称
  outputDateTime: string //开票日期
  taxAmount: number //含税金额
  tax: number //税额
  totalProceeds: number //累计收款
  proceedsPercent: number //收款占比
  totalGone: number //累计走款
  gonePercent: number //走款占比
  note: string //备注
  version: number //
}

//开票详细 类型
export interface outgoInter {
  id: number //
  contractId: string //合同编号
  dutyRate: number //税率
  projectId: string //项目id
  projectName: string //项目名称
  taxAmount: number //含税金额
  tax: number //税额
  outputDateTime: string //开票日期
  totalProceeds: number //累计收款
  totalGone: number //累计回款
  partACompanyName: string //甲方公司名称
  partBCompanyName: string //乙方公司名称
  customerManagerId: number | null //客户经理ID
  customerManagerName: string //客户经理名称
  money: number //合同金额
  amount: number //结算金额
  proceedsPercent: number //回款占比
  gonePercent: number //走款占比
  attachments: AttachmentInter[] //附件列表
  note: string //备注
  version: number
}
// 开票表单 类型
export interface outgoFormInter {
  projectId: string //项目id
  taxAmount: number //含税金额
  dutyRate: number //税率
  outputDateTime: string //开票日期
  attachments: AttachmentInter[] //附件列表
  note: string //备注
}

//走款类型
export interface goneInter {
  id: number //ID
  outputId: number //销项ID
  goneDateTime: string //走款时间
  money: number //走款金额
  personOrCompanyName: string //走款人/单位名称
  personOrCompanyPhone: string //走款人/单位电话
  idCardOrCreditCode: string //走款人身份证/单位信用代码
  bank: string //走款银行支行
  isCompany: number // 是否是公司
  account: string //银行账号
  note: string //备注
  version: number //
}
//走款表单 类型
export interface goneFormInter {
  outputId: number //销项ID
  goneDateTime: string //走款时间
  money: number //走款金额
  personOrCompanyName: string //走款人/单位名称
  personOrCompanyPhone: string //走款人/单位电话
  idCardOrCreditCode: string //走款人身份证/单位信用代码
  bank: string //走款银行支行
  isCompany: number // 是否是公司
  account: string //银行账号
  note: string //备注
  attachments: AttachmentInter[] //附件列表
}
//收款
export interface proceedsInter {
  id: number //ID
  outputId: number //销项ID
  money: number //收款金额
  taxFee: number //收回税费
  manageFee: number //收回管理费
  personalTaxFee: number //收回个税
  proceedsDateTime: string //收款时间
  note: string //备注
  attachments: AttachmentInter[] //附件列表
  version: number //
}
//收款表单 类型
export interface proceedsFormInter {
  outputId: number //销项ID
  money: number //收款金额
  taxFee: number //收回税费
  manageFee: number //收回管理费
  personalTaxFee: number //收回个税
  proceedsDateTime: string //收款时间
  note: string //备注
  attachments: AttachmentInter[] //附件列表
}

/* 业务总览 - 类型声明 */

// 合同总览查询表单
export interface SearchFormInter {
  projectName?: string // 项目名称
  contractId?: string // 合同编号
  customerManagerName?: string // 客户经理名称
  page?: number // 当前页数
  size?: number // 每页显示条数
  ids?: string // 项目ID
}

// 合同总览列表
export interface TableInter {
  contractId: string // 合同ID
  projectId: string // 项目ID
  projectName: string // 所属项目
  selfCustomer: string // 自营客户
  projectTypeName: string // 项目类型
  money: number // 合同金额
  dutyRate: number // 合同税率
  sumProceedsMoney: number // 回款金额
  backPercent: number // 回款占比
  notInvoicedMoney: number // 未开票金额
  signDateTime: string // 签约日期
}

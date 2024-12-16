/* 合同总览 - 类型声明 */

// 合同总览查询表单
export interface SearchFormInter {
  typeId?: number | null // 合同类型
  signDate?: string[] // 签约时间（组件）
  startBidDateTime?: string | null // 签约开始时间（接口）
  endBidDateTime?: string | null // 签约结束时间（接口）
  name?: string // 合同名称
  projectName?: string // 项目名称
  customerManagerName?: string // 客户经理名称
  page?: number // 当前页数
  size?: number // 每页显示条数
  ids?: string // 项目ID
}

// 合同总览列表
export interface TableInter {
  id: String // 合同ID
  projectName: String // 所属项目名称
  typeId: Number // 合同类型
  typeName: Number // 合同类型名称
  name: String // 合同名称
  money: Number // 合同金额
  amount: Number // 结算金额
  selfCustomer: String // 自营/客户
  partACompanyName: String //甲方公司名称
  partBCompanyName: String //乙方公司名称
  signDateTime: String // 签约时间
  startDateTime: String // 开工时间
  finishDateTime: String // 竣工时间
  managementFeePointsType: Number // 管理费类型【0金额，1费率，2金额+费率】
  managementFeeMoney: Number // 管理费金额
  managementFeePercent: Number // 管理费率
  customerManagerName: String //客户经理名称
  qualityGuarantee: String // 质保信息
  note: String //备注
}

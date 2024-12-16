/* 项目合同 - 类型声明 */

// 合同表单
export interface ContractFormInter {
  id?: number // ID
  projectId?: string // 项目ID
  typeId: number | null // 合同类型
  name: string // 合同名称
  selfCustomer: string // 自营/客户
  partACompanyName: string // 甲方公司名称
  partBCompanyName: string // 乙方公司名称
  money: number // 合同金额
  managementFeePointsType: number // 管理费类型【0金额，1费率，2金额+费率】
  managementFeeMoney: number // 管理费金额
  managementFeePercent: number // 管理费率
  signDateTime: string // 签约时间
  startDateTime: string // 开工时间
  finishDateTime: string // 竣工时间
  customerManagerId: number | null // 客户经理ID
  qualityGuarantee: string // 质保信息
  note: string // 备注
  attachments: FileInter[] // 文件列表
  addOrSub: InDecreaseInter[] // 增项、减项
  version?: number // 版本号
}

// 合同文件列表
export interface FileInter {
  orderNumber?: number // 文件ID
  name: string // 文件名
  type: string // 文件类型
  size: string | undefined // 文件大小
  url: string // 文件地址
  note: string // 备注
}

// 合同增项、减项列表
export interface InDecreaseInter {
  type: number // 类型【1增项，0减项】
  money: number // 金额
  note: string // 备注
}

/**合同 类型*/
export interface ContractInter {
  id: String //ID
  projectId: String //项目ID
  projectName: String //项目名称
  name: String //合同名称
  signDateTime: String //签约时间
  typeId: Number //类型编号
  typeName: String //类型名称
  money: Number //合同金额
  amount: Number //结算金额
  selfCustomer: String //自营/客户
  managementFeePointsType: Number //管理费点数类型 1：固定金额 2：百分比 3：既有固定值也有百分比
  managementFeePointsTypeName: String //管理费点数类型名称
  managementFeePercent: Number //管理费百分比
  managementFeeMoney: Number //管理费金额
  partACompanyName: String //甲方公司名称
  partBCompanyName: String //乙方公司名称
  customerManagerId: number | null //客户经理ID
  customerManagerName: String //客户经理名称
  startDateTime: String //开工时间
  finishDateTime: String //竣工时间
  qualityGuarantee: String //质保信息
  note: String //备注
}

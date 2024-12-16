/* 项目列表、概要 - 类型声明 */

// 项目列表
export interface TableInter {
  id: string // 项目ID
  name: string // 项目名称
  typeId: number // 项目类别ID
  typeName: string // 项目类别文本
  proposerId: number // 立项人ID
  proposerName: string // 立项人姓名
  principalName: string // 负责人姓名
  expectFinishDateTime: string //预期结项时间
  note: string // 备注
  version: number // 版本号

  progress: number // 项目进度
  status: number // 项目状态【0准备中 1进行中 2已完成 3已废弃】
  statusName: string // 项目状态文本
  isFieldProject: 0 | 1 // 是否异地项目【0本地 1异地】
  isFieldProjectName: string // 是否异地项目文本
  isSigned: 0 | 1 // 是否已签约【0待签约 1已签约】
  isSignedName: string // 是否已签约文本
  isPrepay: 0 | 1 // 是否已预缴【0待预缴 1已预缴】
  isPrepayName: string // 是否已预缴文本
  hasReceivingReport: 0 | 1 // 是否拥有结项报告【1拥有 0未拥有】
  hasReceivingReportName: string // 是否拥有结项报告文本

  amount: number // 结算金额【合同金额(含增减项)】
  sumConstructionReturn: number // 回款合计
}

// 项目详情
export interface ProjectInter {
  id: string // 项目ID
  name: string // 项目名称
  typeId: number // 项目类别ID
  typeName: string // 项目类别文本
  proposerId: number // 立项人ID
  proposerName: string // 立项人姓名
  principalId: number // 负责人ID
  principalName: string // 负责人姓名
  expectFinishDateTime: string //预期结项时间
  contractStartDateTime: string // 合同开工时间
  contractFinishDateTime: string // 合同竣工时间
  note: string // 备注
  memberNames: string // 项目成员（逗号分隔）
  version: number // 版本号

  progress: number // 项目进度
  status: number // 项目状态【0准备中 1进行中 2已完成 3已废弃】
  statusName: string // 项目状态文本
  isFieldProject: 0 | 1 // 是否异地项目【0本地 1异地】
  isFieldProjectName: string // 是否异地项目文本
  isBid: 0 | 1 // 是否已中标【0待中标 1已中标】
  isSigned: 0 | 1 // 是否已签约【0待签约 1已签约】
  isSignedName: string // 是否已签约文本
  isPrepay: 0 | 1 // 是否已预缴【0待预缴 1已预缴】
  isPrepayName: string // 是否已预缴文本
  hasReceivingReport: 0 | 1 // 是否拥有结项报告【1拥有 0未拥有】
  hasReceivingReportName: string // 是否拥有结项报告文本

  money: number // 合同金额
  amount: number // 结算金额【合同金额(含增减项)】

  sumPrepay: number // 累计预缴税
  sumGlobalTax: number // 累计纳税总额
  sumPersonalTax: number // 累计个税金额
  sumPersonalTaxFee: number // 累计收回个税金额
  sumManageFee: number // 累计收回管理费金额

  sumIncomeTaxAmount: number // 进项 - 累计含税金额
  sumIncomeGoneTotal: number // 进项 - 累计走款金额
  sumIncomeBackTotal: number // 进项 - 累计回款金额

  isOverdue: 0 | 1 // 销项 - 是否超期【0未超期 1已超期】
  sumTaxAmount: number // 销项 - 累计开票金额
  notInvoicedMoney: number // 销项 - 未开票金额
  sumTax: number // 销项 - 累计开票税额
  sumTaxFee: number // 销项 - 累计收回税额
  sumGoneMoney: number // 销项 - 累计走款金额
  sumProceedsMoney: number // 销项 - 累计收款金额

  sumConstructionReturn: number // 累计工程回款
  sumConstructionImpl: number // 累计工程实施成本
}

// 项目列表查询表单
export interface SearchFormInter {
  status: number | null //项目状态【0准备中 1进行中 2已完成 3已废弃】
  isFieldProject: number | null // 是否异地项目【0本地 1异地】
  isSigned: number | null // 是否已签约【0待签约 1已签约】
  nature: number | "" // 自营/挂靠【0工程自营 1劳务挂靠 2工程挂靠】
  typeId: number | null // 项目类别ID
  name: string // 项目名称
  principalName: string // 负责人姓名
  proposerName: string // 立项人姓名
}

// 项目立项表单
export interface DialogFormInter {
  name: string // 项目名称
  typeId: number | null // 项目类别编号
  typeId2?: 0 | 1 // 自营/挂靠【0自营 1挂靠】（组件）
  nature?: number | "" // 自营/挂靠【0工程自营 1劳务挂靠 2工程挂靠】（接口）
  principalId: string // 负责人ID
  expectFinishDateTime: string // 预期结项时间
  isFieldProject: number // 是否异地项目
  members: Array<string> // 项目成员员工ID数组
  note: string // 备注
}

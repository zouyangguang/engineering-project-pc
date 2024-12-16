/* 招投标总览 - 类型声明 */

// 招投标查询表单
export interface SearchFormInter {
  status?: number | null // 投标状态【0投标中 1已中标 2未中标 3已撤标 4无需投标】
  bidPattern?: number | null // 招标模式
  projectType?: number | null // 项目类别
  bidDate?: string[] // 投标日期（组件）
  startBidDateTime?: string | null // 投标开始时间（接口）
  endBidDateTime?: string | null // 投标结束时间（接口）
  projectName?: string // 项目名称
  page?: number // 当前页数
  size?: number // 每页显示条数
  ids?: string // 项目ID
}

// 招投标总览列表
export interface TableInter {
  id: number // 招投标ID
  status: number // 投标状态【0投标中 1已中标 2未中标 3已撤标 4无需投标】
  statusName: number // 投标状态名称
  projectName: string // 所属项目
  projectTypeName: string // 项目类别名称
  patternName: string // 招标模式
  customBidType: string // 项目细则
  contractApproachId: number // 承包方式
  contractApproachName: string // 承包方式名称
  bidDateTime: string // 投标日期
  tenderDateTime: string // 招标日期
  constructionUnits: string // 施工单位
  projectAddress: string // 项目地址
  companyPersonalName: string // 个人/公司名称
  bidMoney: number // 投标金额
  area: string // 建筑/套内面积
  note: string // 备注
}

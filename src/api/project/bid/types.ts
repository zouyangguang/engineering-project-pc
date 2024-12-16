/* 项目合同 - 类型声明 */

// 招投标表单
export interface BidFormInter {
  id?: number // ID
  projectId?: string // 项目ID
  status: number // 投标状态【0投标中 1已中标 2未中标 3已撤标 4无需投标】
  patternId: number | null // 招标模式
  contractApproachId: number | null // 承包方式
  bidDateTime: string // 投标日期
  tenderDateTime: string // 招标日期
  customBidType: string // 项目细则
  companyPersonalName: string // 公司/私人名称
  constructionUnits: string // 施工单位
  projectAddress: string // 项目地址
  bidMoney: number // 投标金额
  area: number // 建筑/套内面积
  note: string // 备注
  attachments: FileInter[] // 文件列表
  version?: number // 版本号
}

// 招投标文件列表
export interface FileInter {
  orderNumber?: number // 文件ID
  name: string // 文件名
  type: string // 文件类型
  size: number | undefined // 文件大小
  url: string // 文件地址
  note: string // 备注
}

/**投标信息 类型*/
export interface ProjectBidInter {
  id: number //招投标的ID
  projectId: string //项目的ID
  projectName: string //项目的名称
  patternId: number | null //招投标模式ID
  patternName: string //招投标模式名称
  tenderDateTime: string //招标日期
  bidDateTime: string //投标的时间
  constructionUnits: string //施工单位
  projectAddress: string //项目地址
  customBidType: string | null //项目细则
  area: number //建筑/套内面积
  bidMoney: number //投标金额
  contractApproachId: number | null //承包方式编号
  contractApproachName: string | null //承包方式名称
  companyPersonalName: string //个人/公司名称
  status: number //状态 【0投标中 1已中标 2未中标 3已撤标 4无需投标】
  statusName: string //状态名称
  note: string //备注
}

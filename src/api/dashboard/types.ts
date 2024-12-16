/* 控制台 - 类型声明 */

// 工程月历列表
export interface MonthlyListInter {
  title: string // 标题(年-月)
  children: MonthlyProjectInter[] // 项目数据
}

// 工程月历 - 项目数据
export interface MonthlyProjectInter {
  projectId: number // 项目iD
  projectName: string // 项目名称
  status: number // 项目状态【0准备中 1进行中 2已完成 3已废弃】
  currMonthMoney: number // 本月收款合计
  sumMoney: number // 累计收款合计
  amount: number // 合同结算金额
  createDateTime: string // 立项时间
  progress: number // 当前进度
}

// 需要注意的工程列表
export interface AttentionProjectInter {
  projectId: number // 项目iD
  projectName: string // 项目名称
  expectFinishDateTime: string // 预期截止时间
  progress: number // 当前进度
  type: number // 进度类型【0已超期 1已临近 2无进度】
}

// 计划与实际
export interface PlanAndActualInter {
  startDate: string // 开始统计时间
  totalProjectNum: number // 项目总数
  finishedProjectNum: number // 已完成项目数
  unFinishedProjectNum: number // 未完成项目数
  expectMoney: number // 预期收回款项
  actualMoney: number // 实际收回款项
}

// 平均月度收回款项
export interface AverageMonthlyInter {
  month: string // 月份
  finishMoney: number // 每月收回款项
}

// 最赚钱的项目TOP5
export interface RankingInter {
  projectId: number // 项目ID
  projectName: string // 项目名称
  amount: number // 收款金额
}

/* 部门管理 - 类型声明 */

// 部门列表
export interface TableInter {
  id: number //部门ID
  parentId: number // 父ID
  name: string // 部门名称
  managers: string // 部门负责人（如果有）
  level: number // 部门层级
  note: string // 备注
  children: TableInter // 子部门
}

// 部门表单
export interface DeptFormInter {
  id?: number // 部门ID
  name: string // 部门名称
  parentId: number | any // 父级部门ID
  note: string // 备注
  version?: number // 版本号
}

// 迁移部门表单
export interface transferDeptFormInter {
  id: number // 当前部门ID
  newId?: number | any // 迁移部门ID
}

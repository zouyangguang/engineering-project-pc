/* 员工管理 - 类型声明 */

// 查询表单
export interface SearchFormInter {
  name?: string | null // 员工姓名
  departId?: number | null // 部门ID
  roleId?: number | null // 岗位ID
  entryDate?: string[] | null // 入职时间范围（组件）
  startEntryDateTime?: string | null // 入职开始时间（接口）
  endEntryDateTime?: string | null // 入职结束时间（接口）
  page?: number // 当前页数
  size?: number // 每页显示条数
}

// 员工列表
export interface TableInter {
  id: number //序号
  name: string //姓名
  number: number //工号
  phone: string //电话号码;
  idCard: string //身份证号码
  departId: number //部门编号
  departName: string //部门名称
  isManager: number //是否部门主管
  isManagerName: string //是否部门主管(中文)
  entryDateTime: string //入职时间
  leaveDateTime: string //离职时间
  note: string //备注
  roles: string //岗位
}

// 员工表单
export interface StaffFormInter {
  id?: number // 员工id
  isManager: 0 | 1 // 是否部门主管
  name: string // 员工姓名
  phone: string // 手机号
  idCard?: string // 身份证
  entryDateTime: string // 入职时间
  departId: number | null // 所属部门ID
  roles: Array<number> // 所属岗位ID
  note: string // 备注
  version?: number // 版本号
}

// 工作交接表单
export interface HandoverFormInter {
  sourceEmployeeId: number | null | undefined // 当前员工ID
  targetEmployeeId: number | null // 交接员工ID
}

// 迁移员工至新部门表单
export interface transferFormInter {
  destDepartId: number | null // 新部门ID
  employees: Array<number> | null // 员工ID
}

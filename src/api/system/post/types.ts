/* 岗位管理 - 类型声明 */

// 岗位列表
export interface TableInter {
  id: number // 岗位id
  name: string // 岗位名称
  note: string // 备注
}

// 岗位表单
export interface RoleFormInter {
  id?: number // 岗位id
  name: string // 岗位名称
  note: string // 备注
  modulePermissions: Array<modulePermissionsInter> // 模块权限列表
  dataPermissions: Array<dataPermissionsInter> // 数据权限列表
  version?: number // 版本号
}

// 模块权限类型
export interface modulePermissionsInter {
  moduleId: string // 模块ID
  c: number // 新增
  d: number // 删除
  u: number // 更新
  r: number // 查询
  e: number // 导出
}

// 数据权限类型
export interface dataPermissionsInter {
  departId: number // 部门编号
  note: string // 备注
}

// 页面权限列表
export interface ModuleListInter {
  id: number
  parentId: number
  isLeaf: number
  code: string
  name: string
  path: string
  allowPermission: Array<string>
  depends: Array<string>
  children: Array<ModuleListInter>
}

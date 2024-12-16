/* 权限 - 类型声明 */

// 登录表单
export interface LoginInter {
  number: string // 工号
  password: string // 密码
}

// 修改密码表单
export interface updatePwdFormInter {
  oldPassword: string // 旧密码
  newPassword: string // 新密码
  againNewPwd: string // 确认新密码
}

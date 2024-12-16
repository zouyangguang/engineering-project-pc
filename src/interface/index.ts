/* 全局接口 */

// 路由接口
export interface RouteInter {
  path: string // 路由路径
  name: string // 路由名称
  redirect?: string // 重定向
  component: any // 组件
  children?: RouteInter[] // 子路由
  meta: {
    // 路由元信息
    title: string // 标题
    icon?: string // 图标
    isAlive?: number // 是否缓存页面【0不缓存 1缓存】
  }
}

// 表单自定义验证
export interface validateInter {
  (rule: any, value: any, callback: any): void
}

// 分页
export interface PaginationInter {
  total: number //总条数
  current: number //当前页数
  pagesize: number //每页条数
}

// 类型选择
export interface AllTypesInter {
  id: number
  name: string
}

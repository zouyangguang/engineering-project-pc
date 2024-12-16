import { RouteRecordRaw } from "vue-router"
import Layout from "@/layout/index.vue"

// 静态路由
export const staticRouter: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: { title: "登录" }
  },
  {
    path: "/",
    component: Layout,
    redirect: "/dashboard",
    meta: { title: "控制台" },
    children: [
      {
        path: "/dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        meta: {
          title: "控制台",
          icon: "IconHomeTwo"
        }
      },
      {
        path: "/notice",
        name: "Notice",
        component: () => import("@/views/system/staff/index.vue"),
        meta: { title: "消息通知" }
      },
      {
        path: "/download",
        name: "Download",
        component: () => import("@/views/download/index.vue"),
        meta: { title: "下载中心", code: "task" }
      }
    ]
  }
]

// 菜单路由
export const menuRouter: RouteRecordRaw[] = [
  {
    path: "/basic",
    name: "Basic",
    component: Layout,
    redirect: "/basic/staff",
    meta: { title: "基础管理" },
    children: [
      {
        path: "/basic/staff",
        name: "Staff",
        component: () => import("@/views/system/staff/index.vue"),
        meta: {
          title: "员工管理",
          icon: "IconPeoples",
          code: "employee"
        }
      },
      {
        path: "/basic/dept",
        name: "Dept",
        component: () => import("@/views/system/dept/index.vue"),
        meta: {
          title: "部门管理",
          icon: "IconBranchOne",
          code: "depart"
        }
      },
      {
        path: "/basic/post",
        name: "Post",
        component: () => import("@/views/system/post/index.vue"),
        meta: {
          title: "岗位管理",
          icon: "IconNecktie",
          code: "role"
        }
      }
    ]
  },
  {
    path: "/project",
    name: "Project",
    component: Layout,
    redirect: "/project/list",
    meta: { title: "项目管理" },
    children: [
      {
        path: "/project/list",
        name: "ProjectList",
        component: () => import("@/views/project/index.vue"),
        meta: {
          title: "项目列表",
          icon: "IconDocumentFolder",
          code: "info"
        }
      },
      {
        path: "/project/detail",
        name: "ProjectDetail",
        component: () => import("@/views/project/detail.vue"),
        redirect: "/project/detail/info",
        meta: {
          title: "项目详情",
          isHide: true
        },
        children: [
          {
            path: "/project/detail/info",
            name: "ProjectInfo",
            component: () => import("@/views/project/info/index.vue"),
            meta: {
              title: "项目概要",
              code: "info"
            }
          },
          {
            path: "/project/detail/bid",
            name: "ProjectBid",
            component: () => import("@/views/project/bid/index.vue"),
            meta: {
              title: "招投标",
              code: "bid"
            }
          },
          {
            path: "/project/detail/contract",
            name: "ProjectContract",
            component: () => import("@/views/project/contract/index.vue"),
            meta: {
              title: "中标 / 签订合同",
              code: "contract"
            }
          },
          {
            path: "/project/detail/collect",
            name: "ProjectCollect",
            component: () => import("@/views/project/collect/index.vue"),
            meta: {
              title: "甲方回款",
              code: "constructionReturned"
            }
          },
          {
            path: "/project/detail/execute",
            name: "ProjectExecute",
            component: () => import("@/views/project/execute/index.vue"),
            meta: {
              title: "工程实施",
              code: "constructionImpl"
            }
          },
          {
            path: "/project/detail/income",
            name: "ProjectIncome",
            component: () => import("@/views/project/income/index.vue"),
            meta: {
              title: "进项管理",
              code: "incomeBase"
            }
          },
          {
            path: "/project/detail/outgo",
            name: "ProjectOutgo",
            component: () => import("@/views/project/outgo/index.vue"),
            meta: {
              title: "销项管理",
              code: "outputBase"
            }
          },
          {
            path: "/project/detail/tax",
            name: "ProjectTax",
            component: () => import("@/views/project/tax/index.vue"),
            meta: {
              title: "缴税管理",
              code: "tax"
            }
          }
        ]
      }
    ]
  },
  {
    path: "/overview",
    name: "OverView",
    component: Layout,
    redirect: "/overview/bid",
    meta: { title: "项目报表" },
    children: [
      {
        path: "/overview/bid",
        name: "OverviewBid",
        component: () => import("@/views/overview/bid/index.vue"),
        meta: {
          title: "招投标总览",
          icon: "IconAgreement",
          code: "bidReport"
        }
      },
      {
        path: "/overview/contract",
        name: "OverviewContract",
        component: () => import("@/views/overview/contract/index.vue"),
        meta: {
          title: "合同总览",
          icon: "IconGavel",
          code: "contractReport"
        }
      },
      {
        path: "/overview/performance",
        name: "OverviewPerformance",
        component: () => import("@/views/overview/performance/index.vue"),
        meta: {
          title: "业绩总览",
          icon: "IconTrendTwo",
          code: "performanceReport"
        }
      },
      {
        path: "/overview/file",
        name: "OverviewFile",
        component: () => import("@/views/overview/file/index.vue"),
        meta: {
          title: "附件总览",
          icon: "IconLink",
          code: "attachmentReport"
        }
      }
    ]
  },
  {
    path: "/system",
    name: "System",
    component: Layout,
    redirect: "/system/logs",
    meta: { title: "系统日志" },
    children: [
      {
        path: "/system/logs",
        name: "Logs",
        component: () => import("@/views/logs/index.vue"),
        meta: {
          title: "操作日志",
          icon: "IconEditOne",
          code: "log"
        }
      }
    ]
  }
]

// 报错页面路由
export const errorRouter: RouteRecordRaw[] = [
  {
    path: "/403",
    name: "403",
    component: () => import("@/views/error/403.vue"),
    meta: { title: "无权限访问" }
  },
  {
    path: "/:pathMatch(.*)*",
    name: "404",
    component: () => import("@/views/error/404.vue"),
    meta: { title: "页面不存在" }
  }
]

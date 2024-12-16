import { ref, onMounted } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import type { AttentionProjectInter } from "@/api/dashboard/types.ts"
import * as DashboardAPI from "@/api/dashboard/index.ts"
import * as ProjectAPI from "@/api/project/default/index.ts"

export const useAttention = () => {
  //【实例】延缓项目 - 对话框
  const delayRef = ref()
  //【变量】页面状态 - 加载中
  const AttentionLoading = ref<Boolean>(false)

  //【变量】需要注意的工程列表
  const attentionList = ref<InstanceType<typeof AttentionProjectInter>[]>([])
  //【方法】获取需要注意的工程
  const getAttentionList = () => {
    DashboardAPI.getAttentionList().then((res: any) => {
      attentionList.value = res.data.data
    })
  }

  //【方法】延缓项目
  const delayProject = (id: string) => {
    delayRef.value.showDialog = true
    delayRef.value.projectId = id
  }

  //【方法】废弃项目
  const discardProject = (id: string) => {
    ElMessageBox.confirm("此操作将永久废弃该项目，请谨慎操作！", "提示", {
      type: "warning",
      confirmButtonText: "确认废弃"
    }).then(() => {
      ProjectAPI.discardProjec(id).then(() => {
        ElMessage.success("项目已废弃")
        getAttentionList()
      })
    })
  }

  // 【生命周期】挂载后
  onMounted(() => {
    getAttentionList()
  })

  return { AttentionLoading, attentionList, delayRef, getAttentionList, delayProject, discardProject }
}

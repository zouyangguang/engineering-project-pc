// 项目概要 接口
import request from "@/utils/request.ts"
import useProjectStore from "../../../stores/modules/project.ts"

//立项：查询项目组成员
export const getMembers = (id: string) => {
  return request({
    method: "get",
    url: "/project/info/getMembers",
    params: { projectId: id }
  })
}
// 立项：修改项目组成员
export const updateMember = (data: any) => {
  return request({
    method: "put",
    url: "/project/info/updateMember",
    data
  }).then(() => {
    // 更新项目信息
    const projectStore = useProjectStore()
    projectStore.getProjectInfo()
  })
}

// 立项：导出项目附件
export const exportAttachments = (id: string, alias: string) => {
  return request({
    method: "get",
    url: "/project/info/exportAttachments",
    params: {
      projectId: id,
      alias
    }
  })
}

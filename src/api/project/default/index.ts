/* 项目列表、概要 - 接口 */
import request from "@/utils/request.ts"
import useProjectStore from "../../../stores/modules/project.ts"

// 立项：依据条件查询立项信息列表
export const getProjectList = (params: any) => {
  return request({
    method: "get",
    url: "/project/info/getCondition",
    params
  })
}

//立项：查询所有的项目类别
export const getAllTypes = () => {
  return request({
    method: "get",
    url: "/project/info/getAllTypes"
  })
}
//立项：添加立项信息 项目立项
export const addProject = (data: any) => {
  return request({
    method: "post",
    url: "/project/info/add",
    data
  })
}

//立项：依据ID查询立项信息 详细
export const getOne = (id: string) => {
  return request({
    method: "get",
    url: "/project/info/getOne",
    params: { id: id }
  })
}
//立项：修改立项信息
export const updateProjec = (data: any) => {
  return request({
    method: "PUT",
    url: "/project/info/update",
    data
  }).then(() => {
    // 更新项目信息
    const projectStore = useProjectStore()
    projectStore.getProjectInfo()
  })
}

//立项：废弃立项信息
export const discardProjec = (id: string) => {
  return request({
    method: "PUT",
    url: "/project/info/updateToDiscard",
    params: { id: id }
  })
}

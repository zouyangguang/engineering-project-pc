/* 项目合同 - 接口 */
import request from "@/utils/request.ts"
import useProjectStore from "../../../stores/modules/project.ts"

// 根据合同ID，获取合同详情
export const getContractDetailOne = (id: any) => {
  return request({
    method: "get",
    url: "/project/contract/getOne",
    params: { id }
  })
}

// 根据项目ID，获取合同详情
export const getContractDetailTwo = (projectId: any) => {
  return request({
    method: "get",
    url: "/project/contract/getOneByProjectId",
    params: { projectId }
  })
}

// 获取合同类型
export const getContractType = () => {
  return request({
    method: "get",
    url: "/project/contract/getAllTypes"
  })
}

// 添加合同信息
export const addContract = (data: any) => {
  return request({
    method: "post",
    url: "/project/contract/add",
    data
  }).then(() => {
    // 更新项目信息
    const projectStore = useProjectStore()
    projectStore.getProjectInfo()
  })
}

// 修改合同信息
export const updateContract = (data: any) => {
  return request({
    method: "put",
    url: "/project/contract/update",
    data
  }).then(() => {
    // 更新项目信息
    const projectStore = useProjectStore()
    projectStore.getProjectInfo()
  })
}

// 下载合同附件
export const downloadContractFile = (path: string, name: string) => {
  return request({
    method: "get",
    responseType: "blob",
    url: "/project/contract/download/" + path,
    params: { name }
  })
}

/* 项目招投标 - 接口 */
import request from "@/utils/request.ts"
import useProjectStore from "../../../stores/modules/project.ts"

// 根据招投标ID，获取招投标详情
export const getBidDetailOne = (id: any) => {
  return request({
    method: "get",
    url: "/project/bid/getOne",
    params: { id }
  })
}

// 根据项目ID，获取招投标详情
export const getBidDetailTwo = (projectId: any) => {
  return request({
    method: "get",
    url: "/project/bid/getOneByProjectId",
    params: { projectId }
  })
}

// 获取招标模式
export const getPatternList = () => {
  return request({
    method: "get",
    url: "/project/bid/getPatterns"
  })
}

// 获取承包方式
export const getContractList = () => {
  return request({
    method: "get",
    url: "/project/bid/getContractApproaches"
  })
}

// 添加招投标信息
export const addBid = (data: any) => {
  return request({
    method: "post",
    url: "/project/bid/add",
    data
  }).then(() => {
    // 更新项目信息
    const projectStore = useProjectStore()
    projectStore.getProjectInfo()
  })
}

// 修改招投标信息
export const updateBid = (data: any) => {
  return request({
    method: "put",
    url: "/project/bid/update",
    data
  }).then(() => {
    // 更新项目信息
    const projectStore = useProjectStore()
    projectStore.getProjectInfo()
  })
}

// 下载招投标附件
export const downloadBidFile = (path: string, name: string) => {
  return request({
    method: "get",
    responseType: "blob",
    url: "/project/bid/download/" + path,
    params: { name }
  })
}

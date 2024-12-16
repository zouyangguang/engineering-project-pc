//销项管理
import request from "@/utils/request.ts"
/**开票 */
//开票：依据项目ID查询开票信息 开票历史列表
export const getByProjectId = (params: any) => {
  return request({
    method: "get",
    url: "/project/output/outputBase/getByProjectId",
    params
  })
}

//开票：依据ID查询开票详情
export const getOutputBaseDetail = (id: string) => {
  return request({
    method: "get",
    url: "/project/output/outputBase/getOne",
    params: { id: id }
  })
}

//开票：添加开票信息
export const addOutputBase = (data: any) => {
  return request({
    method: "POST",
    url: "/project/output/outputBase/add",
    data
  })
}
// 下载文件 基本信息
export const download = (path: string, name: string) => {
  return request({
    method: "GET",
    responseType: "blob",
    url: "/project/output/outputBase/download/" + path,
    params: { name }
  })
}

//开票：修改开票信息
export const updateOutputBase = (data: any) => {
  return request({
    method: "PUT",
    url: "/project/output/outputBase/update",
    data
  })
}
//开票：删除开票信息
export const deleteOutputBase = (id: string) => {
  return request({
    method: "DELETE",
    url: "/project/output/outputBase/delete",
    params: { id: id }
  })
}

/**走款 */
//走款：依据开票ID查询走款信息 列表
export const getByOutputIdGone = (params: any) => {
  return request({
    method: "get",
    url: "/project/output/outputGone/getByOutputId",
    params
  })
}
//走款：添加走款信息
export const addOutputGone = (data: any) => {
  return request({
    method: "POST",
    url: "/project/output/outputGone/add",
    data
  })
}
// 下载文件 基本信息
export const downloadOutputGone = (path: string, name: string) => {
  return request({
    method: "GET",
    responseType: "blob",
    url: "/project/output/outputGone/download/" + path,
    params: { name }
  })
}
//走款：依据ID查询走款信息
export const getOneOutputGone = (id: string) => {
  return request({
    method: "get",
    url: "/project/output/outputGone/getOne",
    params: { id: id }
  })
}
//走款：修改走款信息
export const updateOutputGone = (data: any) => {
  return request({
    method: "PUT",
    url: "/project/output/outputGone/update",
    data
  })
}
//走款：删除走款信息
export const deleteOutputGone = (id: string) => {
  return request({
    method: "DELETE",
    url: "/project/output/outputGone/delete",
    params: { id: id }
  })
}

/**收款 */
//收款：依据开票ID查询收款信息列表
export const getByOutputIdProceeds = (params: any) => {
  return request({
    method: "get",
    url: "/project/output/outputProceeds/getByOutputId",
    params
  })
}

//收款：添加收款信息
export const addOutputProceeds = (data: any) => {
  return request({
    method: "POST",
    url: "/project/output/outputProceeds/add",
    data
  })
}
// 下载文件 基本信息
export const downloadOutputProceeds = (path: string, name: string) => {
  return request({
    method: "GET",
    responseType: "blob",
    url: "/project/output/outputProceeds/download/" + path,
    params: { name }
  })
}
//走款：依据ID查询走款信息
export const getOneOutputProceeds = (id: string) => {
  return request({
    method: "get",
    url: "/project/output/outputProceeds/getOne",
    params: { id: id }
  })
}
//走款：修改走款信息
export const updateOutputProceeds = (data: any) => {
  return request({
    method: "PUT",
    url: "/project/output/outputProceeds/update",
    data
  })
}
//收款：删除收款信息
export const deleteOutputProceeds = (id: string) => {
  return request({
    method: "DELETE",
    url: "/project/output/outputProceeds/delete",
    params: { id: id }
  })
}

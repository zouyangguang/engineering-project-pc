import { defineStore } from "pinia"
import { ref, computed } from "vue"
import * as ProjectAPI from "@/api/project/default/index.ts"
import * as BidAPI from "@/api/project/bid/index.ts"
import * as ContractAPI from "@/api/project/contract/index.ts"
import * as ExecuteSumAPI from "@/api/project/execute/index.ts"
import * as TaxAPI from "@/api/project/tax/index.ts"
import type { ProjectInter } from "@/api/project/default/types.ts"
import type { AllTypesInter } from "@/interface/index.ts"

export const useProjectStore = defineStore("project", () => {
  // 项目信息
  const info = ref<InstanceType<typeof ProjectInter>>({})
  // 项目类别列表
  const projectTypeList = ref<InstanceType<typeof AllTypesInter>[]>([])
  // 招标模式列表
  const bidPatternList = ref<InstanceType<typeof AllTypesInter>[]>([])
  // 承包方式列表
  const bidContractList = ref<InstanceType<typeof AllTypesInter>[]>([])
  // 合同类型列表
  const contractTypeList = ref<InstanceType<typeof AllTypesInter>[]>([])
  // 班组类型列表
  const teamTypeList = ref<InstanceType<typeof AllTypesInter>[]>([])
  // 纳税类型列表
  const taxTypeList = ref<InstanceType<typeof AllTypesInter>[]>([])

  // 是否获取到所有项目类型
  const isProjectTypeAll = computed(() => {
    return (
      projectTypeList.value.length > 0 &&
      bidPatternList.value.length > 0 &&
      bidContractList.value.length > 0 &&
      contractTypeList.value.length > 0 &&
      teamTypeList.value.length > 0 &&
      taxTypeList.value.length > 0
    )
  })

  // 获取项目详情
  function getProjectInfo() {
    return ProjectAPI.getOne(sessionStorage.projectId).then((res: any) => {
      info.value = res.data.data
    })
  }
  // 获取项目所有类型
  function getProjectTypeAll() {
    Promise.all([getProjectType(), getBidPattern(), getBidContract(), getContractType(), getTeamType(), getTaxType()]).finally(
      () => {
        console.log("获取成功")
      }
    )
  }

  // 获取项目类别
  function getProjectType() {
    return ProjectAPI.getAllTypes().then((res: any) => {
      projectTypeList.value = res.data.data
    })
  }

  // 获取招标模式
  function getBidPattern() {
    return BidAPI.getPatternList().then((res: any) => {
      bidPatternList.value = res.data.data
    })
  }

  // 获取承包方式
  function getBidContract() {
    return BidAPI.getContractList().then((res: any) => {
      bidContractList.value = res.data.data
    })
  }

  // 获取合同类型
  function getContractType() {
    return ContractAPI.getContractType().then((res: any) => {
      contractTypeList.value = res.data.data
    })
  }

  // 获取班组类型
  function getTeamType() {
    return ExecuteSumAPI.getTeamType().then((res: any) => {
      teamTypeList.value = res.data.data
    })
  }

  // 获取纳税类型
  function getTaxType() {
    return TaxAPI.getTypes().then((res: any) => {
      taxTypeList.value = res.data.data
    })
  }

  return {
    info,
    isProjectTypeAll,
    projectTypeList,
    bidPatternList,
    bidContractList,
    contractTypeList,
    teamTypeList,
    taxTypeList,
    getProjectInfo,
    getProjectTypeAll
  }
})

export default useProjectStore

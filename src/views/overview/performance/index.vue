<template>
  <div v-loading="viewLoading">
    <!-- 查询表单 -->
    <el-row class="card-bg search-page">
      <!-- 表单 -->
      <el-col :lg="21" :xl="22" class="search-form">
        <el-form ref="formRef" :model="formModel" label-width="auto" label-suffix="：">
          <el-row :gutter="20">
            <el-col :lg="8" :xl="6">
              <el-form-item label-width="0" prop="projectName">
                <el-input v-model="formModel.projectName" placeholder="项目名称查询" clearable>
                  <template #prefix>
                    <icon-search />
                  </template>
                </el-input>
              </el-form-item>
            </el-col>

            <el-col :lg="8" :xl="6">
              <el-form-item label-width="0" prop="contractId">
                <el-input v-model="formModel.contractId" placeholder="合同编号查询" clearable>
                  <template #prefix>
                    <icon-search />
                  </template>
                </el-input>
              </el-form-item>
            </el-col>

            <el-col :lg="8" :xl="6">
              <el-form-item label-width="0" prop="customerManagerName">
                <el-input v-model="formModel.customerManagerName" placeholder="客户经理名称查询" clearable>
                  <template #prefix>
                    <icon-search />
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-col>

      <!-- 按钮 -->
      <el-col :lg="3" :xl="2" class="search-btn">
        <el-button type="primary" :loading="searchLoading" @click="searchForm"> <icon-search />查询 </el-button>
        <el-button color="#EEF2F6" @click="resetForm"> <icon-undo />重置 </el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <div class="card-bg table-page">
      <div v-if="btnList.isExport" class="table-page-header">
        <el-button v-if="!chooseData.length" type="primary" @click="exportAllData">
          <icon-efferent-three />导出全部业绩
        </el-button>
        <el-button v-else type="primary" @click="exportChooseData"><icon-efferent-three />导出选中业绩</el-button>
      </div>

      <el-table ref="tableRef" :data="tableData" row-key="projectId" @selection-change="selectionChange">
        <!-- 多选 -->
        <el-table-column type="selection" width="50" align="center" :reserve-selection="true" />

        <!-- 表格内容 -->
        <el-table-column
          v-for="(item, i) in columns"
          :key="i"
          :label="item.label"
          :prop="item.prop"
          :width="item.width"
          :min-width="item.minWidth"
          :align="item.align"
          :fixed="item.fixed"
          show-overflow-tooltip>
          <template #default="scope">
            <!-- 合同信息 -->
            <div v-if="item.prop == 'info'">
              <p>所属项目：{{ scope.row.projectName }}</p>
              <p>合同编码：{{ scope.row.contractId }}</p>
              <p>签约时间：{{ dateFormat(scope.row.signDateTime || "") }}</p>
              <p>客户经理：{{ scope.row.customerManagerName }}</p>
            </div>

            <!-- 金额格式 -->
            <div v-if="item.prop == 'money' || item.prop == 'sumProceedsMoney' || item.prop == 'notInvoicedMoney'">
              ￥{{ scope.row[item.prop] || 0 }}
            </div>

            <!-- 百分比格式 -->
            <div v-else-if="item.prop == 'dutyRate' || item.prop == 'backPercent'">{{ scope.row[item.prop] || 0 }}</div>

            <!-- 操作 -->
            <!-- <div v-if="item.prop == 'button'" class="table-btn">
              <el-link type="primary" :underline="false">查看详情</el-link>
            </div> -->
          </template>
        </el-table-column>
      </el-table>

      <Pagination
        v-model:total="tablePage.total"
        v-model:current="tablePage.current"
        v-model:pagesize="tablePage.pagesize"
        class="table-page-pagination"
        @change="getData()" />
    </div>
  </div>
</template>

<script setup lang="ts" name="OverviewPerformance">
  import { ref, onMounted } from "vue"
  import { ElMessage, ElMessageBox } from "element-plus"
  import type { FormInstance } from "element-plus"
  import type { SearchFormInter, TableInter } from "@/api/overview/performance/types.ts"
  import Pagination from "@/components/Pagination/index.vue"
  import * as PerformanceReportAPI from "@/api/overview/performance/index.ts"
  import { dateFormat } from "@/utils/handle.ts"
  import useAuthStore from "@/stores/modules/auth.ts"

  //【变量】页面状态【加载中】
  const viewLoading = ref<Boolean>(false)
  //【变量】查询按钮【加载中】
  const searchLoading = ref<Boolean>(false)
  //【变量】按钮权限列表
  const btnList = useAuthStore().btnList

  //【实例】表格
  const tableRef = ref()
  //【变量】表格布局
  const columns = [
    { prop: "info", label: "合同信息", minWidth: 300 },
    { prop: "selfCustomer", label: "自营客户", width: 100 },
    { prop: "projectTypeName", label: "项目类别", width: 125 },
    { prop: "money", label: "合同金额", width: 125 },
    { prop: "dutyRate", label: "合同税率", width: 125 },
    { prop: "sumProceedsMoney", label: "回款金额", width: 100 },
    { prop: "backPercent", label: "回款占比", width: 100 },
    { prop: "notInvoicedMoney", label: "未开票金额", width: 100 }
    /* { prop: "button", label: "操作", width: 100, align: "center", fixed: "right" } */
  ]
  //【变量】表格数据
  let tableData = ref<TableInter[]>([])
  //【变量】选中数据
  let chooseData = ref<TableInter[]>([])
  //【变量】表格分页
  let tablePage = ref({
    total: 0,
    current: 1,
    pagesize: 10
  })

  //【方法】表格选项改变时触发
  function selectionChange(data: any) {
    chooseData.value = data
  }
  //【方法】获取业绩总览
  function getData(isRefresh?: Boolean) {
    // 判断是否刷新，重置分页 / 选中数据
    if (isRefresh) {
      tablePage.value.current = 1
      tablePage.value.pagesize = 10
      tableRef.value.clearSelection()
    }

    viewLoading.value = true
    PerformanceReportAPI.getPerformanceReportList(formModel.value, tablePage.value)
      .then((res: any) => {
        tableData.value = res.data.data.records
        tablePage.value = {
          current: res.data.data.current,
          pagesize: res.data.data.size,
          total: res.data.data.total
        }
      })
      .finally(() => {
        viewLoading.value = false
        searchLoading.value = false
      })
  }

  //【实例】表单
  const formRef = ref<FormInstance>()
  //【变量】表单数据
  let formModel = ref<SearchFormInter>({
    projectName: "",
    contractId: "",
    customerManagerName: ""
  })
  //【方法】查询表单
  function searchForm() {
    searchLoading.value = true
    getData(true)
  }
  //【方法】重置表单
  function resetForm() {
    formRef.value?.resetFields()
  }

  //【方法】导出所有合同
  function exportAllData() {
    ElMessageBox.prompt("是否添加导出任务？", "提示", {
      type: "warning",
      confirmButtonText: "确认导出",
      inputPlaceholder: "导出文件名称（用于下载至本地的文件名称）",
      inputValidator: value => {
        if (!value) return "请输入导出文件名称"
      }
    }).then(({ value }) => {
      formModel.value.alias = value

      PerformanceReportAPI.exportPerformanceReport(formModel.value).then(() => {
        ElMessage.success("导出任务提交成功，请前往【下载中心】下载")
        tableRef.value.clearSelection()
      })
    })
  }
  //【方法】导出选中合同
  function exportChooseData() {
    ElMessageBox.prompt("是否添加导出任务？", "提示", {
      type: "warning",
      confirmButtonText: "确认导出",
      inputPlaceholder: "导出文件名称（用于下载至本地的文件名称）",
      inputValidator: value => {
        if (!value) return "请输入导出文件名称"
      }
    }).then(({ value }) => {
      // 处理已选中数据
      let projectIds: string = ""
      chooseData.value.forEach(
        (item: any) => (projectIds = projectIds.length ? projectIds + `,${item.projectId}` : item.projectId)
      )

      PerformanceReportAPI.exportPerformanceReport({ projectIds, alias: value }).then(() => {
        ElMessage.success("导出任务提交成功，请前往【下载中心】下载")
        tableRef.value.clearSelection()
      })
    })
  }

  // 【生命周期】挂载后
  onMounted(() => {
    getData()
  })
</script>

<style lang="scss" scoped></style>

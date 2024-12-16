<template>
  <div>
    <!-- 查询表单 -->
    <el-row class="card-bg search-page">
      <!-- 表单 -->
      <el-col :lg="21" :xl="22" class="search-form">
        <el-form ref="formRef" :model="formModel" label-width="auto" label-suffix="：">
          <el-row :gutter="20">
            <el-col :lg="8" :xl="6">
              <el-form-item label="合同类型" prop="typeId">
                <el-select v-model="formModel.typeId" placeholder="全部" clearable>
                  <el-option v-for="(item, i) in typeSelect" :key="i" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :lg="8" :xl="6">
              <el-form-item label="签约时间" prop="signDate">
                <el-date-picker
                  v-model="formModel.signDate"
                  type="daterange"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  unlink-panels
                  value-format="YYYY-MM-DD HH:mm:ss"
                  :default-time="[new Date(2024, 1, 1, 0, 0, 0), new Date(2024, 1, 1, 23, 59, 59)]" />
              </el-form-item>
            </el-col>

            <el-col :lg="8" :xl="6">
              <el-form-item label-width="0" prop="customerManagerName">
                <el-input v-model="formModel.customerManagerName" placeholder="客户经理名称查询" maxlength="250" clearable>
                  <template #prefix>
                    <icon-search />
                  </template>
                </el-input>
              </el-form-item>
            </el-col>

            <el-col :lg="8" :xl="6">
              <el-form-item label-width="0" prop="projectName">
                <el-input v-model="formModel.projectName" placeholder="项目名称查询" maxlength="250" clearable>
                  <template #prefix>
                    <icon-search />
                  </template>
                </el-input>
              </el-form-item>
            </el-col>

            <el-col :lg="8" :xl="6">
              <el-form-item label-width="0" prop="name">
                <el-input v-model="formModel.name" placeholder="合同名称查询" maxlength="250" clearable>
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
    <div v-loading="viewLoading" class="card-bg table-page">
      <div v-if="btnList.isExport" class="table-page-header">
        <el-button v-if="!chooseData.length" type="primary" @click="exportAllData">
          <icon-efferent-three />导出全部合同
        </el-button>
        <el-button v-else type="primary" @click="exportChooseData"><icon-efferent-three />导出选中合同</el-button>
      </div>

      <el-table ref="tableRef" :data="tableData" row-key="id" @selection-change="selectionChange">
        <!-- 多选 -->
        <el-table-column type="selection" width="50" align="center" :reserve-selection="true" />

        <!-- 表格内容 -->
        <el-table-column
          v-for="(item, i) in columns"
          :key="i"
          :label="item.label"
          :prop="item.prop"
          :width="item.width"
          :min-width="item.minwidth"
          :align="item.align"
          :fixed="item.fixed"
          show-overflow-tooltip>
          <template #default="scope">
            <!-- 合同类型 -->
            <div v-if="item.prop == 'typeName'">
              <el-tag type="info">{{ scope.row.typeName }}</el-tag>
            </div>

            <!-- 合同信息 -->
            <div v-else-if="item.prop == 'info'">
              <p>所属项目：{{ scope.row.projectName }}</p>
              <p>合同编码：{{ scope.row.id }}</p>
              <p>合同名称：{{ scope.row.name }}</p>
              <p>签约时间：{{ dateFormat(scope.row.signDateTime) }}</p>
              <p>客户经理：{{ scope.row.customerManagerName }}</p>
            </div>

            <!-- 金额格式 -->
            <div v-else-if="item.prop == 'money' || item.prop == 'amount'">￥{{ scope.row[item.prop] }}</div>

            <!-- 日期格式 -->
            <div v-else-if="item.prop == 'bidDateTime' || item.prop == 'tenderDateTime'">
              {{ dateFormat(scope.row[item.prop]) }}
            </div>

            <!-- 操作 -->
            <div v-if="item.prop == 'button'" class="table-btn">
              <el-link type="primary" :underline="false" @click="viewDetail(scope.row.id)">查看详情</el-link>
            </div>
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

    <!-- 【抽屉】合同详情 -->
    <DrawerContract ref="contractRef" />
  </div>
</template>

<script setup lang="ts" name="OverviewContract">
  import { ref, onMounted } from "vue"
  import { ElMessage, ElMessageBox } from "element-plus"
  import type { FormInstance } from "element-plus"
  import type { SearchFormInter, TableInter } from "@/api/overview/contract/types.ts"
  import Pagination from "@/components/Pagination/index.vue"
  import DrawerContract from "./components/DrawerContract.vue"
  import * as ContractReportAPI from "@/api/overview/contract/index.ts"
  import { dateFormat } from "@/utils/handle.ts"
  import useAuthStore from "@/stores/modules/auth.ts"
  import useProjectStore from "@/stores/modules/project.ts"

  //【实例】合同详情
  const contractRef = ref()

  //【变量】页面状态 - 加载中
  const viewLoading = ref<Boolean>(false)
  //【变量】查询按钮 - 加载中
  const searchLoading = ref<Boolean>(false)
  //【变量】按钮权限列表
  const btnList = useAuthStore().btnList

  //【变量】合同类型列表
  const typeSelect = useProjectStore().contractTypeList

  //【实例】表格
  const tableRef = ref()
  //【变量】表格布局
  const columns = [
    { prop: "typeName", label: "合同类型", width: 80, align: "center" },
    { prop: "info", label: "合同信息", minWidth: 300 },
    { prop: "money", label: "合同金额", width: 125 },
    { prop: "amount", label: "结算金额", width: 125 },
    { prop: "dutyRate", label: "税率", width: 125 },
    { prop: "selfCustomer", label: "自营/客户", width: 125 },
    { prop: "button", label: "操作", align: "center", fixed: "right", width: 100 }
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
  //【方法】获取合同总览
  function getData(isRefresh?: Boolean) {
    // 判断是否刷新，重置分页 / 选中数据
    if (isRefresh) {
      tablePage.value.current = 1
      tablePage.value.pagesize = 10
      tableRef.value.clearSelection()
    }

    viewLoading.value = true
    ContractReportAPI.getContractReportList(formModel.value, tablePage.value)
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
    typeId: null,
    signDate: [],
    customerManagerName: "",
    projectName: "",
    name: ""
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

  //【方法】查看合同详情
  function viewDetail(id: any) {
    contractRef.value.id = id
    contractRef.value.typeSelect = typeSelect
    contractRef.value.showDrawer = true
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

      ContractReportAPI.exportContractReport(formModel.value).then(() => {
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
      let ids: string = ""
      chooseData.value.forEach((item: any) => (ids = ids.length ? ids + `,${item.id}` : item.id))

      ContractReportAPI.exportContractReport({ ids, alias: value }).then(() => {
        ElMessage.success("导出任务提交成功，请前往【下载中心】下载")
        tableRef.value.clearSelection()
      })
    })
  }

  // 【生命周期】挂载后
  onMounted(() => {
    getData(true)
  })
</script>

<style lang="scss" scoped></style>

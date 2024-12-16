<template>
  <div>
    <!-- 查询表单 -->
    <el-row class="card-bg search-page">
      <!-- 表单 -->
      <el-col :lg="21" :xl="22" class="search-form">
        <el-form ref="formRef" :model="formModel" label-width="auto" label-suffix="：">
          <el-row :gutter="20">
            <el-col :lg="8" :xl="6">
              <el-form-item label="操作类型" prop="operateName">
                <el-select v-model="formModel.operateName" placeholder="全部" clearable>
                  <el-option v-for="(item, i) in typeSelect" :key="i" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :lg="8" :xl="6">
              <el-form-item label="操作结果" prop="operateResult">
                <el-select v-model="formModel.operateResult" placeholder="全部" clearable>
                  <el-option label="成功" :value="1"></el-option>
                  <el-option label="失败" :value="2"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :lg="8" :xl="6">
              <el-form-item label="操作时间" prop="operationTime">
                <el-date-picker
                  v-model="formModel.operationTime"
                  type="daterange"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  unlink-panels
                  value-format="YYYY-MM-DD HH:mm:ss"
                  :default-time="[new Date(2024, 1, 1, 0, 0, 0), new Date(2024, 1, 1, 23, 59, 59)]" />
              </el-form-item>
            </el-col>

            <el-col :lg="8" :xl="6">
              <el-form-item label-width="0" prop="operateEmployeeName">
                <el-input v-model="formModel.operateEmployeeName" placeholder="操作人查询" maxlength="250" clearable>
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

    <div v-loading="viewLoading" class="card-bg table-page">
      <el-table ref="tableRef" :data="tableData" @row-click="expandClick">
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
            <div v-if="item.prop == 'operateResult'">
              <el-tag v-show="scope.row.operateResult == 1" type="success">成功</el-tag>
              <el-tag v-show="scope.row.operateResult == 2" type="danger">失败</el-tag>
            </div>
          </template>
        </el-table-column>

        <!-- 展开行 -->
        <el-table-column type="expand">
          <template #default="scope">
            <el-row class="table-page-expand">
              <el-button type="primary" @click="viewJsonData(scope.row.request, '请求参数 JSON')">
                <icon-code-brackets />请求参数 JSON
              </el-button>
              <el-button type="primary" @click="viewJsonData(scope.row.response, '响应数据 JSON')">
                <icon-code-brackets />响应数据 JSON
              </el-button>

              <!-- 日志状态为失败时，显示错误信息 -->
              <el-button
                v-show="scope.row.operateResult == 2"
                type="danger"
                @click="viewJsonData(scope.row.operateDescribe, '错误信息')">
                <icon-close />错误信息
              </el-button>
            </el-row>
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

  <!-- 【对话框】查看 JSON 数据 -->
  <ViewJson ref="jsonRef" />
</template>

<script setup lang="ts" name="Logs">
  import { ref, onMounted } from "vue"
  import { ElMessageBox } from "element-plus"
  import type { FormInstance } from "element-plus"
  import type { LogsSearchFormInter, LogsTableInter } from "@/api/other/types.ts"
  import Pagination from "@/components/Pagination/index.vue"
  import * as OtherAPI from "@/api/other/index.ts"
  import ViewJson from "./components/viewJson.vue"

  // 【实例】对话框 - 查看 JSON 数据
  const jsonRef = ref()

  //【变量】页面状态 - 加载中
  const viewLoading = ref<Boolean>(false)
  //【变量】查询按钮 - 加载中
  const searchLoading = ref<Boolean>(false)

  //【常量】操作类型
  const typeSelect = ["添加", "修改", "删除", "导出", "下载", "获取"]

  //【实例】表格
  const tableRef = ref()
  //【变量】表格布局
  const columns = [
    { prop: "operateResult", label: "操作结果", width: 80, align: "center" },
    { prop: "moduleName", label: "模块名称", width: 150 },
    { prop: "operateName", label: "操作内容", minWidth: 300 },
    { prop: "createDateTime", label: "操作时间", width: 175 },
    { prop: "operateEmployeeName", label: "操作人", width: 125 },
    { prop: "operateEmployeeDepartName", label: "所属部门", width: 125 }
  ]
  //【变量】表格数据
  let tableData = ref<LogsTableInter[]>([])
  //【变量】表格分页
  let tablePage = ref({
    total: 0,
    current: 1,
    pagesize: 10
  })
  //【方法】获取操作日志
  function getData(isRefresh?: Boolean) {
    // 判断是否刷新，重置分页 / 选中数据
    if (isRefresh) {
      tablePage.value.current = 1
      tablePage.value.pagesize = 10
    }

    viewLoading.value = true
    OtherAPI.getOperatorLogs(formModel.value, tablePage.value)
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
  let formModel = ref<LogsSearchFormInter>({
    operateName: null,
    operateResult: null,
    operateEmployeeName: null,
    operationTime: null
  })
  //【方法】查询表单
  function searchForm() {
    searchLoading.value = true
    getData(true)
  }
  //【方法】重置表单
  function resetForm() {
    formRef.value?.resetFields()
    getData(true)
  }

  //【方法】展开当前行
  function expandClick(row: any) {
    tableRef.value?.toggleRowExpansion(row)
  }
  //【方法】显示JSON数据
  function viewJsonData(data: string, title: string) {
    /* ElMessageBox.alert(data, title, {
      cancelButtonText: "关闭",
      showConfirmButton: false,
      showCancelButton: true
    }) */

    jsonRef.value.title = title
    jsonRef.value.data = data
    jsonRef.value.showDialog = true
  }

  // 【生命周期】挂载后
  onMounted(() => {
    getData(true)
  })
</script>

<style lang="scss" scoped>
  // 表格展开样式
  .table-page-expand {
    p {
      margin-top: 10px;
    }
  }
</style>

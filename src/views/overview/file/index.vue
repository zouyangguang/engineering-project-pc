<template>
  <div>
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
              <el-form-item label-width="0" prop="name">
                <el-input v-model="formModel.name" placeholder="附件名称查询" clearable>
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
          <icon-efferent-three />导出全部附件
        </el-button>
        <el-button v-else type="primary" @click="exportChooseData"><icon-efferent-three />导出选中附件</el-button>
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
          :min-width="item.minWidth"
          :align="item.align"
          :fixed="item.fixed"
          show-overflow-tooltip>
          <template #default="scope">
            <!-- 附件信息 -->
            <div v-if="item.prop == 'info'">
              <p>所属项目：{{ scope.row.projectName }}</p>
              <p>附件名称：{{ scope.row.name }}</p>
            </div>

            <!-- 附件大小 -->
            <div v-if="item.prop == 'size'">{{ handleFilesize(scope.row.size) }}</div>

            <!-- 操作 -->
            <div v-else-if="item.prop == 'button'" class="table-btn">
              <el-link
                v-if="btnList.isExport"
                v-loading="scope.row.loading"
                type="primary"
                :underline="false"
                @click="downloadFile(scope.row)">
                下载
              </el-link>
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
  </div>
</template>

<script setup lang="ts" name="OverviewFile">
  import { ref, onMounted } from "vue"
  import { ElMessage, ElMessageBox } from "element-plus"
  import { handleFilesize, downloadB } from "@/utils/handle.ts"
  import type { FormInstance } from "element-plus"
  import type { SearchFormInter, TableInter } from "@/api/overview/file/types.ts"
  import Pagination from "@/components/Pagination/index.vue"
  import * as FileReportAPI from "@/api/overview/file/index.ts"
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
    { prop: "info", label: "附件信息", minWidth: 300 },
    { prop: "size", label: "附件大小", width: 125 },
    { prop: "createEmployeeName", label: "上传人", width: 125 },
    { prop: "createDateTime", label: "上传时间", width: 175 },
    { prop: "button", label: "操作", width: 100, align: "center", fixed: "right" }
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
  //【方法】获取附件总览
  function getData(isRefresh?: Boolean) {
    // 判断是否刷新，重置分页 / 选中数据
    if (isRefresh) {
      tablePage.value.current = 1
      tablePage.value.pagesize = 10
      tableRef.value.clearSelection()
    }

    viewLoading.value = true
    FileReportAPI.getFileReportList(formModel.value, tablePage.value)
      .then((res: any) => {
        // 给每行添加一个 loading 状态，用于按钮
        tableData.value = res.data.data.records.map((item: any) => {
          return { ...item, loading: false }
        })
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

  //【方法】导出所有附件
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

      FileReportAPI.exportFileReport(formModel.value).then(() => {
        ElMessage.success("导出任务提交成功，请前往【下载中心】下载")
        tableRef.value.clearSelection()
      })
    })
  }
  //【方法】导出选中附件
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
      chooseData.value.forEach((item: any) => (ids = ids.length ? ids + `,${String(item.id)}` : String(item.id)))

      FileReportAPI.exportFileReport({ ids, alias: value }).then(() => {
        ElMessage.success("导出任务提交成功，请前往【下载中心】下载")
        tableRef.value.clearSelection()
      })
    })
  }
  //【方法】下载附件
  function downloadFile(row: any) {
    row.loading = true
    FileReportAPI.downloadFile(row.url, row.name)
      .then((res: any) => {
        downloadB(res.data, row.name)
      })
      .finally(() => {
        row.loading = false
      })
  }

  // 【生命周期】挂载后
  onMounted(() => {
    getData()
  })
</script>

<style lang="scss" scoped></style>

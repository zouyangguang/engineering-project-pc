<template>
  <div>
    <!-- 查询表单 -->
    <el-row class="card-bg search-page">
      <!-- 表单 -->
      <el-col :lg="21" :xl="22" class="search-form">
        <el-form ref="formRef" :model="formModel" label-width="auto" label-suffix="：">
          <el-row :gutter="20">
            <el-col :lg="8" :xl="6">
              <el-form-item label="投标状态" prop="status">
                <el-select v-model="formModel.status" placeholder="全部" clearable>
                  <el-option v-for="(item, i) in statusSelect" :key="i" :label="item.label" :value="i" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :lg="8" :xl="6">
              <el-form-item label="招标模式" prop="bidPattern">
                <el-select v-model="formModel.bidPattern" placeholder="全部" clearable>
                  <el-option v-for="(item, i) in patternSelect" :key="i" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :lg="8" :xl="6">
              <el-form-item label="项目类别" prop="projectType">
                <el-select v-model="formModel.projectType" placeholder="全部" clearable>
                  <el-option v-for="(item, i) in typeSelect" :key="i" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :lg="8" :xl="6">
              <el-form-item label="投标日期" prop="bidDate">
                <el-date-picker
                  v-model="formModel.bidDate"
                  type="daterange"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  unlink-panels
                  value-format="YYYY-MM-DD HH:mm:ss"
                  :default-time="[new Date(2024, 1, 1, 0, 0, 0), new Date(2024, 1, 1, 23, 59, 59)]" />
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
          <icon-efferent-three />导出全部招投标
        </el-button>
        <el-button v-else type="primary" @click="exportChooseData"><icon-efferent-three />导出选中招投标</el-button>
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
            <!-- 投标状态 -->
            <div v-if="item.prop == 'status'">
              <el-tag :type="statusSelect[scope.row.status].type">{{ scope.row.statusName }}</el-tag>
            </div>

            <!-- 招投标信息 -->
            <div v-if="item.prop == 'info'">
              <p>所属项目：{{ scope.row.projectName }}</p>
              <p>项目地址：{{ scope.row.projectAddress }}</p>
              <p>个人/公司：{{ scope.row.companyPersonalName }}</p>
              <p>施工单位：{{ scope.row.constructionUnits }}</p>
            </div>

            <!-- 投标金额 -->
            <div v-else-if="item.prop == 'bidMoney'">￥{{ scope.row.bidMoney }}</div>

            <!-- 建筑/套内面积 -->
            <div v-else-if="item.prop == 'area'">{{ scope.row.area }}m²</div>

            <!-- 日期格式 -->
            <div v-else-if="item.prop == 'bidDateTime' || item.prop == 'tenderDateTime'">
              {{ dateFormat(scope.row[item.prop]) }}
            </div>

            <!-- 操作 -->
            <div v-else-if="item.prop == 'button'" class="table-btn">
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

    <!-- 【抽屉】招投标详情 -->
    <DrawerBid ref="bidRef" />
  </div>
</template>

<script setup lang="ts" name="OverviewBid">
  import { ref, onMounted } from "vue"
  import { ElMessage, ElMessageBox } from "element-plus"
  import type { FormInstance } from "element-plus"
  import type { SearchFormInter, TableInter } from "@/api/overview/bid/types.ts"
  import Pagination from "@/components/Pagination/index.vue"
  import DrawerBid from "./components/DrawerBid.vue"
  import * as BidReportAPI from "@/api/overview/bid/index.ts"
  import { dateFormat } from "@/utils/handle.ts"
  import useAuthStore from "@/stores/modules/auth.ts"
  import useProjectStore from "@/stores/modules/project.ts"

  //【实例】招投标详情
  const bidRef = ref()

  //【变量】页面状态 - 加载中
  const viewLoading = ref<Boolean>(false)
  //【变量】查询按钮 - 加载中
  const searchLoading = ref<Boolean>(false)
  //【变量】按钮权限列表
  const btnList = useAuthStore().btnList

  //【变量】投标状态列表
  const statusSelect = [
    { type: "primary", label: "投标中" },
    { type: "success", label: "已中标" },
    { type: "danger", label: "未中标" },
    { type: "info", label: "已撤标" },
    { type: "info", label: "无需投标" }
  ]
  //【变量】招标模式列表
  const patternSelect = useProjectStore().bidPatternList
  //【变量】承包方式
  const contractSelect = useProjectStore().bidContractList
  //【变量】项目类别列表
  const typeSelect = useProjectStore().projectTypeList

  //【实例】表格
  const tableRef = ref()
  //【变量】表格布局
  const columns = [
    { prop: "status", label: "状态", width: 80, align: "center" },
    { prop: "info", label: "招投标信息", width: 300 },
    { prop: "patternName", label: "招标模式", width: 100 },
    { prop: "contractApproachName", label: "承包方式", width: 100 },
    { prop: "bidDateTime", label: "投标日期", width: 125 },
    { prop: "tenderDateTime", label: "招标日期", width: 125 },
    { prop: "customBidType", label: "项目细则", width: 125 },
    { prop: "bidMoney", label: "投标金额", width: 125 },
    { prop: "area", label: "建筑/套内面积", width: 125 },
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
  //【方法】获取招投标总览
  function getData(isRefresh?: Boolean) {
    // 判断是否刷新，重置分页 / 选中数据
    if (isRefresh) {
      tablePage.value.current = 1
      tablePage.value.pagesize = 10
      tableRef.value.clearSelection()
    }

    viewLoading.value = true
    BidReportAPI.getBidReportList(formModel.value, tablePage.value)
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
    status: null,
    bidPattern: null,
    projectType: null,
    bidDate: [],
    projectName: ""
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

  //【方法】查看招投标详情
  function viewDetail(id: any) {
    bidRef.value.id = id
    bidRef.value.patternSelect = patternSelect
    bidRef.value.contractSelect = contractSelect
    bidRef.value.showDrawer = true
  }
  //【方法】导出所有招投标
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

      BidReportAPI.exportBidReport(formModel.value).then(() => {
        ElMessage.success("导出任务提交成功，请前往【下载中心】下载")
        tableRef.value.clearSelection()
      })
    })
  }
  //【方法】导出选中招投标
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

      BidReportAPI.exportBidReport({ ids, alias: value }).then(() => {
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

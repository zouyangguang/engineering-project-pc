<template>
  <div>
    <!-- 查询表单 -->
    <div class="card-bg search-page">
      <el-form ref="searchFormRef" :model="searchForm" label-width="auto" label-suffix="：">
        <el-row :gutter="20">
          <!-- 表单内容 -->
          <el-col :lg="21" class="search-form">
            <el-row :gutter="10">
              <el-col :lg="8" :xl="6">
                <el-form-item label="项目名称" prop="name">
                  <el-input v-model="searchForm.name" placeholder="请填写项目名称" clearable />
                </el-form-item>
              </el-col>

              <el-col :lg="8" :xl="6">
                <el-form-item label="项目负责人" prop="principalName">
                  <el-input v-model="searchForm.principalName" placeholder="请填写项目负责人" clearable />
                </el-form-item>
              </el-col>

              <el-col :lg="8" :xl="6">
                <el-form-item label="项目立项人" prop="proposerName">
                  <el-input v-model="searchForm.proposerName" placeholder="请填写立项人" clearable />
                </el-form-item>
              </el-col>

              <el-col :lg="8" :xl="6">
                <el-form-item label="项目状态" prop="status">
                  <el-select v-model="searchForm.status" placeholder="全部" clearable>
                    <el-option label="准备中" :value="0" />
                    <el-option label="进行中" :value="1" />
                    <el-option label="已完成" :value="2" />
                    <el-option label="已废弃" :value="3" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :lg="8" :xl="6">
                <el-form-item label="签约状态" prop="isSigned">
                  <el-select v-model="searchForm.isSigned" placeholder="全部" clearable>
                    <el-option label="待签约" :value="0" />
                    <el-option label="已签约" :value="1" />
                  </el-select>
                </el-form-item>
              </el-col>

              <template v-if="moreStatus">
                <el-col :lg="8" :xl="6">
                  <el-form-item label="项目归属" prop="isFieldProject">
                    <el-select v-model="searchForm.isFieldProject" placeholder="全部" clearable>
                      <el-option label="本地" :value="0" />
                      <el-option label="异地" :value="1" />
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :lg="8" :xl="6">
                  <el-form-item label="项目类别" prop="typeId">
                    <el-select v-model="searchForm.typeId" placeholder="全部" clearable>
                      <el-option v-for="item in typeSelect" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </template>

              <el-col :lg="8" :xl="6" class="search-more">
                <el-link type="primary" :underline="false" @click="moreStatus = !moreStatus">
                  <component :is="moreStatus ? 'icon-up' : 'icon-down'" size="18" />{{ moreStatus ? "收起" : "展开" }}
                </el-link>
              </el-col>
            </el-row>
          </el-col>

          <!-- 查询按钮 -->
          <el-col :lg="3" class="search-btn">
            <el-button type="primary" :loading="searchLoading" @click="searchQuery"><icon-search />查询</el-button>
            <el-button color="#EEF2F6" @click="searchFormReset"><icon-undo />重置</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 表格 -->
    <div v-loading="viewLoading" class="card-bg table-page">
      <div class="table-page-header">
        <el-tabs v-model="searchForm.nature" @tab-change="searchQuery">
          <el-tab-pane label="全部" name=""></el-tab-pane>
          <el-tab-pane label="工程（自营）" :name="0"></el-tab-pane>
          <el-tab-pane label="工程（挂靠）" :name="2"></el-tab-pane>
          <el-tab-pane label="劳务" :name="1"></el-tab-pane>
        </el-tabs>
        <el-button v-if="btnList.isAdd" type="primary" @click="ProjectAddBtn"><IconPlus></IconPlus>项目立项</el-button>
      </div>

      <!-- 表格数据 -->
      <el-table :data="tableData" @row-dblclick="ProjectRegulate">
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
            <!-- 项目信息 -->
            <div v-if="item.prop == 'info'">
              <p>项目编号：{{ scope.row.id }}</p>
              <p>项目名称：{{ scope.row.name }}</p>
              <p>类别：{{ scope.row.typeName }} &emsp;|&emsp; 归属：{{ ["本地", "异地"][scope.row.isFieldProject] }}</p>
              <p>立项人：{{ scope.row.proposerName }} &emsp;|&emsp; 负责人：{{ scope.row.principalName }}</p>
            </div>

            <div v-if="item.prop == 'isSigned'"></div>

            <!-- 项目状态 / 签约状态 -->
            <div v-else-if="item.prop == 'status'">
              <el-tag :type="['warning', 'primary', 'success', 'info'][scope.row.status]">
                {{ ["准备中", "进行中", "已完成", "已废弃"][scope.row.status] }}
              </el-tag>
              <br /><br />
              <el-tag :type="['info', 'success'][scope.row.isSigned]">{{ ["待签约", "已签约"][scope.row.isSigned] }}</el-tag>
            </div>

            <!-- 金额格式 -->
            <div v-else-if="item.prop == 'amount' || item.prop == 'sumConstructionReturn'">￥{{ scope.row[item.prop] }}</div>

            <!-- 百分比格式 -->
            <div v-else-if="item.prop == 'progress' || item.prop == 'progress'">{{ scope.row[item.prop] }}%</div>

            <!-- 日期格式 -->
            <div v-else-if="item.prop == 'expectFinishDateTime'">
              {{ dateFormat(scope.row[item.prop]) }}
            </div>

            <!-- 操作 -->
            <div v-else-if="item.prop == 'button'" class="table-btn">
              <el-link type="primary" :underline="false" @click="ProjectRegulate(scope.row)"> 管理 </el-link>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <Pagination
        v-model:total="tablePage.total"
        v-model:current="tablePage.current"
        v-model:pagesize="tablePage.pagesize"
        class="table-page-pagination"
        @change="getTableData()" />
    </div>

    <!-- 修改 添加对话框 -->
    <editAdd-dialog ref="editAddDialogRef" @update="getTableData(true)"></editAdd-dialog>
  </div>
</template>

<script setup lang="ts" name="ProjectList">
  import { ref, reactive, onMounted, computed } from "vue"
  import type { FormInstance } from "element-plus"
  import type { TableInter, SearchFormInter } from "@/api/project/default/types.ts"
  import EditAddDialog from "./components/EditAddDialog.vue"
  import Pagination from "@/components/Pagination/index.vue"
  import { useRouter } from "vue-router"
  import { getProjectList } from "@/api/project/default/index.ts"
  import { dateFormat } from "@/utils/handle.ts"
  import useAuthStore from "@/stores/modules/auth.ts"
  import useProjectStore from "@/stores/modules/project.ts"

  //【实例】权限 - pinia
  const btnList = useAuthStore().btnList
  //【实例】项目信息 - pinia
  const projectStore = useProjectStore()
  //【实例】路由
  const router = useRouter()

  //分页器配置
  const tablePage = ref({
    total: 0,
    current: 1,
    pagesize: 10
  })

  //【变量】页面状态【加载中】
  const viewLoading = ref<Boolean>(false)
  //【变量】查询按钮【加载中】
  const searchLoading = ref<Boolean>(false)
  //【变量】查询表单展开状态【true展开，false收起】
  const moreStatus = ref<Boolean>(false)

  /**搜索表单 实例*/
  const searchFormRef = ref<FormInstance>()
  /**存放 搜索表单 数据*/
  const searchForm = reactive<SearchFormInter>({
    status: null,
    isFieldProject: null,
    isSigned: null,
    typeId: null,
    nature: "",
    name: "",
    principalName: "",
    proposerName: ""
  })
  //存放项目类别
  const typeSelect = projectStore.projectTypeList
  /**查询 按钮*/
  const searchQuery = () => {
    searchLoading.value = true
    getTableData(true)
  }
  /** 重置 按钮*/
  const searchFormReset = () => {
    if (searchFormRef.value) {
      searchFormRef.value.resetFields()
      getTableData(true)
    }
  }

  //存放 添加 修改 立项 对话框实例
  const editAddDialogRef = ref<InstanceType<typeof EditAddDialog>>()
  /**存放 立项表 数据*/
  const tableData = ref<TableInter[]>([])
  const screen = computed(() => {
    return {
      ...{ page: tablePage.value.current, size: tablePage.value.pagesize },
      ...searchForm
    }
  })
  //获取 立项表 数据
  const getTableData = (isRefresh?: Boolean) => {
    // 判断是否刷新，重置分页
    if (isRefresh) {
      tablePage.value.current = 1
      tablePage.value.pagesize = 10
    }

    viewLoading.value = true
    getProjectList(screen.value)
      .then((res: any) => {
        tableData.value = res.data.data.records
        tablePage.value.total = res.data.data.total
      })
      .finally(() => {
        viewLoading.value = false
        searchLoading.value = false
      })
  }
  /**立项表 框架*/
  const columns = [
    { prop: "status", label: "状态", width: 80, align: "center" },
    { prop: "info", label: "项目信息", minWidth: 300 },
    { prop: "progress", label: "进度", width: 80 },
    { prop: "expectFinishDateTime", label: "预期结项时间", width: 125 },
    { prop: "sumConstructionReturn", label: "回款合计", width: 125 },
    { prop: "amount", label: "结算金额", width: 125 },
    { prop: "note", label: "备注", minwidth: 100 },
    { prop: "button", label: "操作", align: "center", fixed: "right", width: 100 }
  ]

  /**项目管理*/
  const ProjectRegulate = (row: TableInter) => {
    sessionStorage.projectId = row.id
    router.push({ path: "./detail" })
  }

  /**添加项目按钮*/
  const ProjectAddBtn = () => {
    if (editAddDialogRef.value) {
      editAddDialogRef.value.FormType = 0
      editAddDialogRef.value.isShow = true
    }
  }

  onMounted(() => {
    getTableData()
  })
</script>

<style lang="less" scoped></style>

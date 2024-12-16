<template>
  <div v-loading="viewLoading" class="list-page">
    <el-row>
      <el-col :lg="8">
        <div class="card-bg">
          <h1>累计回款</h1>
          <h4>￥ {{ sumExecuteData.sumReturned || 0 }}</h4>
        </div>
      </el-col>

      <el-col :lg="8">
        <div class="card-bg">
          <h1>成本总和</h1>
          <h4>￥ {{ sumExecuteData.sumCost || 0 }}</h4>
        </div>
      </el-col>

      <el-col :lg="8">
        <div class="card-bg">
          <h1>剩余成本</h1>
          <h4>￥ {{ sumExecuteData.sumProfit || 0 }}</h4>
        </div>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <div class="card-bg table-page">
      <div class="table-page-header">
        <el-button v-if="btnList.isAdd && projectInfo.status < 2" type="primary" style="margin-bottom: 15px" @click="BidAdd">
          <IconPlus></IconPlus>添加实施过程
        </el-button>
      </div>

      <!-- 表格数据 -->
      <el-table :data="tableData">
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
            <template v-if="item.prop == 'cost'"> ￥{{ scope.row.cost }}</template>
            <template v-if="item.prop == 'costPayDateTime'"> {{ dateFormat(scope.row.costPayDateTime) }}</template>
            <div v-if="item.prop == 'button'" class="table-btn">
              <el-link type="primary" :underline="false" @click="ContractDetailed(scope.row)">查看详情</el-link>
              <!-- 更多下拉框 -->
              <el-dropdown
                v-if="(btnList.isUpdate || btnList.isDelete) && projectInfo.status < 2"
                trigger="click"
                :hide-on-click="false">
                <el-link link type="primary" :underline="false">
                  更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-link>
                <template #dropdown>
                  <!-- 气泡确认框 -->
                  <el-dropdown-menu>
                    <el-dropdown-item v-if="btnList.isUpdate && projectInfo.status < 2" @click="EditContract(scope.row)">
                      修改实施
                    </el-dropdown-item>
                    <el-dropdown-item v-if="btnList.isDelete && projectInfo.status < 2" @click="ContractDelete(scope.row)">
                      删除实施</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <Pagination
        v-model:total="PaginationConfiguration.total"
        v-model:current="PaginationConfiguration.current"
        v-model:pagesize="PaginationConfiguration.pagesize"
        class="table-page-pagination"
        @change="GetByProjectId" />
    </div>
  </div>
  <!-- 添加 修改 合同 -->
  <EditAddExecutet ref="EditAddExecutetRef" @update="getData()"></EditAddExecutet>
</template>

<script setup lang="ts" name="ProjectExecute">
  import { ref, onMounted } from "vue"
  import { ElMessage, ElMessageBox } from "element-plus"

  import Pagination from "@/components/Pagination/index.vue"
  import type { ProjectExecuteInter } from "@/api/project/execute/types.ts"
  import EditAddExecutet from "./components/EditAddExecutet.vue"
  //getByProjectId 获取工程实施列表 deleteExecute删除工程实施
  import { getByProjectId, deleteExecute, getExecuteSumAPI } from "@/api/project/execute/index.ts"
  import { dateFormat } from "@/utils/handle.ts"
  import useAuthStore from "@/stores/modules/auth.ts"
  import useProjectStore from "@/stores/modules/project.ts"

  //【实例】权限 - pinia
  const btnList = useAuthStore().btnList
  //【实例】项目信息 - pinia
  const projectInfo = useProjectStore().info

  //分页器配置
  const PaginationConfiguration = ref({
    total: 20,
    current: 1,
    pagesize: 10
  })
  const viewLoading = ref(false)
  /**存放 表 数据*/
  const tableData = ref<ProjectExecuteInter[]>([])
  //查询 工程实施 列表
  const GetByProjectId = () => {
    return getByProjectId({
      projectId: sessionStorage.projectId,
      page: PaginationConfiguration.value.current,
      size: PaginationConfiguration.value.pagesize
    }).then((res: any) => {
      tableData.value = res.data.data.records
      PaginationConfiguration.value.total = res.data.data.total
    })
  }

  //【变量】工程实施统计信息
  const sumExecuteData = ref<any>({})
  //【方法】获取工程实施统计信息
  const getExecuteSum = () => {
    return getExecuteSumAPI(sessionStorage.projectId).then((res: any) => {
      sumExecuteData.value = res.data.data
    })
  }

  /**表 框架*/
  const columns = [
    { prop: "teamTypeName", label: "班组类型", width: 100 },
    { prop: "teamName", label: "团队名称", width: 110 },
    { prop: "workContent", label: "工作内容", minwidth: 100 },
    { prop: "cost", label: "成本", width: 100 },
    { prop: "costPayDateTime", label: "支出时间", width: 110 },
    { prop: "receipt", label: "回执单", width: 100 },
    { prop: "contactPerson", label: "对接人", width: 100 },
    { prop: "note", label: "备注", minwidth: 100 },
    { prop: "button", label: "操作", align: "center", fixed: "right", width: "150" }
  ]

  /**查看详情*/
  const ContractDetailed = (row: ProjectExecuteInter) => {
    if (EditAddExecutetRef.value) {
      EditAddExecutetRef.value.id = row.id
      EditAddExecutetRef.value.drawerType = 2
      EditAddExecutetRef.value.showDrawer = true
    }
  }

  const EditAddExecutetRef = ref<InstanceType<typeof EditAddExecutet>>()

  /**添加按钮*/
  const BidAdd = () => {
    if (EditAddExecutetRef.value) {
      EditAddExecutetRef.value.drawerType = 0
      EditAddExecutetRef.value.showDrawer = true
    }
  }

  /**修改*/
  const EditContract = (row: ProjectExecuteInter) => {
    if (EditAddExecutetRef.value) {
      EditAddExecutetRef.value.id = row.id
      EditAddExecutetRef.value.drawerType = 1
      EditAddExecutetRef.value.showDrawer = true
    }
  }

  /**删除*/
  const ContractDelete = (row: ProjectExecuteInter) => {
    ElMessageBox.confirm("此操作将永久删除该实施过程，请谨慎操作！", "提示", {
      type: "warning",
      confirmButtonText: "确认删除"
    }).then(() => {
      deleteExecute(row.id.toString())
        .then(() => {
          getData()
        })
        .finally(() => {
          ElMessage.success("删除成功")
        })
    })
  }

  const getData = () => {
    viewLoading.value = true

    Promise.all([GetByProjectId(), getExecuteSum()]).finally(() => {
      viewLoading.value = false
    })
  }

  onMounted(() => {
    getData()
  })
</script>

<style lang="scss" scoped>
  $padding: 10px;

  .list-page {
    .el-row {
      .el-col {
        .card-bg {
          height: 100%;
        }
      }
    }
    > .el-row:nth-child(1) {
      text-align: center;
      h1 {
        margin-bottom: 10px;
      }
      .card {
        padding: $padding;
      }
      .el-col:nth-child(n + 1) {
        padding-right: 0px;
      }
      .el-col {
        padding-bottom: $padding;
      }
      @media (min-width: 1200px) {
        .el-col:nth-child(n + 1):nth-child(-n + 2) {
          padding-right: $padding;
        }
      }
    }
  }
</style>

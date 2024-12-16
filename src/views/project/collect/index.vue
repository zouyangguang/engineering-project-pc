<template>
  <div class="page">
    <el-row v-loading="GetSumByProjectIdLoading">
      <el-col :lg="8">
        <div class="card-bg">
          <h1>合同金额(含增减项)</h1>
          <h4>￥ {{ SumProject.amount }}</h4>
        </div>
      </el-col>

      <el-col :lg="8">
        <div class="card-bg">
          <h1>回款合计</h1>
          <h4>￥ {{ SumProject.sumReturnedMoney }}</h4>
        </div>
      </el-col>

      <el-col :lg="8">
        <div class="card-bg">
          <h1>回款总占比</h1>
          <h4>{{ SumProject.sumReturnedPercent }}%</h4>
        </div>
      </el-col>
    </el-row>

    <el-row>
      <el-col :lg="24">
        <div class="list-page">
          <!-- 表格 -->
          <div class="card-bg table-page">
            <div class="table-page-header">
              <el-button v-if="btnList.isAdd && projectInfo.status < 2" type="primary" @click="BidAdd">
                <IconPlus /> 添加回款账单
              </el-button>
            </div>

            <!-- 表格数据 -->
            <el-table v-loading="getTableDataLoading" :data="tableData">
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
                  <template v-if="item.prop == 'returnedMoney'">￥{{ scope.row.returnedMoney }}</template>
                  <template v-if="item.prop == 'returnedDateTime'">{{ dateFormat(scope.row.returnedDateTime) }}</template>
                  <template v-if="item.prop == 'returnedPercent'">{{ scope.row.returnedPercent }}%</template>
                  <div v-if="item.prop == 'button'" class="table-btn">
                    <el-link type="primary" :underline="false" @click="ContractDetailed(scope.row)">查看详细</el-link>
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
                            修改回款
                          </el-dropdown-item>
                          <el-dropdown-item v-if="btnList.isDelete && projectInfo.status < 2" @click="ContractDelete(scope.row)">
                            删除回款
                          </el-dropdown-item>
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
              @change="getTableData" />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
  <!-- 添加 修改 回款 -->
  <EditAddCollect ref="EditAddCollectRef" @update="UpdateCollect"></EditAddCollect>
</template>

<script setup lang="ts" name="ProjectCollect">
  import { ref, onMounted } from "vue"
  import { ElMessage, ElMessageBox } from "element-plus"
  import Pagination from "@/components/Pagination/index.vue"
  import type { collectInter } from "@/api/project/collect/types.ts"
  import EditAddCollect from "./components/EditAddCollect.vue"
  // 获取 统计信息 //getByProjectId 获取回款列表 deleteCollect删除列表
  import { getSumByProjectId, getByProjectId, deleteCollect } from "@/api/project/collect/index.ts"
  import { dateFormat } from "@/utils/handle.ts"
  import useAuthStore from "@/stores/modules/auth.ts"
  import useProjectStore from "@/stores/modules/project.ts"

  //【实例】权限 - pinia
  const btnList = useAuthStore().btnList
  //【实例】项目信息 - pinia
  const projectInfo = useProjectStore().info

  //存放 统计信息
  const SumProject = ref({
    amount: 0,
    sumReturnedMoney: 0,
    sumReturnedPercent: 0
  })

  onMounted(() => {
    UpdateCollect()
  })
  const UpdateCollect = () => {
    GetSumByProjectId()
    getTableData()
  }
  //获取统计信息 加载
  const GetSumByProjectIdLoading = ref<boolean>(true)
  // //获取统计信息
  const GetSumByProjectId = () => {
    //获取统计信息
    getSumByProjectId(sessionStorage.projectId)
      .then((res: any) => {
        if (res.data.data) {
          SumProject.value = res.data.data
        }
      })
      .finally(() => {
        GetSumByProjectIdLoading.value = false
      })
  }

  //分页器配置
  const PaginationConfiguration = ref({
    total: 20,
    current: 1,
    pagesize: 10
  })

  /**存放 表 数据*/
  const tableData = ref<collectInter[]>([])
  //获取甲方回款 加载
  const getTableDataLoading = ref<boolean>(true)
  //获取 甲方回款
  const getTableData = () => {
    getTableDataLoading.value = true
    getByProjectId({
      page: PaginationConfiguration.value.current,
      size: PaginationConfiguration.value.pagesize,
      projectId: sessionStorage.projectId
    })
      .then((res: any) => {
        tableData.value = res.data.data.records
        PaginationConfiguration.value.total = res.data.data.total
      })
      .finally(() => {
        getTableDataLoading.value = false
      })
  }

  /**表 框架*/
  const columns = [
    { prop: "receipt", label: "回款单号", width: 130 },
    { prop: "returnedMoney", label: "回款金额", width: 100 },
    { prop: "returnedDateTime", label: "回款时间", width: 170 },
    { prop: "returnedPercent", label: "回款占比", width: 90 },
    { prop: "note", label: "备注", minwidth: 100 },
    { prop: "button", label: "操作", align: "center", fixed: "right", width: "150" }
  ]

  //存放 添加 修改  对话框实例
  const EditAddCollectRef = ref<InstanceType<typeof EditAddCollect>>()

  /**查看详细*/
  const ContractDetailed = (row: collectInter) => {
    if (EditAddCollectRef.value) {
      EditAddCollectRef.value.id = row.id
      EditAddCollectRef.value.FormType = 2
      EditAddCollectRef.value.isShow = true
    }
  }

  /**添加按钮*/
  const BidAdd = () => {
    if (EditAddCollectRef.value) {
      EditAddCollectRef.value.FormType = 0
      EditAddCollectRef.value.isShow = true
    }
  }

  /**修改*/
  const EditContract = (row: collectInter) => {
    if (EditAddCollectRef.value) {
      EditAddCollectRef.value.id = row.id
      EditAddCollectRef.value.FormType = 1
      EditAddCollectRef.value.isShow = true
    }
  }

  /**删除*/
  const ContractDelete = (row: collectInter) => {
    console.log(row.projectName)
    ElMessageBox.confirm("此操作将永久删除该项目回款，请谨慎操作！", "提示", {
      type: "warning",
      confirmButtonText: "确认删除"
    }).then(({ value }) => {
      deleteCollect(row.id.toString()).then(() => {
        UpdateCollect()
      })
      ElMessage.success(value)
    })
  }
</script>

<style lang="scss" scoped>
  $padding: 10px;

  .page {
    > .el-row {
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
      .el-col:nth-child(1),
      .el-col:nth-child(2) {
        padding-right: 0px;
      }
      .el-col {
        padding-bottom: $padding;
      }
      @media (min-width: 1200px) {
        .el-col:nth-child(1),
        .el-col:nth-child(2) {
          padding-right: $padding;
        }
      }
    }
  }
</style>

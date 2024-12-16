<template>
  <div class="list-page">
    <!-- 表格 -->
    <div class="card-bg table-page">
      <div class="table-page-header">
        <el-button v-if="btnList.isAdd && projectInfo.status < 2" type="primary" @click="BidAdd"
          ><IconPlus></IconPlus>添加税款</el-button
        >
      </div>

      <!-- 表格数据 -->
      <el-table v-loading="Loading" :data="tableData">
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
            <template v-if="item.prop == 'tax'">￥{{ scope.row.tax }}</template>
            <template v-if="item.prop == 'taxDateTime'">{{ dateFormat(scope.row.taxDateTime) }}</template>
            <template v-if="item.prop == 'prepay'">{{ ["否", "是"][scope.row.prepay] }}</template>
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
                      修改税款
                    </el-dropdown-item>
                    <el-dropdown-item v-if="btnList.isDelete && projectInfo.status < 2" @click="ContractDelete(scope.row)">
                      删除税款
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
        @change="GetByProjectId" />
    </div>
  </div>
  <!--税额 添加 修改  查看 对话框 -->
  <EditAddTax ref="EditAddTaxRef" @update="GetByProjectId"></EditAddTax>
</template>

<script setup lang="ts" name="ProjectTax">
  import { ref, onMounted } from "vue"
  import { ElMessage, ElMessageBox } from "element-plus"

  import Pagination from "@/components/Pagination/index.vue"
  import type { taxInter } from "@/api/project/tax/types.ts"
  //税额 添加 修改  查看 对话框
  import EditAddTax from "./components/EditAddTax.vue"
  //getByProjectId 获取缴税列表 deleteTax 删除缴税
  import { getByProjectId, deleteTax } from "@/api/project/tax/index.ts"
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
  const Loading = ref(false)
  /**存放 表 数据*/
  const tableData = ref<taxInter[]>([])
  //获取缴税列表
  const GetByProjectId = () => {
    getByProjectId({
      projectId: sessionStorage.projectId,
      page: PaginationConfiguration.value.current,
      size: PaginationConfiguration.value.pagesize
    })
      .then((res: any) => {
        tableData.value = res.data.data.records
        PaginationConfiguration.value.total = res.data.data.total
      })
      .finally(() => {
        Loading.value = false
      })
  }

  /**表 框架*/
  const columns = [
    { prop: "typeName", label: "缴税类型", width: 100 },
    { prop: "tax", label: "缴税金额", width: 100 },
    { prop: "taxDateTime", label: "缴税时间", width: 110 },
    { prop: "prepay", label: "是否预缴", width: 80 },
    { prop: "runnerEmployeeName", label: "经办人", width: 100 },
    { prop: "note", label: "备注", minwidth: 120 },
    { prop: "button", label: "操作", align: "center", fixed: "right", width: "150" }
  ]
  //税额 添加 修改  查看 对话框
  const EditAddTaxRef = ref<InstanceType<typeof EditAddTax>>()

  /**添加按钮*/
  const BidAdd = () => {
    if (EditAddTaxRef.value) {
      EditAddTaxRef.value.FormType = 0
      EditAddTaxRef.value.isShow = true
    }
  }

  /**修改合同*/
  const EditContract = (row: taxInter) => {
    if (EditAddTaxRef.value) {
      EditAddTaxRef.value.id = row.id
      EditAddTaxRef.value.FormType = 1
      EditAddTaxRef.value.isShow = true
    }
  }
  /**查看详细*/
  const ContractDetailed = (row: taxInter) => {
    if (EditAddTaxRef.value) {
      EditAddTaxRef.value.id = row.id
      EditAddTaxRef.value.FormType = 2
      EditAddTaxRef.value.isShow = true
    }
  }

  /**删除*/
  const ContractDelete = (row: taxInter) => {
    ElMessageBox.confirm("此操作将永久删除该项目税款，请谨慎操作！", "提示", {
      type: "warning",
      confirmButtonText: "确认删除"
    }).then(() => {
      deleteTax(row.id.toString())
        .then(() => {
          GetByProjectId()
        })
        .finally(() => {
          ElMessage.success("删除成功")
        })
    })
  }
  onMounted(() => {
    GetByProjectId()
  })
</script>

<style lang="scss" scoped></style>

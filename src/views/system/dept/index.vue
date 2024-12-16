<template>
  <div>
    <div v-loading="viewLoading" class="card-bg table-page">
      <div v-if="btnList.isAdd" class="table-page-header">
        <el-button type="primary" @click="addDept"><icon-plus />添加部门</el-button>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" row-key="id" default-expand-all>
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
            <div v-if="item.prop == 'button'" class="table-btn">
              <el-link v-if="btnList.isAdd" type="primary" :underline="false" @click="addSonDept(scope.row.id)">
                添加子部门
              </el-link>

              <!-- 更多下拉框（第一行根部门，不显示） -->
              <el-dropdown
                v-if="btnList.isUpdate || btnList.isDelete"
                v-show="scope.$index != 0"
                trigger="click"
                :hide-on-click="false">
                <el-link link type="primary" :underline="false"> 更多<icon-down /> </el-link>

                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-if="btnList.isUpdate" @click="updateDept(scope.row.id)">修改部门</el-dropdown-item>
                    <el-dropdown-item v-if="btnList.isDelete" @click="deleteDept(scope.row.id)">删除部门</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!--【对话框】添加/修改 -->
    <editAdd-dialog ref="dialogRef" @refresh="getData" />

    <!-- 【对话框】迁移/删除 -->
    <TransferDialog ref="transferRef" @refresh="getData" />
  </div>
</template>

<script setup lang="ts" name="Dept">
  import { ref, onMounted } from "vue"
  import { ElMessage, ElMessageBox } from "element-plus"
  import useAuthStore from "@/stores/modules/auth.ts"
  import type { TableInter } from "@/api/system/dept/types.ts"
  import EditAddDialog from "./components/EditAddDialog.vue"
  import TransferDialog from "./components/TransferDialog.vue"
  import * as DeptAPI from "@/api/system/dept/index.ts"

  //【实例】对话框
  const dialogRef = ref()
  const transferRef = ref()
  //【实例】权限 - pinia
  const authStore = useAuthStore()

  //【变量】页面状态 - 加载中
  const viewLoading = ref<Boolean>(false)
  //【变量】按钮权限列表
  const btnList = authStore.btnList

  //【变量】表格框架
  const columns = [
    { prop: "name", label: "部门名称", width: 200 },
    { prop: "managers", label: "部门负责人", width: 200 },
    { prop: "note", label: "部门备注", minWidth: 200 },
    { prop: "button", label: "操作", align: "center", fixed: "right", width: 150 }
  ]
  //【变量】表格数据
  const tableData = ref<TableInter[]>([])

  //【方法】获取数据
  const getData = () => {
    viewLoading.value = true
    DeptAPI.getDeptList()
      .then((res: any) => {
        tableData.value = [res.data.data]
      })
      .finally(() => {
        viewLoading.value = false
      })
  }

  //【方法】添加部门
  const addDept = () => {
    dialogRef.value.deptCascader = tableData.value
    dialogRef.value.dialogType = 0
    dialogRef.value.showDialog = true
  }
  //【方法】添加子部门
  const addSonDept = (id: number) => {
    dialogRef.value.id = id
    dialogRef.value.dialogType = 1
    dialogRef.value.showDialog = true
  }
  //【方法】修改部门
  const updateDept = (id: number) => {
    dialogRef.value.id = id
    dialogRef.value.deptCascader = tableData.value
    dialogRef.value.dialogType = 2
    dialogRef.value.showDialog = true
  }
  //【方法】删除部门
  const deleteDept = (id: number) => {
    DeptAPI.getDeptStaffTotal(id).then((res: any) => {
      const staffTotal = res.data.data

      if (staffTotal == 0) {
        // 部门旗下无员工，则直接删除
        ElMessageBox.confirm("此操作将永久删除该部门，是否继续?", "提示", { type: "warning" }).then(() => {
          DeptAPI.deleteDept({ id }).then(() => {
            ElMessage.success("删除成功")
            getData()
          })
        })
      } else {
        // 部门旗下有员工，进行迁移部门
        transferRef.value.id = id
        transferRef.value.deptCascader = tableData.value
        transferRef.value.showDialog = true
      }
    })
  }

  //【生命周期】挂载完毕
  onMounted(() => {
    getData()
  })
</script>

<style lang="scss" scoped></style>

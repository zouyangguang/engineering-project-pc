<template>
  <div>
    <!-- 查询表单 -->
    <el-row class="card-bg search-page">
      <!-- 表单内容 -->
      <el-col :lg="21" :xl="22" class="search-form">
        <el-form ref="formRef" :model="formModel" label-width="auto" label-suffix="：">
          <el-row :gutter="20">
            <el-col :lg="8" :xl="6">
              <el-form-item label="所属岗位" prop="roleId">
                <el-select v-model="formModel.roleId" placeholder="全部" filterable clearable>
                  <el-option v-for="(item, i) in postSelect" :key="i" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :lg="8" :xl="6">
              <el-form-item label="所属部门" prop="departId">
                <el-cascader
                  v-model="formModel.departId"
                  placeholder="全部"
                  :options="deptCascader"
                  :props="deptCascaderProps"
                  :show-all-levels="false"
                  filterable
                  clearable
                  @focus="getDeptList()" />
              </el-form-item>
            </el-col>

            <el-col :lg="8" :xl="6">
              <el-form-item label="入职时间" prop="entryDate">
                <el-date-picker
                  v-model="formModel.entryDate"
                  type="daterange"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  unlink-panels
                  value-format="YYYY-MM-DD HH:mm:ss"
                  :default-time="[new Date(2024, 1, 1, 0, 0, 0), new Date(2024, 1, 1, 23, 59, 59)]" />
              </el-form-item>
            </el-col>

            <el-col :lg="8" :xl="6">
              <el-form-item label-width="0" prop="name">
                <el-input v-model="formModel.name" placeholder="请填写员工姓名" :maxlength="20" clearable>
                  <template #prefix>
                    <icon-search />
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-col>

      <!-- 查询按钮 -->
      <el-col :lg="3" :xl="2" class="search-btn">
        <el-button type="primary" :loading="searchLoading" @click="searchForm"><icon-search />查询</el-button>
        <el-button color="#EEF2F6" @click="resetForm"><icon-undo />重置</el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <div v-loading="viewLoading" class="card-bg table-page">
      <div class="table-page-header">
        <div>
          <el-button v-if="btnList.isAdd" type="primary" @click="addStaff"><icon-plus />添加员工</el-button>
          <span v-if="btnList.isUpdate" v-show="chooseData.length">
            <el-divider direction="vertical" />
            <el-button type="primary" @click="transferStaff"> <icon-transfer size="16" />迁移员工至新部门 </el-button>
          </span>
        </div>
      </div>

      <!-- 表格数据 -->
      <el-table ref="tableRef" :data="tableData" row-key="id" @selection-change="selectionChange">
        <!-- 多选 -->
        <el-table-column v-if="btnList.isUpdate" type="selection" width="50" align="center" :reserve-selection="true" />

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
            <!-- 状态 -->
            <div v-if="item.prop == 'statusName'">
              <el-tag :type="['primary', 'danger'][scope.row.status]">{{ scope.row.statusName }}</el-tag>
            </div>

            <!-- 员工信息 -->
            <div v-else-if="item.prop == 'info'">
              <p>工号：{{ scope.row.id }}</p>
              <p>姓名：{{ scope.row.name }}</p>
              <p>手机号：{{ scope.row.phone }}</p>
            </div>

            <!-- 身份 -->
            <div v-else-if="item.prop == 'isManager'">
              <el-tag type="info">{{ ["普通员工", "部门负责人"][scope.row.isManager] }}</el-tag>
            </div>

            <!-- 所属岗位 -->
            <div v-else-if="item.prop == 'roleNames' && scope.row.roleNames">
              <div v-for="(item, i) in scope.row.roleNames.split(',')" :key="i" class="roleNames">
                <el-tag type="info">{{ item }}</el-tag>
              </div>
            </div>

            <!-- 所属部门 -->
            <div v-else-if="item.prop == 'departName'">
              <el-tag type="info">{{ scope.row.departName }}</el-tag>
            </div>

            <!-- 日期格式 -->
            <div v-if="item.prop == 'entryDateTime' || item.prop == 'leaveDateTime'">
              {{ dateFormat(scope.row[item.prop]) }}
            </div>

            <!-- 操作 -->
            <div v-else-if="item.prop == 'button'" class="table-btn">
              <el-link v-if="btnList.isUpdate" type="primary" :underline="false" @click="updateStaff(scope.row.id)">修改</el-link>

              <!-- 更多下拉框 -->
              <el-dropdown
                v-if="btnList.isUpdate || (btnList.isDelete && scope.row.status)"
                trigger="click"
                :hide-on-click="false">
                <el-link type="primary" :underline="false"> 更多<icon-down /> </el-link>

                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-if="btnList.isUpdate && !scope.row.status" @click="handoverStaff(scope.row.id)">
                      工作交接
                    </el-dropdown-item>
                    <el-dropdown-item v-if="btnList.isUpdate && !scope.row.status" @click="dismissStaff(scope.row.id)">
                      员工离职
                    </el-dropdown-item>
                    <el-dropdown-item v-if="btnList.isDelete && scope.row.status" @click="deleteStaff(scope.row.id)">
                      删除员工
                    </el-dropdown-item>
                    <el-dropdown-item v-if="btnList.isUpdate" divided @click="resetPwd(scope.row.id)">
                      重置密码
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
        v-model:total="tablePage.total"
        v-model:current="tablePage.current"
        v-model:pagesize="tablePage.pagesize"
        class="table-page-pagination"
        @change="getData()" />
    </div>

    <!-- 【对话框】添加/修改 -->
    <editAdd-dialog ref="dialogRef" @refresh="getData()" />

    <!-- 【对话框】工作交接 -->
    <HandoverDialog ref="handoverDialogRef" />

    <!-- 【对话框】迁移员工至新部门 -->
    <TransferDialog ref="transferDialogRef" @refresh="getData()" />
  </div>
</template>

<script setup lang="ts" name="Staff">
  import { ref, onMounted } from "vue"
  import { ElMessage, ElMessageBox } from "element-plus"
  import useAuthStore from "@/stores/modules/auth.ts"
  import type { FormInstance } from "element-plus"
  import type { SearchFormInter, TableInter } from "@/api/system/staff/types.ts"
  import { dateFormat } from "@/utils/handle.ts"
  import EditAddDialog from "./components/EditAddDialog.vue"
  import HandoverDialog from "./components/HandoverDialog.vue"
  import TransferDialog from "./components/TransferDialog.vue"
  import Pagination from "@/components/Pagination/index.vue"
  import * as StaffAPI from "@/api/system/staff/index.ts"
  import * as DeptAPI from "@/api/system/dept/index.ts"
  import * as PostAPI from "@/api/system/post/index.ts"

  //【实例】对话框
  const dialogRef = ref()
  const handoverDialogRef = ref()
  const transferDialogRef = ref()
  //【实例】权限 - pinia
  const authStore = useAuthStore()

  //【变量】页面状态 - 加载中
  const viewLoading = ref<Boolean>(false)
  //【变量】查询按钮 - 加载中
  const searchLoading = ref<Boolean>(false)
  //【变量】按钮权限列表
  const btnList = authStore.btnList

  //【实例】表格
  const tableRef = ref()
  //【变量】表格框架
  const columns = [
    { prop: "statusName", label: "状态", align: "center", width: 80 },
    { prop: "info", label: "员工信息", minWidth: 200 },
    { prop: "isManager", label: "身份", align: "center", width: 100 },
    { prop: "roleNames", label: "所属岗位", align: "center", width: 100 },
    { prop: "departName", label: "所属部门", align: "center", width: 100 },
    { prop: "entryDateTime", label: "入职时间", width: 125 },
    { prop: "leaveDateTime", label: "离职时间", width: 125 },
    { prop: "note", label: "备注", minWidth: 200 },
    { prop: "button", label: "操作", align: "center", fixed: "right", width: 125 }
  ]
  //【变量】表格数据
  const tableData = ref<TableInter[]>([])
  //【变量】选中数据
  let chooseData = ref<TableInter[]>([])
  //【变量】表格分页
  const tablePage = ref({
    current: 1,
    pagesize: 10,
    total: 0
  })
  //【方法】表格选项改变时触发
  function selectionChange(data: any) {
    chooseData.value = data.map((item: any) => item.id)
  }
  //【方法】获取员工列表
  const getData = (isRefresh?: Boolean, isFirst?: Boolean) => {
    // 判断是否刷新，重置分页 / 选中数据
    if (isRefresh) {
      viewLoading.value = true
      tablePage.value.current = 1
      tablePage.value.pagesize = 10
      tableRef.value.clearSelection()
    }

    return StaffAPI.getStaffList(formModel.value, tablePage.value)
      .then((res: any) => {
        tableData.value = res.data.data.records
        tablePage.value = {
          current: res.data.data.current,
          pagesize: res.data.data.size,
          total: res.data.data.total
        }
      })
      .finally(() => {
        viewLoading.value = isFirst!
        searchLoading.value = false
      })
  }

  //【变量】部门列表自定义配置
  const deptCascaderProps = { label: "name", value: "id", checkStrictly: true, emitPath: false }
  //【变量】部门列表
  const deptCascader = ref<any[]>([])
  //【方法】获取部门列表
  const getDeptList = () => {
    return DeptAPI.getDeptList().then((res: any) => {
      deptCascader.value = [res.data.data]
    })
  }
  //【变量】岗位列表
  const postSelect = ref<any[]>([])
  //【变量】获取岗位列表
  const getPostList = () => {
    return PostAPI.getPostList().then((res: any) => {
      postSelect.value = res.data.data
    })
  }

  //【实例】查询表单
  const formRef = ref<FormInstance>()
  //【变量】查询表单
  const formModel = ref<SearchFormInter>({
    name: null,
    departId: null,
    roleId: null,
    entryDate: null
  })
  //【方法】查询表单
  const searchForm = () => {
    searchLoading.value = true
    getData(true)
  }
  //【方法】重置表单
  const resetForm = () => {
    formRef.value?.resetFields()
  }

  //【方法】添加员工
  const addStaff = () => {
    dialogRef.value.postSelect = postSelect.value
    dialogRef.value.deptCascader = deptCascader.value
    dialogRef.value.dialogType = 0
    dialogRef.value.showDialog = true
  }
  //【方法】修改员工
  const updateStaff = (id: number) => {
    dialogRef.value.id = id
    dialogRef.value.postSelect = postSelect.value
    dialogRef.value.deptCascader = deptCascader.value
    dialogRef.value.dialogType = 1
    dialogRef.value.showDialog = true
  }
  //【方法】删除员工
  const deleteStaff = (id: number) => {
    ElMessageBox.confirm("【请确保工作已交接完成】此操作将永久删除该员工，是否继续?", "提示", { type: "warning" }).then(() => {
      StaffAPI.deleteStaff(id).then(() => {
        ElMessage.success("删除成功")
        getData(true)
      })
    })
  }
  //【方法】重置密码
  const resetPwd = (id: number) => {
    ElMessageBox.confirm("此操作将重置该员工账号密码，是否继续?", "提示", { type: "warning" }).then(() => {
      StaffAPI.resetPassword(id).then(() => {
        ElMessage.success("密码重置成功")
      })
    })
  }
  //【方法】工作交接
  const handoverStaff = (id: number) => {
    handoverDialogRef.value.id = id
    handoverDialogRef.value.showDialog = true
  }
  //【方法】员工离职
  const dismissStaff = (id: number) => {
    ElMessageBox.confirm(
      "【请确保工作已交接完成】此操作将会使账号状态修改为离职，并删除相关权限且账号无法再登入系统，是否继续?",
      "提示",
      { type: "warning" }
    ).then(() => {
      StaffAPI.dismissStaff(id).then(() => {
        ElMessage.success("账号状态修改成功")
        getData()
      })
    })
  }
  //【方法】迁移员工至新部门
  const transferStaff = () => {
    transferDialogRef.value.ids = chooseData.value
    transferDialogRef.value.deptCascader = deptCascader.value
    transferDialogRef.value.showDialog = true
  }

  //【生命周期】挂载完毕
  onMounted(() => {
    viewLoading.value = true

    Promise.all([getData(true, true), getDeptList(), getPostList()]).finally(() => {
      viewLoading.value = false
    })
  })
</script>

<style lang="scss" scoped>
  .roleNames:nth-child(n + 2) {
    margin-top: 5px;
  }
</style>

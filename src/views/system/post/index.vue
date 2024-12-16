<template>
  <div>
    <div v-loading="viewLoading" class="card-bg table-page">
      <div v-if="btnList.isAdd" class="table-page-header">
        <el-button type="primary" @click="addPost"><icon-plus />添加岗位</el-button>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData">
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
            <!-- 操作 -->
            <div v-if="item.prop == 'button'" class="table-btn">
              <el-link v-if="btnList.isUpdate" type="primary" :underline="false" @click="updatePost(scope.row.id)">修改</el-link>

              <el-link v-if="btnList.isDelete" type="danger" :underline="false" @click="deletePost(scope.row.id)">删除</el-link>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!--【抽屉】添加/修改 -->
    <edit-add-drawer ref="drawerRef" @refresh="getData" />
  </div>
</template>

<script setup lang="ts" name="Post">
  import { ref, onMounted } from "vue"
  import { ElMessage, ElMessageBox } from "element-plus"
  import useAuthStore from "@/stores/modules/auth.ts"
  import type { TableInter, ModuleListInter } from "@/api/system/post/types.ts"
  import EditAddDrawer from "./components/EditAddDrawer.vue"
  import * as DeptAPI from "@/api/system/dept/index.ts"
  import * as PostAPI from "@/api/system/post/index.ts"

  //【实例】抽屉
  const drawerRef = ref()
  //【实例】权限 - pinia
  const authStore = useAuthStore()

  //【变量】页面状态 - 加载中
  const viewLoading = ref<Boolean>(false)
  //【变量】按钮权限列表
  const btnList = authStore.btnList

  //【变量】表格框架
  const columns = [
    { prop: "name", label: "岗位名称", width: 200 },
    { prop: "note", label: "岗位备注", minWidth: 200 },
    { prop: "button", label: "操作", align: "center", fixed: "right", width: 100 }
  ]
  //【变量】表格数据
  const tableData = ref<TableInter[]>([])

  //【方法】获取岗位列表
  const getData = () => {
    return PostAPI.getPostList().then((res: any) => {
      tableData.value = res.data.data
    })
  }

  //【变量】页面权限列表
  const moduleList = ref<ModuleListInter[]>([])
  //【方法】获取页面权限列表
  const getModuleList = () => {
    return PostAPI.getModuleList().then((res: any) => {
      moduleList.value = handleModuleList(res.data.data)
    })
  }
  //【变量】部门列表
  const deptList = ref<any[]>([])
  //【方法】获取部门列表
  const getDeptList = () => {
    return DeptAPI.getDeptList().then((res: any) => {
      deptList.value = [res.data.data]
    })
  }

  //【方法】添加岗位
  const addPost = () => {
    drawerRef.value.deptList = deptList.value
    drawerRef.value.moduleTreeList = moduleList.value
    drawerRef.value.drawerType = 0
    drawerRef.value.showDrawer = true
  }
  //【方法】修改岗位
  const updatePost = (id: number) => {
    drawerRef.value.id = id
    drawerRef.value.deptList = deptList.value
    drawerRef.value.moduleTreeList = moduleList.value
    drawerRef.value.drawerType = 1
    drawerRef.value.showDrawer = true
  }
  //【方法】删除岗位
  const deletePost = (id: number) => {
    ElMessageBox.confirm("此操作将永久删除该岗位，是否继续?", "提示", { type: "warning" }).then(() => {
      PostAPI.deletePost(id).then(() => {
        ElMessage.success("删除成功")
        getData()
      })
    })
  }

  //【生命周期】挂载完毕
  onMounted(() => {
    viewLoading.value = true

    Promise.all([getData(), getModuleList(), getDeptList()]).finally(() => {
      viewLoading.value = false
    })
  })

  //【数据处理】页面权限列表
  const handleModuleList = (data: any) => {
    let newData: any = []
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      // 判断是否是叶子节点,且children为空
      if (item.isLeaf == 1 && item.children.length == 0) {
        item.children = item.allowPermission.map((items: any) => {
          switch (items) {
            case "c":
              return { id: `${item.id}_c`, moduleId: item.id, name: "添加", value: "c", isLeaf: 2 }

            case "u":
              return { id: `${item.id}_u`, moduleId: item.id, name: "修改", value: "u", isLeaf: 2 }

            case "d":
              return { id: `${item.id}_d`, moduleId: item.id, name: "删除", value: "d", isLeaf: 2 }

            case "r":
              return { id: `${item.id}_r`, moduleId: item.id, name: "查看", value: "r", isLeaf: 2 }

            case "e":
              return { id: `${item.id}_e`, moduleId: item.id, name: "导出", value: "e", isLeaf: 2 }

            default:
              ElMessage.error("权限数据处理失败，请联系开发人员")
              break
          }
        })
      }

      if (item.children) {
        handleModuleList(item.children)
      }

      newData.push(item)
    }

    return newData
  }
</script>
<style lang="scss" scoped></style>

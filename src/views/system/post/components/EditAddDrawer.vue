<template>
  <el-drawer
    v-model="showDrawer"
    :title="drawerTitle[drawerType]"
    :size="drawerWidth"
    destroy-on-close
    :close-on-click-modal="false"
    @open="drawerOpen()"
    @close="drawerClose()">
    <div v-loading="drawerLoading" class="drawer-page" :class="{ isMobile: isMobile }">
      <el-form ref="formRef" :model="formModel" :rules="formRules" label-position="top" label-width="auto" label-suffix="：">
        <el-form-item label="岗位名称" prop="name">
          <el-input v-model="formModel.name" placeholder="岗位名称" :maxlength="20" clearable />
        </el-form-item>

        <el-form-item label="备注" prop="note">
          <el-input
            v-model="formModel.note"
            type="textarea"
            placeholder="备注内容"
            :autosize="{ minRows: 3, maxRows: 3 }"
            :maxlength="250"
            show-word-limit />
        </el-form-item>

        <el-tabs v-model="tabActive" tab-position="left">
          <el-tab-pane label="页面权限" name="module">
            <!-- 说明 -->
            <el-alert
              title="页面权限："
              description="用于控制不同员工账号对特定页面及相关按钮的访问权限"
              type="info"
              show-icon
              :closable="false" />

            <!-- 树形结构 -->
            <el-form-item label-width="0" prop="modulePermissions">
              <el-tree ref="moduleTreeRef" node-key="id" :data="moduleTreeList" :props="moduleTreeProps" show-checkbox />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="数据权限" name="dept">
            <!-- 说明 -->
            <el-alert
              title="数据权限："
              description="数据权限控制不同员工账号对特定数据的访问和操作权限"
              type="info"
              show-icon
              :closable="false" />

            <!-- 树形结构 -->
            <el-form-item label-width="0" prop="dataPermissions">
              <el-tree ref="deptTreeRef" node-key="id" :data="deptList" :props="deptTreeProps" show-checkbox />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="showDrawer = false">取消</el-button>
      <el-button v-if="drawerType == 0" type="primary" :loading="subLoading" @click="Addbtn()">确认添加</el-button>
      <el-button v-if="drawerType == 1" type="warning" :loading="subLoading" @click="updateBtn()">确认修改</el-button>
    </template>
  </el-drawer>
</template>
<script setup lang="ts" name="EditAddDrawer">
  import { ref, reactive, computed } from "vue"
  import { ElMessage } from "element-plus"
  import type { FormInstance, FormRules } from "element-plus"
  import type { RoleFormInter, ModuleListInter } from "@/api/system/post/types.ts"
  import type { TableInter } from "@/api/system/dept/types.ts"
  import useGlobalStore from "@/stores/modules/global.ts"
  import * as PostAPI from "@/api/system/post/index.ts"

  //【实例】全局状态
  const globalStore = useGlobalStore()
  //【变量】是否是移动端
  const isMobile = ref(globalStore.isMobile)

  //【变量】是否显示抽屉 - true显示 / false隐藏
  const showDrawer = ref<Boolean>(false)
  //【变量】抽屉宽度
  const drawerWidth = computed(() => {
    return isMobile.value ? "100%" : "40%"
  })
  //【变量】抽屉类型 - 0添加 / 1修改
  const drawerType = ref<number>(0)
  //【变量】抽屉标题
  const drawerTitle = ["添加岗位", "修改岗位"]
  //【变量】抽屉状态 - 加载中
  const drawerLoading = ref<Boolean>(false)
  //【变量】提交按钮状态 - 加载中
  const subLoading = ref<Boolean>(false)

  //【变量】当前岗位ID
  const id = ref<number>()
  //【变量】当前标签页
  const tabActive = ref<string>("module")
  //【实例】页面权限树形组件
  const moduleTreeRef = ref()
  //【变量】页面权限树形结构配置
  const moduleTreeProps = { label: "name" }
  //【变量】页面权限列表
  const moduleTreeList = ref<ModuleListInter[]>([])
  //【变量】数据权限
  const deptTreeRef = ref()
  //【变量】数据权限树形结构配置
  const deptTreeProps = { label: "name" }
  //【变量】数据权限列表
  const deptList = ref<TableInter[]>([])

  //【方法】打开对话框
  const drawerOpen = () => {
    if (drawerType.value) {
      drawerLoading.value = true
      PostAPI.getPostDetail(id.value!)
        .then((res: any) => {
          formModel.value = res.data.data

          handleGetModuleData()
          deptTreeRef.value.setCheckedKeys(res.data.data.dataPermissions)
        })
        .finally(() => {
          drawerLoading.value = false
        })
    }
  }
  //【方法】关闭对话框
  const drawerClose = () => {
    //重置标签页
    tabActive.value = "module"
    // 清空表单
    formRef.value?.resetFields()
    // 清空已选中的页面权限
    moduleTreeRef.value.setCheckedKeys([])
    // 清空已选中的数据权限
    deptTreeRef.value.setCheckedKeys([])
  }

  //【实例】表单
  const formRef = ref<FormInstance>()
  //【变量】表单数据
  let formModel = ref<RoleFormInter>({
    name: "",
    note: "",
    modulePermissions: [],
    dataPermissions: []
  })
  //【变量】表单限制
  const formRules = reactive<FormRules<RoleFormInter>>({ name: [{ required: true, message: "请填写岗位名称", trigger: "blur" }] })

  //【方法】添加岗位
  const Addbtn = async () => {
    // 处理页面权限
    handleSetModuleData()
    if (!formModel.value.modulePermissions.length) {
      return ElMessage.error("添加失败，请配置页面权限")
    }

    // 处理数据权限
    formModel.value.dataPermissions = deptTreeRef.value.getCheckedKeys()
    if (!formModel.value.dataPermissions.length) {
      return ElMessage.error("添加失败，请配置数据权限")
    }

    await formRef.value?.validate(valid => {
      if (valid) {
        subLoading.value = true
        PostAPI.addPost(formModel.value)
          .then(() => {
            showDrawer.value = false
            ElMessage.success("添加成功")

            emit("refresh")
          })
          .finally(() => {
            subLoading.value = false
          })
      } else {
        ElMessage.error("添加失败，请填写岗位名称")
      }
    })
  }
  //【方法】修改岗位
  const updateBtn = async () => {
    // 处理页面权限
    handleSetModuleData()
    if (!formModel.value.modulePermissions.length) {
      return ElMessage.error("添加失败，请配置页面权限")
    }

    // 处理数据权限
    formModel.value.dataPermissions = deptTreeRef.value.getCheckedKeys()
    if (!formModel.value.dataPermissions.length) {
      return ElMessage.error("添加失败，请配置数据权限")
    }

    await formRef.value?.validate(valid => {
      if (valid) {
        subLoading.value = true

        PostAPI.updatePost(formModel.value)
          .then(() => {
            showDrawer.value = false
            ElMessage.success("修改成功")

            emit("refresh")
          })
          .finally(() => {
            subLoading.value = false
          })
      } else {
        ElMessage.error("修改失败，请按照提示完成输入")
      }
    })
  }

  // 向父组件传递事件
  const emit = defineEmits<{
    refresh: [void]
  }>()

  // 暴露给父组件
  defineExpose({ id, moduleTreeList, deptList, drawerType, showDrawer })

  //【数据处理】提交页面权限
  const handleSetModuleData = () => {
    const data = moduleTreeRef.value.getCheckedNodes()

    const newData: any = []
    data.forEach((item: any) => {
      // 判断新数组内的对象ID，是否已存在
      const isExist = newData.find((items: any) => items.moduleId == item.moduleId)

      if (!isExist && item.isLeaf == 2) {
        // 不存在，创建对象
        newData.push({
          moduleId: item.moduleId,
          value: "".concat(item.value),
          c: +item.value.includes("c"),
          u: +item.value.includes("u"),
          d: +item.value.includes("d"),
          r: +item.value.includes("r"),
          e: +item.value.includes("e")
        })
      } else {
        // 已存在，添加数据
        newData.forEach((items: any) => {
          if (items.moduleId == item.moduleId && item.isLeaf == 2) {
            items.value = items.value.concat(item.value)
            items.c = +items.value.includes("c")
            items.u = +items.value.includes("u")
            items.d = +items.value.includes("d")
            items.r = +items.value.includes("r")
            items.e = +items.value.includes("e")
          }
        })
      }
    })

    formModel.value.modulePermissions = newData
  }

  //【数据处理】回显页面权限
  const handleGetModuleData = () => {
    let data = formModel.value.modulePermissions

    let newData: any = []
    data.forEach((item: any) => {
      for (const key in item) {
        // 判断是否为权限
        if (key.length == 1) {
          // 生成 Tree 组件回显所需的格式
          if (key == "c" && item[key] === 1) {
            newData.push({ id: `${item.moduleId}_c`, moduleId: item.moduleId, name: "添加", value: "c", isLeaf: 2 })
          } else if (key == "u" && item[key] === 1) {
            newData.push({ id: `${item.moduleId}_u`, moduleId: item.moduleId, name: "修改", value: "u", isLeaf: 2 })
          } else if (key == "d" && item[key] === 1) {
            newData.push({ id: `${item.moduleId}_d`, moduleId: item.moduleId, name: "添加", value: "c", isLeaf: 2 })
          } else if (key == "r" && item[key] === 1) {
            newData.push({ id: `${item.moduleId}_r`, moduleId: item.moduleId, name: "删除", value: "d", isLeaf: 2 })
          } else if (key == "e" && item[key] === 1) {
            newData.push({ id: `${item.moduleId}_e`, moduleId: item.moduleId, name: "查看", value: "r", isLeaf: 2 })
          }
        }
      }
    })

    moduleTreeRef.value.setCheckedNodes(newData)
  }
</script>
<style scoped></style>

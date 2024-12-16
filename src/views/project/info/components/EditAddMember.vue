<template>
  <el-dialog
    v-model="isShow"
    align-center
    width="600"
    title="项目成员管理"
    destroy-on-close
    :close-on-click-modal="false"
    @open="dialogOpen"
    @close="dialogClose">
    <el-form ref="dialogFormRef" v-loading="Loading" class="dialog-form dialog-page" label-width="auto" :model="DialogForm">
      <el-form-item prop="principalName">
        <el-transfer
          v-model="DialogForm.members"
          :props="{
            key: 'id',
            label: 'name'
          }"
          :data="staffList"
          filterable
          :titles="['员工列表', '项目成员']"
          filter-placeholder="输入员工姓名查询" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div>
        <el-button @click="isShow = false">取消</el-button>
        <el-button type="primary" @click="editBtn">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="EditAddMember">
  import { ElMessage } from "element-plus"
  import { reactive, ref, defineExpose } from "vue"
  import type { FormInstance } from "element-plus"
  // getStaffList 搜索 成员
  import { getStaffList } from "@/api/system/staff/index.ts"
  //  getMembers 查询项目组成员 updateMember 修改项目成员
  import { getMembers, updateMember } from "@/api/project/info/index.ts"
  const Loading = ref(false)

  // 获取项目成员
  const GetMembers = (id: string) => {
    Loading.value = true
    getMembers(id)
      .then((res: any) => {
        DialogForm.members = res.data.data.map((obj: any) => obj.id.toString())
      })
      .finally(() => {
        Loading.value = false
      })
  }

  //搜索员工
  const GetStaff = (query: string) => {
    Loading.value = true
    getStaffList({ name: query }, { current: 1, pagesize: 100 })
      .then((res: any) => {
        staffList.value = res.data.data.records
      })
      .finally(() => {
        Loading.value = false
      })
  }

  // 员工列表
  const staffList = ref([])

  /**控制对话框显示隐藏*/
  const isShow = ref<boolean>(false)

  const id = ref<string>()
  /**对话框 表单实例*/
  const dialogFormRef = ref<FormInstance>()
  /**对话框 表单数据*/
  const DialogForm = reactive({ members: [] })
  // 向父组件传递事件，定义事件
  const emit = defineEmits(["update"])
  // 保存修改按钮
  const editBtn = () => {
    updateMember({ id: id.value, members: DialogForm.members })
      .then(() => {
        ElMessage({
          message: "保存成功",
          type: "success"
        })
      })
      .finally(() => {
        isShow.value = false
        emit("update")
      })
  }
  //	Dialog 打开的回调
  const dialogOpen = () => {
    GetStaff("")
    GetMembers(id.value as string)
  }
  //Dialog 关闭的回调
  const dialogClose = () => {
    //清空表单
    dialogFormRef.value?.resetFields()
  }
  defineExpose({
    isShow,
    id
  })
</script>

<style lang="scss" scoped></style>

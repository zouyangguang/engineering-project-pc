<template>
  <el-dialog
    v-model="showDialog"
    title="迁移员工至新部门"
    width="400"
    align-center
    destroy-on-close
    :close-on-click-modal="false"
    @close="dialogClose">
    <div class="dialog-page">
      <el-form ref="formRef" label-width="auto" label-suffix="：" :model="formModel" :rules="formRules">
        <el-form-item label="迁移部门" prop="destDepartId">
          <el-cascader
            v-model="formModel.destDepartId"
            placeholder="迁移部门"
            :options="deptCascader"
            :props="deptCascaderProps"
            :show-all-levels="false"
            filterable
            clearable />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" :loading="subLoading" @click="subForm()">确认迁移</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="EditAddDialog">
  import { reactive, ref } from "vue"
  import { ElMessage } from "element-plus"
  import type { FormInstance, FormRules } from "element-plus"
  import type { transferFormInter } from "@/api/system/staff/types.ts"
  import * as StaffAPI from "@/api/system/staff/index.ts"

  // 【变量】是否显示对话框 - true显示 / false隐藏
  const showDialog = ref<Boolean>(false)
  //【变量】提交按钮状态 - 加载中
  const subLoading = ref<Boolean>(false)

  //【变量】选择的员工ID
  const ids = ref<number[]>()
  //【变量】部门列表结构配置
  const deptCascaderProps = { label: "name", value: "id", checkStrictly: true, emitPath: false }
  //【变量】部门列表
  const deptCascader = ref<any>([])

  //【方法】关闭对话框
  const dialogClose = () => {
    // 清空表单
    formRef.value?.resetFields()
    // 清空部门列表
    deptCascader.value = []
  }

  //【实例】表单
  const formRef = ref<FormInstance>()
  //【变量】表单数据
  const formModel = ref<transferFormInter>({
    destDepartId: null,
    employees: null
  })
  //【变量】表单限制
  const formRules = reactive<FormRules<transferFormInter>>({
    destDepartId: [{ required: true, message: "请选择迁移部门", trigger: "change" }]
  })

  //【方法】提交表单
  const subForm = async () => {
    await formRef.value?.validate(valid => {
      if (valid) {
        subLoading.value = true
        formModel.value.employees = ids.value!
        StaffAPI.transferStaff(formModel.value)
          .then(() => {
            showDialog.value = false
            ElMessage.success("迁移成功")

            emit("refresh")
          })
          .finally(() => {
            subLoading.value = false
          })
      } else {
        ElMessage.error("迁移失败，请按照提示完成输入")
      }
    })
  }

  // 向父组件传递事件
  const emit = defineEmits<{
    refresh: [void]
  }>()

  // 暴露给父组件
  defineExpose({
    ids,
    deptCascader,
    showDialog
  })
</script>

<style lang="scss" scoped></style>

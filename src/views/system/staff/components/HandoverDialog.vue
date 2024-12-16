<template>
  <el-dialog
    v-model="showDialog"
    title="工作交接"
    width="400"
    align-center
    destroy-on-close
    :close-on-click-modal="false"
    @close="dialogClose">
    <div class="dialog-page">
      <el-form ref="formRef" label-width="auto" label-suffix="：" :model="formModel" :rules="formRules">
        <el-form-item label="交接员工" prop="targetEmployeeId">
          <el-select
            v-model="formModel.targetEmployeeId"
            placeholder="交接员工"
            :loading="selectLoading"
            remote
            :remote-method="getStaffList"
            filterable
            clearable>
            <el-option v-for="(item, i) in staffSelect" :key="i" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" :loading="subLoading" @click="subForm()">确认交接</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="EditAddDialog">
  import { reactive, ref } from "vue"
  import { ElMessage } from "element-plus"
  import type { FormInstance, FormRules } from "element-plus"
  import type { HandoverFormInter } from "@/api/system/staff/types.ts"
  import * as StaffAPI from "@/api/system/staff/index.ts"

  // 【变量】是否显示对话框 - true显示 / false隐藏
  const showDialog = ref<Boolean>(false)
  //【变量】选择器状态 - 加载中
  const selectLoading = ref<Boolean>(false)
  //【变量】提交按钮状态 - 加载中
  const subLoading = ref<Boolean>(false)

  //【变量】当前员工ID
  const id = ref<number>()
  //【变量】员工列表
  const staffSelect = ref<any[]>([])
  //【方法】获取员工列表
  const getStaffList = (name?: string) => {
    selectLoading.value = true
    StaffAPI.getStaffList({ name }, { current: 1, pagesize: 100 })
      .then((res: any) => {
        staffSelect.value = res.data.data.records
      })
      .finally(() => {
        selectLoading.value = false
      })
  }

  //【方法】关闭对话框
  const dialogClose = () => {
    // 清空表单
    formRef.value?.resetFields()
    //清空员工列表
    staffSelect.value = []
  }

  //【实例】表单
  const formRef = ref<FormInstance>()
  //【变量】表单数据
  const formModel = ref<HandoverFormInter>({
    sourceEmployeeId: null,
    targetEmployeeId: null
  })
  //【变量】表单限制
  const formRules = reactive<FormRules<HandoverFormInter>>({
    targetEmployeeId: [{ required: true, message: "请选择交接员工", trigger: "change" }]
  })

  //【方法】提交表单
  const subForm = async () => {
    await formRef.value?.validate(valid => {
      if (valid) {
        subLoading.value = true
        formModel.value.sourceEmployeeId = id.value
        StaffAPI.handoverStaff(formModel.value)
          .then(() => {
            showDialog.value = false
            ElMessage.success("工作交接完成")
          })
          .finally(() => {
            subLoading.value = false
          })
      } else {
        ElMessage.error("交接失败，请按照提示完成输入")
      }
    })
  }

  // 暴露给父组件
  defineExpose({
    id,
    showDialog
  })
</script>

<style lang="scss" scoped></style>

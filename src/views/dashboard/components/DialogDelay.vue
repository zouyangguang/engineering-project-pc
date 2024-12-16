<template>
  <el-dialog
    v-model="showDialog"
    title="延缓项目"
    width="400"
    align-center
    destroy-on-close
    :close-on-click-modal="false"
    @open="dialogOpen"
    @close="dialogClose">
    <div class="dialog-page">
      <el-form ref="formRef" label-width="auto" label-suffix="：" :model="formModel" :rules="formRules">
        <el-form-item label="预期截止日期" prop="expectFinishDateTime">
          <el-date-picker
            v-model="formModel.expectFinishDateTime"
            value-format="YYYY-MM-DD 23:59:59"
            type="date"
            placeholder="选择日期"
            clearable />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="showDialog = false"> 取消 </el-button>
      <el-button type="warning" :loading="subLoading" @click="subForm"> 确认修改 </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref } from "vue"
  import { ElMessage } from "element-plus"
  import type { FormInstance, FormRules } from "element-plus"
  import type { DialogFormInter } from "@/api/project/default/types"
  import * as ProjectAPI from "@/api/project/default/index.ts"

  //【变量】是否显示对话框 - true显示 / false隐藏
  const showDialog = ref<Boolean>(false)
  //【变量】提交按钮状态 - 加载中
  const subLoading = ref<Boolean>(false)
  //【变量】项目ID
  const projectId = ref<string>("")
  //【方法】打开对话框
  function dialogOpen() {
    showDialog.value = true

    ProjectAPI.getOne(projectId.value)
      .then((res: any) => {
        formModel.value = res.data.data
      })
      .finally(() => {
        //showDialog.value = false
      })
  }
  // 【方法】关闭对话框
  function dialogClose() {
    // 清空表单
    formRef.value?.resetFields()
  }

  // 【实例】表单
  const formRef = ref<FormInstance>()
  // 【变量】表单数据
  const formModel = ref<DialogFormInter>({
    name: "",
    typeId: "",
    principalId: "",
    expectFinishDateTime: "",
    isFieldProject: 0,
    members: [],
    note: ""
  })
  // 【变量】表单限制
  const formRules = ref<FormRules<DialogFormInter>>({
    expectFinishDateTime: [{ required: true, message: "请选择预期截止日期", trigger: "change" }]
  })

  // 【方法】提交表单
  async function subForm() {
    await formRef.value?.validate(valid => {
      if (valid) {
        showDialog.value = true

        ProjectAPI.updateProjec(formModel.value)
          .then(() => {
            ElMessage.success("延缓成功")
          })
          .finally(() => {
            showDialog.value = false

            emit("update")
          })
      } else {
        ElMessage.error("延缓失败，请选择预期截止日期")
      }
    })
  }

  // 向父组件传递事件
  const emit = defineEmits(["update"])

  // 暴露给父组件
  defineExpose({ showDialog, projectId })
</script>

<style lang="scss" scoped></style>

<template>
  <el-dialog
    v-model="showDialog"
    title="迁移 / 删除部门"
    width="400"
    align-center
    destroy-on-close
    :close-on-click-modal="false"
    @open="dialogOpen"
    @close="dialogClose">
    <div v-loading="viewLoading" class="dialog-page">
      <el-alert class="alert" title="删除部门，需将旗下员工迁移至新部门" type="info" show-icon :closable="false" />

      <el-form ref="formRef" label-width="auto" label-suffix="：" :model="formModel" :rules="formRules">
        <el-form-item label="当前部门" prop="name">
          <el-input v-model="formModel.name" placeholder="当前部门" disabled clearable />
        </el-form-item>

        <el-form-item label="迁移部门" prop="newId">
          <el-cascader
            v-model="formModel.newId"
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
        <el-button type="danger" :loading="subLoading" @click="transferBtn()">确认迁移并删除</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="EditAddDialog">
  import { reactive, ref } from "vue"
  import { ElMessage } from "element-plus"
  import type { FormInstance, FormRules } from "element-plus"
  import type { transferDeptFormInter } from "@/api/system/dept/types.ts"
  import * as DeptAPI from "@/api/system/dept/index.ts"

  // 【变量】是否显示对话框 - true显示 / false隐藏
  const showDialog = ref<Boolean>(false)
  //【变量】页面状态 - 加载中
  const viewLoading = ref<Boolean>(false)
  //【变量】提交按钮状态 - 加载中
  const subLoading = ref<Boolean>(false)

  //【变量】当前部门ID
  const id = ref<number>()
  //【变量】部门列表自定义配置
  const deptCascaderProps = { label: "name", value: "id", checkStrictly: true, emitPath: false }
  //【变量】部门列表
  const deptCascader = ref<any>([])

  //【方法】打开对话框
  const dialogOpen = () => {
    viewLoading.value = true

    // 获取部门详情
    DeptAPI.getDeptDetail(id.value!)
      .then((res: any) => {
        formModel.value = res.data.data
      })
      .finally(() => {
        viewLoading.value = false
      })
  }
  //【方法】关闭对话框
  const dialogClose = () => {
    id.value = 0
    deptCascader.value = []
    formRef.value?.resetFields()
  }

  //【实例】表单
  const formRef = ref<FormInstance>()
  //【变量】表单数据
  const formModel = ref<transferDeptFormInter>({
    id: 1,
    newId: ""
  })
  //【变量】表单限制
  const formRules = reactive<FormRules<transferDeptFormInter>>({
    newId: [
      {
        required: true,
        message: "请选择迁移部门",
        trigger: "blur"
      }
    ]
  })

  //【方法】迁移部门员工
  const transferBtn = async () => {
    await formRef.value?.validate(valid => {
      if (valid) {
        subLoading.value = true
        DeptAPI.deleteDept(formModel.value)
          .then(() => {
            showDialog.value = false
            ElMessage.success("迁移并删除成功")

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
    id,
    deptCascader,
    showDialog
  })
</script>

<style lang="scss" scoped>
  .alert {
    margin-bottom: 15px;
  }
</style>

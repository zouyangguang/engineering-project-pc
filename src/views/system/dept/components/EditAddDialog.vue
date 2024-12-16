<template>
  <el-dialog
    v-model="showDialog"
    :title="titleList[dialogType]"
    width="400"
    align-center
    destroy-on-close
    :close-on-click-modal="false"
    @open="dialogOpen"
    @close="dialogClose">
    <div v-loading="viewLoading" class="dialog-page">
      <el-form ref="formRef" label-width="auto" label-suffix="：" :model="formModel" :rules="formRules">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="formModel.name" placeholder="部门名称" :maxlength="20" clearable />
        </el-form-item>

        <el-form-item v-show="dialogType != 1" label="上级部门" prop="parentId">
          <el-cascader
            v-model="formModel.parentId"
            placeholder="上级部门"
            :options="deptCascader"
            :props="deptCascaderProps"
            :show-all-levels="false"
            filterable
            clearable />
        </el-form-item>

        <el-form-item label="备注" prop="note">
          <el-input
            v-model="formModel.note"
            :rows="4"
            resize="none"
            show-word-limit
            type="textarea"
            placeholder="备注内容"
            maxlength="250" />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button v-if="dialogType < 2" type="primary" :loading="subLoading" @click="Addbtn()">确认添加</el-button>
        <el-button v-if="dialogType == 2" type="warning" :loading="subLoading" @click="updateBtn()">确认修改</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="EditAddDialog">
  import { reactive, ref } from "vue"
  import { ElMessage } from "element-plus"
  import type { FormInstance, FormRules } from "element-plus"
  import type { DeptFormInter } from "@/api/system/dept/types.ts"
  import * as DeptAPI from "@/api/system/dept/index.ts"

  // 【变量】是否显示对话框 - true显示 / false隐藏
  const showDialog = ref<Boolean>(false)
  //【变量】对话框类型 - 0添加 / 1修改
  const dialogType = ref<number>(0)
  //【变量】对话框标题
  const titleList = ["添加部门", "添加子部门", "修改部门"]
  //【变量】页面状态 - 加载中
  const viewLoading = ref<Boolean>(false)
  //【变量】提交按钮状态 - 加载中
  const subLoading = ref<Boolean>(false)

  //【变量】当前部门ID
  const id = ref<number>()
  //【变量】部门列表结构配置
  const deptCascaderProps = { label: "name", value: "id", checkStrictly: true, emitPath: false }
  //【变量】部门列表
  const deptCascader = ref<any>([])

  //【方法】打开对话框
  const dialogOpen = () => {
    if (dialogType.value == 1) {
      // 添加子部门，无需选择上级部门直接赋值当前部门ID
      formModel.value.parentId = id.value
    }

    if (dialogType.value > 1) {
      // 修改部门，获取部门详情
      viewLoading.value = true

      DeptAPI.getDeptDetail(id.value!)
        .then((res: any) => {
          formModel.value = res.data.data
        })
        .finally(() => {
          viewLoading.value = false
        })
    }
  }
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
  const formModel = ref<DeptFormInter>({
    name: "",
    parentId: "",
    note: ""
  })
  //【变量】表单限制
  const formRules = reactive<FormRules<DeptFormInter>>({
    name: [{ required: true, message: "请填写部门名称", trigger: "blur" }],
    parentId: [{ required: true, message: "请选择上级部门", trigger: "blur" }]
  })

  //【方法】添加部门
  const Addbtn = async () => {
    await formRef.value?.validate(valid => {
      if (valid) {
        subLoading.value = true
        DeptAPI.addDept(formModel.value)
          .then(() => {
            showDialog.value = false
            ElMessage.success("添加成功")

            emit("refresh")
          })
          .finally(() => {
            subLoading.value = false
          })
      } else {
        ElMessage.error("添加失败，请按照提示完成输入")
      }
    })
  }
  //【方法】修改部门
  const updateBtn = async () => {
    await formRef.value?.validate(valid => {
      if (valid) {
        subLoading.value = true
        DeptAPI.updateDept(formModel.value)
          .then(() => {
            showDialog.value = false
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
  defineExpose({
    id,
    deptCascader,
    dialogType,
    showDialog
  })
</script>

<style lang="scss" scoped></style>

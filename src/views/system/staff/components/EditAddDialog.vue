<template>
  <el-dialog
    v-model="showDialog"
    :title="!dialogType ? '添加员工 ' : '修改员工'"
    align-center
    width="400"
    destroy-on-close
    :close-on-click-modal="false"
    @close="dialogClose"
    @open="dialogOpen">
    <div v-loading="viewLoading" class="dialog-page">
      <el-form ref="formRef" :model="formModel" :rules="formRules" label-width="auto">
        <el-form-item label="身份" prop="isManager" required>
          <el-radio-group v-model="formModel.isManager">
            <el-radio :value="0">普通员工</el-radio>
            <el-radio :value="1">部门负责人</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="姓名" prop="name">
          <el-input v-model="formModel.name" placeholder="员工姓名" :maxlength="20" clearable />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formModel.phone" placeholder="手机号" :maxlength="11" clearable />
        </el-form-item>

        <el-form-item label="入职时间" prop="entryDateTime">
          <el-date-picker
            v-model="formModel.entryDateTime"
            placeholder="选择时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="new Date(2024, 1, 1, 0, 0, 0)" />
        </el-form-item>

        <el-form-item label="所属岗位" prop="roles">
          <el-select v-model="formModel.roles" placeholder="所属岗位" filterable multiple clearable>
            <el-option v-for="(item, i) in postSelect" :key="i" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="所属部门" prop="departId">
          <el-cascader
            v-model="formModel.departId"
            placeholder="所属部门"
            :options="deptCascader"
            :props="deptCascaderProps"
            :show-all-levels="false"
            filterable
            clearable />
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
      </el-form>
    </div>

    <template #footer>
      <div>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button v-if="dialogType == 0" type="primary" :loading="subLoading" @click="AddBtn()">确认添加</el-button>
        <el-button v-if="dialogType == 1" type="warning" :loading="subLoading" @click="updateBtn()">确认修改</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="EditAddDialog">
  import { reactive, ref, defineExpose } from "vue"
  import { ElMessage } from "element-plus"
  import type { FormInstance, FormRules } from "element-plus"
  import type { StaffFormInter } from "@/api/system/staff/types.ts"
  import * as StaffAPI from "@/api/system/staff/index.ts"

  // 【变量】是否显示对话框 - true显示 / false隐藏
  const showDialog = ref<Boolean>(false)
  //【变量】对话框类型 - 0添加 / 1修改
  const dialogType = ref<number>(0)
  //【变量】页面状态 - 加载中
  const viewLoading = ref<Boolean>(false)
  // 【变量】提交按钮状态 - 加载中
  const subLoading = ref<Boolean>(false)

  //【变量】当前员工ID
  const id = ref<number>()
  //【变量】部门列表结构配置
  const deptCascaderProps = { label: "name", value: "id", checkStrictly: true, emitPath: false }
  //【变量】部门列表
  const deptCascader = ref<any[]>([])
  //【变量】岗位列表
  const postSelect = ref<any[]>([])

  //【方法】打开对话框
  const dialogOpen = () => {
    if (dialogType.value === 1) {
      // 修改员工，获取员工详情
      viewLoading.value = true

      StaffAPI.getStaffDetail(id.value!)
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
    //清空表单
    formRef.value?.resetFields()
    // 清空部门列表
    deptCascader.value = []
    // 清空岗位列表
    postSelect.value = []
  }

  //【实例】表单
  const formRef = ref<FormInstance>()
  //【变量】表单数据
  const formModel = ref<StaffFormInter>({
    name: "",
    phone: "",
    idCard: "",
    entryDateTime: "",
    departId: null,
    roles: [],
    isManager: 0,
    note: ""
  })
  //【变量】表单限制
  const formRules = reactive<FormRules<StaffFormInter>>({
    name: [{ required: true, message: "请填写员工姓名", trigger: "blur" }],
    phone: [
      { required: true, message: "请填写员工手机号", trigger: "blur" },
      {
        pattern: /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/,
        message: "请填写正确的手机号码",
        trigger: "blur"
      }
    ],
    entryDateTime: [{ required: true, message: "请选择入职时间", trigger: "change" }],
    departId: [{ required: true, message: "请选择所属部门", trigger: "change" }],
    roles: [{ required: true, message: "请选择所属岗位", trigger: "change" }]
  })

  // 【方法】添加员工
  const AddBtn = async () => {
    await formRef.value?.validate(valid => {
      if (valid) {
        subLoading.value = true
        StaffAPI.addStaff(formModel.value)
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

  // 【方法】修改员工
  const updateBtn = async () => {
    await formRef.value?.validate(valid => {
      if (valid) {
        subLoading.value = true
        StaffAPI.updateStaff(formModel.value)
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

  // 向父组件传递事件
  const emit = defineEmits<{
    refresh: [void]
  }>()

  // 暴露给父组件
  defineExpose({
    id,
    deptCascader,
    postSelect,
    dialogType,
    showDialog
  })
</script>

<style lang="scss" scoped></style>

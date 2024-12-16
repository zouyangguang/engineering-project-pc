<template>
  <el-dialog
    v-model="showDialog"
    title="修改密码"
    width="400"
    align-center
    destroy-on-close
    :close-on-click-modal="false"
    @close="dialogClose()">
    <div class="dialog-page">
      <el-form ref="formRef" label-width="auto" label-suffix="：" :model="formModel" :rules="formRules">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="formModel.oldPassword" placeholder="旧密码" :maxlength="18" show-password clearable />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="formModel.newPassword" placeholder="新密码" :maxlength="18" show-password clearable />
        </el-form-item>

        <el-form-item label="确认新密码" prop="againNewPwd">
          <el-input v-model="formModel.againNewPwd" placeholder="确认新密码" :maxlength="18" show-password clearable />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="showDialog = false"> 取消 </el-button>
      <el-button type="primary" :loading="subLoading" @click="updateBtn"> 确认修改 </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive } from "vue"
  import { ElMessage } from "element-plus"
  import type { FormInstance, FormRules } from "element-plus"
  import type { validateInter } from "@/interface"
  import type { updatePwdFormInter } from "@/api/auth/types.ts"
  import * as AuthAPI from "@/api/auth/index.ts"

  // 【变量】是否显示对话框【true显示 / false隐藏】
  const showDialog = ref<Boolean>(false)
  // 【变量】提交按钮状态【加载中】
  const subLoading = ref<Boolean>(false)

  // 【方法】关闭对话框
  function dialogClose() {
    // 清空表单
    formRef.value?.resetFields()
  }

  // 暴露给父组件
  defineExpose({ showDialog })

  /* 表单自定义验证 */
  // 新密码
  const validatePassword: validateInter = (rule, value, callback) => {
    if (value == "") {
      callback(new Error("请填写原密码"))
    } else if (value == formModel.value.oldPassword) {
      callback(new Error("新密码与旧密码相同"))
    } else {
      callback()
    }
  }

  // 确认密码
  const validateCheckPassword: validateInter = (rule, value, callback) => {
    if (value !== formModel.value.newPassword) {
      callback(new Error("两次新密码输入不一致"))
    } else {
      callback()
    }
  }
  /* 表单自定义验证 */

  // 【实例】表单
  const formRef = ref<FormInstance>()
  // 【变量】表单数据
  const formModel = ref<updatePwdFormInter>({
    oldPassword: "",
    newPassword: "",
    againNewPwd: ""
  })
  // 【变量】表单限制
  const formRules = reactive<FormRules<updatePwdFormInter>>({
    oldPassword: [{ required: true, message: "请填写原密码", trigger: "blur" }],
    newPassword: [
      { required: true, message: "请填写新密码", trigger: "blur" },
      { min: 6, max: 18, message: "密码长度6-18位", trigger: "blur" },
      {
        pattern: /^(?![\d]+$)(?![a-z]+$)(?![A-Z]+$)[\da-zA-z]{8,16}$/g,
        message: "请至少使用大写、小写字母和数字其中两种格式",
        trigger: "blur"
      },
      { validator: validatePassword, trigger: "blur" }
    ],
    againNewPwd: [
      { required: true, message: "请再次输入新密码", trigger: "blur" },
      { validator: validateCheckPassword, trigger: "blur" }
    ]
  })

  // 【方法】修改密码
  async function updateBtn() {
    await formRef.value?.validate(valid => {
      if (valid) {
        subLoading.value = true
        AuthAPI.updatePwd(formModel.value)
          .then(() => {
            showDialog.value = false
            ElMessage.success("密码修改成功，请重新登录")

            setTimeout(() => {
              emit("logout")
            }, 3000)
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
    logout: [void]
  }>()
</script>

<style lang="scss" scoped></style>

<template>
  <el-dialog
    v-model="showDialog"
    :title="dialogTitle[dialogType]"
    width="400"
    align-center
    destroy-on-close
    :close-on-click-modal="false"
    @close="dialogClose">
    <div class="dialog-page">
      <el-form ref="formRef" label-width="auto" label-suffix="：" :model="formModel">
        <el-form-item label="类型" prop="type" required>
          <el-radio-group v-model="formModel.type" placeholder="类型">
            <el-radio label="增项" :value="1" />
            <el-radio label="减项" :value="0" />
          </el-radio-group>
        </el-form-item>

        <el-form-item class="form-input-number" label="金额" prop="money" required>
          <div class="prefix">￥</div>
          <el-input-number
            v-model="formModel.money"
            placeholder="金额"
            :min="0"
            :max="999999999999"
            :precision="2"
            :value-on-clear="0"
            :controls="false"
            clearable />
        </el-form-item>

        <el-form-item label="备注" prop="note">
          <el-input
            v-model="formModel.note"
            type="textarea"
            placeholder="备注内容"
            :autosize="{ minRows: 3, maxRows: 3 }"
            maxlength="250"
            show-word-limit />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="showDialog = false"> 取消 </el-button>
      <el-button :type="['primary', 'warning'][dialogType]" :loading="subLoading" @click="subForm">
        确认{{ ["添加", "修改"][dialogType] }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref } from "vue"
  import { ElMessage } from "element-plus"
  import type { FormInstance } from "element-plus"
  import type { InDecreaseInter } from "@/api/project/contract/types.ts"

  // 【变量】是否显示对话框 - true显示 / false隐藏
  const showDialog = ref<Boolean>(false)
  //【变量】对话框类型 - 0添加，1修改
  const dialogType = ref<number>(0)
  //【变量】对话框标题
  const dialogTitle = ["添加 增 / 减项", "修改 增 / 减项"]
  //【变量】提交按钮状态 - 加载中
  const subLoading = ref<Boolean>(false)

  //【方法】关闭对话框
  function dialogClose() {
    // 清空表单
    formModel.value = {
      type: 1,
      money: 0,
      note: ""
    }
  }

  // 【实例】表单
  const formRef = ref<FormInstance>()
  // 【变量】表单数据
  const formModel = ref<InDecreaseInter>({
    type: 1,
    money: 0,
    note: ""
  })

  // 【方法】提交表单
  async function subForm() {
    await formRef.value?.validate(valid => {
      if (valid) {
        showDialog.value = false

        emit("update", dialogType.value, JSON.parse(JSON.stringify(formModel.value)))
      } else {
        ElMessage.error("修改失败，请按照提示完成输入")
      }
    })
  }

  // 向父组件传递事件
  const emit = defineEmits<{
    update: [type: number, data: any] // 更新表单(类型，表单数据)
  }>()

  // 暴露给父组件
  defineExpose({ showDialog, dialogType, formModel })
</script>

<style lang="scss" scoped>
  .form-measure {
    text-align: center;
  }
</style>

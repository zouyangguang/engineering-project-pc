<template>
  <el-dialog
    v-model="showDialog"
    :title="title"
    width="400"
    align-center
    destroy-on-close
    @open="dialogOpen()"
    @close="dialogClose()">
    <div class="dialog-page">
      <JsonViewer v-show="isJson" :value="jsonValue" :expand-depth="10" copyable />

      <p v-show="!isJson" class="empty">— 暂无数据 —</p>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref } from "vue"
  import JsonViewer from "vue-json-viewer"

  //【变量】是否显示对话框
  const showDialog = ref<Boolean>(false)
  //【变量】对话框标题
  const title = ref<string>("")

  //【变量】判断是否为 JSON 数据
  const isJson = ref<Boolean>(false)
  //【变量】接收的 JSON 数据
  const data = ref<any>()
  //【变量】显示的 JSON 数据
  const jsonValue = ref<Object>({})

  //【方法】打开对话框
  function dialogOpen() {
    // 判断 string 是否能转换为 JSON 格式的字符串
    try {
      let jsonParse = JSON.parse(data.value)

      if (typeof jsonParse === "object") {
        isJson.value = true
        jsonValue.value = jsonParse
      } else {
        isJson.value = false
      }
    } catch (error) {
      isJson.value = false
    }
  }
  // 【方法】关闭对话框
  function dialogClose() {
    isJson.value = false
    jsonValue.value = {}
  }

  // 暴露给父组件
  defineExpose({ showDialog, data, title })
</script>

<style lang="scss" scoped>
  .empty {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    font-size: 14px;
    color: var(--el-text-color-regular);
  }
</style>

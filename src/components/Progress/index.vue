<template>
  <div class="task-list">
    <div class="task-item">
      <el-progress :percentage="percentage.value" />
      <p>正在下载，请稍候...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  // 接收父组件的数据：进度条
  defineProps<{ percentage: any }>()
</script>

<style scoped>
  .task-item {
    width: 275px;

    p {
      font-size: 14px;
      color: var(--el-text-color-placeholder);
    }
  }
</style>

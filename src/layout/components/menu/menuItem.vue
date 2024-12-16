<template>
  <!-- 有内嵌菜单 -->
  <el-menu-item-group v-if="item.children" v-show="!item.meta.isHide" :title="item.meta.title">
    <el-menu-item v-for="(items, index) in item.children" v-show="!items.meta.isHide" :key="index" :index="items.path">
      <component :is="items.meta.icon" />
      <template #title>{{ items.meta.title }}</template>
    </el-menu-item>
  </el-menu-item-group>

  <!-- 无内嵌菜单 -->
  <el-menu-item v-else v-show="!item.meta.isHide" :index="item.path">
    <component :is="item.meta.icon"></component>
    <template #title>{{ item.meta.title }}</template>
  </el-menu-item>
</template>

<script setup lang="ts">
  // 接收父组件的数据：菜单列表
  defineProps<{ item: any }>()
</script>

<style lang="scss" scoped>
  .i-icon {
    padding-right: 5px;
  }
</style>

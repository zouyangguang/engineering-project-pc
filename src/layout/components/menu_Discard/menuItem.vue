<template>
  <!-- 有内嵌菜单 -->
  <el-menu-item-group v-if="item.children" :title="item.meta.title">
    <el-menu-item v-for="(items, index) in item.children" :key="index" :index="items.path" @click="routeClick(items)">
      <component :is="items.meta.icon" />
      <template #title>{{ items.meta.title }}</template>
    </el-menu-item>
  </el-menu-item-group>

  <!-- 无内嵌菜单 -->
  <el-menu-item v-else :index="item.path" @click="routeClick(item)">
    <component :is="item.meta.icon"></component>
    <template #title>{{ item.meta.title }}</template>
  </el-menu-item>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { RouteInter } from "@/interface/index.ts";

// 接收父组件的数据
defineProps<{ item: RouteInter }>();

// 路由跳转
const router = useRouter();
function routeClick(data: any) {
  router.push(data.path);
}
</script>

<style lang="scss" scoped>
.i-icon {
  padding-right: 5px;
}
</style>

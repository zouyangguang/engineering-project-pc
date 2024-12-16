<!-- 已弃用 -->
<template>
  <!-- logo -->
  <div class="logo">LOGO</div>

  <!-- 菜单 -->
  <el-menu :default-active="activeRoute">
    <MenuItem v-for="(item, i) in menuList" :key="i" :item="item" />
  </el-menu>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import useAuthStore from "@/stores/modules/auth.ts";
import MenuItem from "./menuItem.vue";

const route = useRoute();
const authStore = useAuthStore();

//当前选中菜单
const activeRoute = ref<string>(route.path);
//菜单列表
const menuList = authStore.routeList;
</script>

<style lang="scss" scoped>
.logo {
  height: $layout-header-height;
  line-height: $layout-header-height;
  text-align: center;
  font-size: 32px;
  font-weight: bold;
}
</style>

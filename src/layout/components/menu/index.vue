<template>
  <!-- logo -->
  <div class="logo">
    <img src="@/assets/images/logo.svg" alt="logo" />
  </div>

  <!-- 菜单 -->
  <el-scrollbar height="calc(100% - 90px)">
    <el-menu :default-active="activeRoute" router>
      <el-menu-item index="/dashboard">
        <icon-home-two style="padding-right: 5px" />
        <template #title>控制台</template>
      </el-menu-item>

      <MenuItem v-for="(item, i) in menuList" :key="i" :item="item" />
    </el-menu>
  </el-scrollbar>
</template>

<script setup lang="ts">
  import { ref } from "vue"
  import useAuthStore from "@/stores/modules/auth.ts"
  import MenuItem from "./menuItem.vue"

  //【实例】权限 - pinia
  const authStore = useAuthStore()
  //【变量】目录列表
  const menuList = ref(authStore.menuList)

  // 接收父组件的数据: 当前选中路由
  defineProps<{ activeRoute: string }>()
</script>

<style lang="scss" scoped>
  .logo {
    margin-bottom: 20px;
    height: $layout-header-height;
    line-height: $layout-header-height;
    text-align: center;
    font-size: 32px;
    font-weight: bold;
  }
</style>

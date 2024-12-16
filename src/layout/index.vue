<template>
  <!-- 桌面端布局 -->
  <component v-if="!isMobile" :is="LayoutDesktop"></component>

  <!-- 移动端布局 -->
  <component v-else :is="LayoutMobile"></component>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import LayoutDesktop from "./LayoutDesktop/index.vue";
import LayoutMobile from "./LayoutMobile/index.vue";
import useGlobalStore from "@/stores/modules/global.ts";

// 判断是否是移动端
const globalStore = useGlobalStore();
const isMobile = ref(globalStore.isMobile);

watch(
  () => globalStore.isMobile,
  newVal => {
    isMobile.value = newVal;
  }
);
</script>

<style lang="scss" scoped></style>

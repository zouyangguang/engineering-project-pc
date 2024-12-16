<template>
  <div class="error-page">
    <div class="svg">
      <img src="@/assets/svg/404.svg" />
    </div>

    <div class="error-text">
      <div class="error-text-oops">OOPS!</div>
      <div class="error-text-head">页面不存在...</div>
      <div class="error-text-info">请检查您输入的URL是否正确，或单击下面的按钮返回控制台</div>
      <router-link :to="{ path: '/' }">
        <span class="error-text-back-btn">返回控制台 ({{ countDown }})</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts" name="404">
  import { ref, onUnmounted } from "vue"
  import { useRouter } from "vue-router"

  // 路由实例
  const router = useRouter()

  // 倒计时
  const countDown = ref<number>(10)
  let timer = setInterval(() => {
    countDown.value--
    if (countDown.value <= 0) {
      clearInterval(timer)
      router.push("/")
    }
  }, 1000)

  //【生命周期】销毁后调用
  onUnmounted(() => {
    clearInterval(timer)
  })
</script>

<style lang="scss" scoped></style>

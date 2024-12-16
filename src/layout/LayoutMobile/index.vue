<template>
  <el-container>
    <!-- 抽屉菜单栏 -->
    <el-drawer v-model="showDrawer" size="240px" direction="ltr" append-to-body :show-close="false" :with-header="false">
      <Menu :active-route="activeRoute" />
    </el-drawer>

    <!-- 顶部导航栏 -->
    <el-header class="layout-header">
      <div class="header-left" @click="showDrawer = true">
        <!-- 菜单按钮 -->
        <div class="operator-item">
          <icon-align-text-left size="20" />
        </div>
      </div>

      <div class="header-right">
        <div class="operator">
          <!-- <el-tooltip placement="bottom" content="消息中心">
            <div class="operator-item">
              <icon-remind />
            </div>
          </el-tooltip> -->

          <el-tooltip placement="bottom" content="下载中心">
            <div class="operator-item" @click="routeGo('/download')">
              <icon-download-four />
            </div>
          </el-tooltip>

          <el-tooltip placement="bottom" content="修改密码">
            <div class="operator-item" @click="editPassword()">
              <icon-key />
            </div>
          </el-tooltip>

          <el-tooltip placement="bottom" content="退出登录">
            <div class="operator-item" @click="logout()">
              <icon-power size="18" />
            </div>
          </el-tooltip>
        </div>
      </div>
    </el-header>

    <!-- 主体内容 -->
    <el-watermark
      :content="[userInfo.name, userInfo.phone]"
      :font="{ fontSize: 14, color: 'rgba(0, 0, 0, 0.07)' }"
      :z-index="99999">
      <el-main class="layout-main">
        <router-view></router-view>
      </el-main>
    </el-watermark>
  </el-container>

  <!-- 【对话框】修改密码 -->
  <EditPassword ref="editRef" @logout="logout()" />
</template>

<script setup lang="ts">
  import { ref } from "vue"
  import { useLayouts } from "@/hooks/useLayouts"
  import useAuthStore from "@/stores/modules/auth.ts"
  import Menu from "@/layout/components/menu/index.vue"
  import EditPassword from "@/components/EditPassword/index.vue"

  // 【hooks】
  const { activeRoute, routeGo, logout } = useLayouts()
  //【实例】权限 - pinia
  const authStore = useAuthStore()
  //【变量】当前登录账号信息
  const userInfo = ref(authStore.userInfo)

  // 【变量】菜单显示状态【true显示 / false隐藏】
  const showDrawer = ref(false)

  // 【实例】对话框-修改密码
  const editRef = ref()
  // 【方法】修改密码
  function editPassword() {
    editRef.value.showDialog = true
  }
</script>

<style lang="scss" scoped>
  .layout-header {
    position: fixed;
    top: 0;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    width: 100vw;
    height: $layout-header-height;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color-page);
    z-index: 100;

    .header-left {
      display: flex;
      align-items: center;

      .operator-item {
        display: flex;
        justify-content: center;
        align-items: center;
        min-width: 40px;
        height: 40px;
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 8px;
        color: #ffffff;
        background: var(--el-color-primary);
        cursor: pointer;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      height: 100%;

      .operator {
        display: flex;

        .operator-item {
          margin-left: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-width: 40px;
          height: 40px;
          border: 1px solid var(--el-border-color-lighter);
          border-radius: 25px;
          background: #ffffff;
          cursor: pointer;

          &:hover {
            color: #ffffff;
            background: var(--el-color-primary);
          }
        }
      }
    }
  }

  .layout-main {
    margin-top: $layout-header-height;
    padding: 10px 20px 20px 20px;
  }
</style>

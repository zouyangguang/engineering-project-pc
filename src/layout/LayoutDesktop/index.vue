<template>
  <el-container>
    <!-- 侧边栏 -->
    <el-aside class="layout-sidebar">
      <Menu :active-route="activeRoute" />
    </el-aside>

    <el-container>
      <!-- 顶部导航栏 -->
      <el-header class="layout-header">
        <div class="header-left">
          <div v-show="activeRoute == '/dashboard'" style="color: #000000">控制台</div>

          <!-- 面包屑 -->
          <div v-for="(item, i) in routesList" v-show="activeRoute != '/dashboard'" :key="i">
            {{ item.meta.title }}{{ item.path === "/project/detail" ? `：${projectInfo.name}` : "" }}<span>></span>
          </div>
        </div>

        <div class="header-right">
          <!-- 用户信息 -->
          <div class="user">
            {{ helloMsg }} &nbsp; <b>{{ userInfo.name }}</b>
          </div>

          <!-- 操作 -->
          <div class="operator">
            <!--  <el-tooltip placement="bottom" content="消息中心">
              <div class="operator-item long">
                <icon-remind />
                <el-divider direction="vertical" />
                <el-badge :offset="[5, 2]">0</el-badge>
              </div>

              <el-badge is-dot :offset="[3, 3]">
                <div class="operator-item long">
                  <icon-remind />
                  <el-divider direction="vertical" />
                  99+
                </div>
              </el-badge>

              <div class="operator-item long" @click="routeGo('/download')">
                <icon-remind />
                <el-divider direction="vertical" />
                57
              </div>

              <el-badge is-dot :offset="[3, 3]">
                <div class="operator-item">
                  <icon-remind />
                </div>
              </el-badge>

              <div class="operator-item">
                <icon-remind />
              </div>
            </el-tooltip> -->

            <el-tooltip placement="bottom" content="下载中心">
              <!-- <div class="operator-item long">
                <icon-download-four />
                <el-divider direction="vertical" />
                <el-badge is-dot :offset="[5, 2]">69</el-badge>
              </div> -->

              <!-- <el-badge is-dot :offset="[3, 3]">
                <div class="operator-item long" @click="routeGo('/download')">
                  <icon-download-four />
                  <el-divider direction="vertical" />
                  77
                </div>
              </el-badge> -->

              <!-- <div class="operator-item long" @click="routeGo('/download')">
                <icon-download-four />
                <el-divider direction="vertical" />
                2
              </div> -->

              <!-- <el-badge value="2" :offset="[-2, 2]">
                <div class="operator-item" @click="routeGo('/download')">
                  <icon-download-four />
                </div>
              </el-badge> -->

              <div class="operator-item" @click="routeGo('/download')">
                <icon-download-four size="18" />
              </div>
            </el-tooltip>

            <el-tooltip placement="bottom" content="修改密码">
              <div class="operator-item" @click="editPassword()">
                <icon-key size="18" />
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
        :gap="[125, 125]"
        :z-index="99999">
        <el-scrollbar height="calc(100vh - 90px)">
          <el-main class="layout-main">
            <router-view></router-view>
          </el-main>
        </el-scrollbar>
      </el-watermark>
    </el-container>
  </el-container>

  <!-- 【对话框】修改密码 -->
  <EditPassword ref="editRef" @logout="logout()" />
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from "vue"
  import { useLayouts } from "@/hooks/useLayouts"
  import Menu from "@/layout/components/menu/index.vue"
  import EditPassword from "@/components/EditPassword/index.vue"
  import useAuthStore from "@/stores/modules/auth.ts"
  import useProjectStore from "@/stores/modules/project.ts"

  // 【实例】hooks
  const { activeRoute, routesList, routeGo, logout } = useLayouts()
  //【实例】当前登录账号信息 - pinia
  const authStore = useAuthStore()
  //【变量】当前登录账号信息
  const userInfo = ref(authStore.userInfo)

  //【实例】项目名称 - pinia
  const projectStore = useProjectStore()
  const projectInfo = ref(projectStore.info)
  // 监听项目信息变化
  watch(
    projectStore,
    newVal => {
      projectInfo.value = newVal.info
    },
    {
      deep: true,
      immediate: true
    }
  )

  // 【实例】对话框-修改密码
  const editRef = ref()
  // 【方法】修改密码
  function editPassword() {
    editRef.value.showDialog = true
  }

  //【变量】问候语
  const helloMsg = ref<string>("")

  // 【生命周期】挂载后
  onMounted(() => {
    const hour = new Date().getHours()

    if (hour < 6) {
      helloMsg.value = "夜已深，注意休息哦~"
    } else if (hour < 12) {
      helloMsg.value = "早起的虫子有鸟吃，早安啊~"
    } else if (hour < 14) {
      helloMsg.value = "愿您享受美好的午餐时光~"
    } else if (hour < 18) {
      helloMsg.value = "午后的清风，愿您心情舒畅~"
    } else if (hour < 22) {
      helloMsg.value = "祝你有一个愉快的夜晚~"
    } else {
      helloMsg.value = "夜已深，注意休息哦~"
    }
  })
</script>

<style lang="scss" scoped>
  .layout-sidebar {
    width: 200px;
    height: 100vh;
    background: #ffffff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.07);
    z-index: 999;
    overflow: hidden;
  }

  .layout-header {
    margin-bottom: 10px;
    padding: 0 30px;
    display: flex;
    justify-content: space-between;
    height: $layout-header-height;

    .header-left {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #909399;

      div {
        span {
          padding: 0 5px;
        }

        &:last-child {
          color: #131414;

          span {
            display: none;
          }
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      height: 100%;

      .user {
        font-size: 14px;
      }

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

          &.long {
            padding: 0 15px 0 10px;
          }

          &:hover {
            color: #ffffff;
            background: var(--el-color-primary);
          }
        }
      }
    }
  }

  .layout-main {
    padding: 0 20px;
  }
</style>

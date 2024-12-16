<template>
  <el-container class="detail-page" :gutter="20">
    <!-- 菜单【桌面端】 -->
    <el-aside v-if="!isMobile" class="detail-page-desktop">
      <el-menu class="detail-desktop-menu" :default-active="activeRoute" router>
        <el-menu-item v-for="(item, i) in projectMenuList" v-show="isShowMenu(item.name)" :key="i" :index="item.path">
          <template #title>{{ item.meta.title }}</template>
        </el-menu-item>
      </el-menu>

      <!-- 更改项目状态 -->
      <el-dropdown type="danger" size="large" placement="top" trigger="click">
        <div
          class="project-status"
          :class="['status-warning', 'status-primary', 'status-success', 'status-info'][projectInfo.status]">
          <p>项目状态：{{ ["准备中", "进行中", "已完成", "已废弃"][projectInfo.status] }}</p>
          <icon-ring-one size="18" />
        </div>

        <template v-if="btnList.isUpdate" #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item :disabled="projectInfo.status == 0" @click="updateProjectStatus(0)">准备中</el-dropdown-item>
            <el-dropdown-item :disabled="projectInfo.status == 1" @click="updateProjectStatus(1)">进行中</el-dropdown-item>
            <el-dropdown-item :disabled="projectInfo.status == 2" @click="updateProjectStatus(2)">已完成</el-dropdown-item>
            <el-dropdown-item :disabled="projectInfo.status == 3" @click="updateProjectStatus(3)">已废弃</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-aside>

    <!-- 菜单【移动端】 -->
    <el-header v-if="isMobile" class="detail-page-mobile">
      <el-menu mode="horizontal" :default-active="activeRoute" router>
        <el-menu-item v-for="(item, i) in projectMenuList" v-show="isShowMenu(item.name)" :key="i" :index="item.path">
          <template #title>{{ item.meta.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-header>

    <!-- 内容 -->
    <el-main class="detail-page-container" :class="{ mobile: isMobile }">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts" name="ProjectDetail">
  import { ref, watch } from "vue"
  import { useRoute } from "vue-router"
  import useAuthStore from "@/stores/modules/auth.ts"
  import useGlobalStore from "@/stores/modules/global.ts"
  import useProjectStore from "@/stores/modules/project.ts"
  import { updateProjec } from "@/api/project/default/index.ts"

  // 判断是否是移动端
  const globalStore = useGlobalStore()
  const isMobile = ref(globalStore.isMobile)

  /* 获取项目详情相关路由，组成菜单 */
  //【实例】权限 - pinia
  const authStore = useAuthStore()
  //【变量】按钮权限列表
  const btnList = authStore.btnList
  //【变量】菜单列表
  const projectMenuList = ref(authStore.projectMenuList)
  //【实例】当前路由
  const route = useRoute()
  //【变量】当前选中路由
  const activeRoute = ref<string>(route.path)
  // 监听路由变化
  watch(
    route,
    newVal => {
      activeRoute.value = newVal.path
    },
    {
      deep: true,
      immediate: true
    }
  )

  /* 项目信息 */
  //【实例】项目信息 - pinia
  const projectStore = useProjectStore()
  // 项目信息
  const projectInfo = ref<any>({})
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
  //【方法】菜单显示 - 根据业务判断
  const isShowMenu = (currentPage: any) => {
    switch (currentPage) {
      case "ProjectInfo":
        // 项目概要
        return true
      case "ProjectBid":
        // 招投标
        return true
      case "ProjectContract":
        // 合同：已中标
        return projectInfo.value.isBid
      case "ProjectCollect":
        // 回款：项目状态 - 进行中 + 已中标 + 已签订合同
        return projectInfo.value.status > 0 && projectInfo.value.isBid && projectInfo.value.isSigned
      case "ProjectExecute":
        // 工程：项目状态 - 进行中 + 已中标 + 已签订合同 + 非劳务项目
        return (
          projectInfo.value.status > 0 && projectInfo.value.isBid && projectInfo.value.isSigned && projectInfo.value.typeId != 1
        )
      case "ProjectIncome":
        // 进项：项目状态 - 进行中 + 已中标 + 已签订合同
        return projectInfo.value.status > 0 && projectInfo.value.isBid && projectInfo.value.isSigned
      case "ProjectOutgo":
        // 销项：项目状态 - 进行中 + 已中标 + 已签订合同
        return projectInfo.value.status > 0 && projectInfo.value.isBid && projectInfo.value.isSigned
      case "ProjectTax":
        // 缴税：已中标 + 已签订合同
        return projectInfo.value.isBid && projectInfo.value.isSigned
    }
  }

  //【方法】更改项目状态
  const updateProjectStatus = (status: number) => {
    const info = JSON.parse(JSON.stringify(projectInfo.value))
    info.status = status
    updateProjec(info).then(() => {
      // 重新获取项目详情
      projectStore.getProjectInfo()
    })
  }
</script>

<style lang="scss" scoped>
  .detail-page {
    .detail-page-desktop {
      position: fixed;
      top: 70px;
      left: 220px;
      width: 200px;
      height: calc(100vh - 90px);
      background-color: #fff;
      border-radius: $circle-radius;

      .detail-desktop-menu {
        height: calc(100% - 50px);
        overflow: auto;
      }

      .project-status {
        position: fixed;
        bottom: 20px;
        display: flex;
        justify-content: space-around;
        align-items: center;
        width: 200px;
        height: 50px;
        color: #fff;
        font-size: 14px;
        border-bottom-left-radius: $circle-radius;
        border-bottom-right-radius: $circle-radius;
        cursor: pointer;

        &.status-primary {
          background-color: var(--el-color-primary);
        }

        &.status-success {
          background-color: var(--el-color-success);
        }

        &.status-warning {
          background-color: var(--el-color-warning);
        }

        &.status-info {
          background-color: var(--el-color-info);
        }
      }
    }

    .detail-page-mobile {
      margin-bottom: 20px;
      background-color: #fff;
      border-radius: $circle-radius;

      .el-menu {
        margin: 0;
        padding: 0;
        border: 0;

        .el-menu-item {
          margin: 0;
          height: 100%;
          border-radius: 0;

          &:hover {
            background-color: var(--el-color-primary-light-9);
          }
          &.is-active {
            background-color: var(--el-color-primary-light-9);
          }
        }
      }
    }

    .detail-page-container {
      padding: 0;
      margin-left: 220px;

      &.mobile {
        margin: 0 !important;
      }
    }
  }
</style>

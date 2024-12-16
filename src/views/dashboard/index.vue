<template>
  <div class="dashboard">
    <!-- 常用功能 -->
    <div class="common-page">
      <div class="dashboard-header">
        <div class="dashboard-header-circle"></div>
        <div class="dashboard-header-title">常用功能</div>
      </div>

      <div class="common-page-body">
        <router-link v-for="(item, i) in commonRouters" :key="i" :to="item.path" class="common-item">{{ item.name }}</router-link>
      </div>
    </div>

    <!-- 工程月历、需要注意的工程、财报 -->
    <el-row class="project-page">
      <!-- 工程月历 -->
      <el-col :lg="10">
        <div class="dashboard-header">
          <span class="dashboard-header-circle"></span>
          <span class="dashboard-header-title">工程月历</span>
        </div>

        <div
          v-infinite-scroll="handleScroll"
          infinite-scroll-distance="5"
          :infinite-scroll-disabled="isDisabledScroll"
          class="project-monthly card-bg">
          <el-collapse v-model="currentCollapse" accordion>
            <el-collapse-item v-for="(item, i) in monthlyList" :key="i" :name="item.title" @click="getMonthlyList(i)">
              <!-- 标题 -->
              <template #title>
                <h3>{{ `${item.title} 简报` }}</h3>
              </template>

              <!-- 按钮 -->
              <template #icon="{ isActive }">
                <span class="collapse-icon">{{ isActive ? "折叠" : "展开" }}</span>
              </template>

              <!-- 内容【有数据】 -->
              <el-timeline v-show="item.children.length" v-loading="monthlyLoading">
                <el-timeline-item v-for="(items, j) in item.children" :key="j">
                  项目【
                  <a style="cursor: pointer" @click="pushToProject(items.projectId)">{{ items.projectName }}</a>
                  】，

                  <!-- 已废弃文案 -->
                  <span v-show="items.status == 3">
                    <b class="red">已废弃</b>， 最终累计收款
                    <b class="blue"> {{ items.sumMoney }} </b>
                    元，收款占比
                    <b class="blue"> {{ handleNumber(2, (items.sumMoney / items.amount) * 100) }} %</b>
                  </span>

                  <!-- 暂无进展文案 -->
                  <span v-show="items.status < 3 && items.currMonthMoney == 0">
                    <b class="red">本月暂无进展</b>， 当前完成度
                    <b class="blue"> {{ items.progress }} %</b>
                  </span>

                  <!-- 有进展文案 -->
                  <span v-show="items.status < 3 && items.currMonthMoney != 0">
                    本月已收款 <b class="blue">{{ items.currMonthMoney }}</b> 元，当前完成度
                    <b class="blue">{{ items.progress }} %</b>
                  </span>

                  <!-- 超额完成文案 -->
                  <span v-show="items.sumMoney > items.amount">
                    超额 <b class="green">{{ items.sumMoney - items.amount }}</b> 元
                  </span>
                </el-timeline-item>
              </el-timeline>

              <!-- 内容【无数据】 -->
              <p v-show="!item.children.length" class="empty">— 暂无数据 —</p>
            </el-collapse-item>
          </el-collapse>

          <!-- 触底加载状态 -->
          <div v-show="scrollLoading" class="is-loading">
            <icon-loading-four class="icon" />
            <p>加载中...</p>
          </div>
        </div>
      </el-col>

      <!-- 需要注意的工程 -->
      <el-col :lg="7">
        <div class="dashboard-header">
          <span class="dashboard-header-circle"></span>
          <span class="dashboard-header-title">需要注意的工程</span>
        </div>
        <div v-loading="AttentionLoading" class="project-attention card-bg">
          <el-scrollbar>
            <div v-for="(item, i) in attentionList" :key="i" class="attention-item">
              <!-- 预期截止时间、进度状态 -->
              <div class="attention-item-header">
                <div class="attention-header-title">
                  <icon-time size="14" />
                  <p>{{ dateFormat(item.expectFinishDateTime) }}</p>
                </div>
                <el-tag size="small" :type="['danger', 'warning', 'primary'][item.type]">{{
                  ["已超期", "已临近", "无进度"][item.type]
                }}</el-tag>
              </div>

              <!-- 项目名称、回款进度 -->
              <div class="attention-item-body">
                <h5>{{ item.projectName }}</h5>
                <h6>回款进度：{{ item.progress }} %</h6>
              </div>

              <!-- 按钮 -->
              <div class="attention-item-footer">
                <el-link type="primary" size="mini" :underline="false" @click="delayProject(item.projectId)">延缓</el-link>
                <el-link type="danger" size="small" :underline="false" @click="discardProject(item.projectId)">废弃</el-link>
              </div>
            </div>

            <!-- 暂无数据 -->
            <p v-show="!attentionList.length" class="empty">— 暂无数据 —</p>
          </el-scrollbar>
        </div>
      </el-col>

      <!-- 财报 -->
      <el-col :lg="7">
        <div class="dashboard-header">
          <span class="dashboard-header-circle"></span>
          <span class="dashboard-header-title">财报</span>
        </div>
        <div class="project-finance card-bg">
          <el-scrollbar>
            <!-- 统计数据 -->
            <div class="finance-count">
              <div class="finance-count-header">
                <icon-chart-proportion class="chart-icon" />

                <div class="finance-count-title">
                  <h4>计划与实际</h4>
                  <p>{{ `${dateFormat(planAndActualData.startDate)} 至今` }}</p>
                </div>
              </div>

              <div class="finance-count-body">
                <div class="finance-count-item">
                  <div class="finance-count-content">
                    <h2>{{ planAndActualData.finishedProjectNum }}</h2>
                    <h4>
                      {{ handleNumber(2, (planAndActualData.finishedProjectNum / planAndActualData.totalProjectNum) * 100) || 0 }}
                      %
                    </h4>
                  </div>

                  <p class="finance-count-label">已完成的项目</p>
                </div>

                <div class="finance-count-item right">
                  <h2>￥ {{ planAndActualData.actualMoney }}</h2>

                  <p class="finance-count-label">已收回的项目款</p>
                </div>
              </div>

              <div class="finance-count-body undone">
                <div class="finance-count-item">
                  <div class="finance-count-content">
                    <h2>{{ planAndActualData.unFinishedProjectNum }}</h2>
                    <h4>
                      {{
                        handleNumber(2, (planAndActualData.unFinishedProjectNum / planAndActualData.totalProjectNum) * 100) || 0
                      }}
                      %
                    </h4>
                  </div>

                  <p class="finance-count-label">未完成的项目</p>
                </div>

                <div class="finance-count-item right">
                  <h2>￥ {{ planAndActualData.expectMoney }}</h2>

                  <p class="finance-count-label">预期的项目款</p>
                </div>
              </div>
            </div>

            <!-- 平均月度收回款项 -->
            <div class="finance-average">
              <div class="finance-average-header">
                <h2>￥ {{ handleNumber(2, averageMoney) }}</h2>
                <p>平均月度收回款项</p>
              </div>

              <div id="myChart" class="myChart"></div>
            </div>

            <!-- 最赚的项目 TOP5 -->
            <div class="finance-ranking">
              <h2 class="finance-ranking-header">最赚的项目 TOP 5</h2>

              <div class="finance-ranking-body">
                <div v-for="(item, i) in rankingData" :key="i" class="ranking-item">
                  <div class="ranking-item-header">
                    <p>{{ item.projectName }}</p>
                    <p>￥ {{ item.amount }}</p>
                  </div>

                  <el-progress :show-text="false" :percentage="handleNumber(2, ((item.amount || 0) / rankingCount) * 100) || 0" />
                </div>

                <!-- 暂无数据 -->
                <p v-show="!rankingData.length" class="empty">— 暂无数据 —</p>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </el-col>
    </el-row>

    <!-- 【对话框】延缓项目 -->
    <DialogDelay ref="delayRef" @update="getAttentionList" />
  </div>
</template>

<script setup lang="ts" name="Dashboard">
  import DialogDelay from "./components/DialogDelay.vue"
  import { handleNumber, dateFormat } from "@/utils/handle.ts"
  import { useMonthly } from "./hooks/useMonthly"
  import { useAttention } from "./hooks/useAttention"
  import { useFinance } from "./hooks/useFinance"

  //【hooks】工程月历
  const {
    scrollLoading,
    monthlyLoading,
    isDisabledScroll,
    currentCollapse,
    monthlyList,
    handleScroll,
    getMonthlyList,
    pushToProject
  } = useMonthly()
  //【hooks】需要注意的工程
  const { AttentionLoading, delayRef, attentionList, getAttentionList, delayProject, discardProject } = useAttention()
  //【hooks】财报
  const { planAndActualData, averageMoney, rankingData, rankingCount } = useFinance()

  // 常用路由列表
  const commonRouters = [
    { path: "/basic/staff", name: "员工管理" },
    { path: "/basic/dept", name: "部门管理" },
    { path: "/basic/post", name: "岗位管理" },
    { path: "/overview/bid", name: "招投标总览" },
    { path: "/overview/contract", name: "合同总览" },
    { path: "/overview/performance", name: "业绩总览" },
    { path: "/overview/file", name: "附件总览" }
  ]
</script>

<style lang="scss" scoped>
  .empty {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    font-size: 14px;
    color: var(--el-text-color-regular);
  }

  // 标题
  .dashboard-header {
    margin: 10px;
    display: flex;
    align-items: center;

    .dashboard-header-circle {
      margin-right: 10px;
      width: 8px;
      height: 8px;
      background-color: var(--el-color-primary);
      border-radius: 100%;
    }
  }

  // 常用功能
  .common-page {
    .common-page-body {
      display: flex;
      justify-content: flex-start;
      align-items: center;

      .common-item {
        margin: 10px 5px 0 5px;
        padding: 5px 20px;
        color: #000;
        background-color: #fff;
        border-radius: 4px;
        box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.07);
        font-size: 14px;
        cursor: pointer;

        &:hover {
          color: #fff;
          background-color: var(--el-color-primary);
        }
      }
    }
  }

  .project-page {
    margin-top: 20px;

    .project {
      // 工程页面
      &-monthly {
        margin-right: 10px;
        height: calc(100vh - 240px);
        overflow: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
        ::-webkit-scrollbar {
          display: none;
        }

        .blue {
          color: var(--el-color-primary);
        }

        .green {
          color: var(--el-color-success);
        }

        .red {
          color: var(--el-color-danger);
        }
      }

      // 需要注意的工程
      &-attention {
        margin: 0 10px;
        height: calc(100vh - 240px);

        .attention-item {
          padding: 10px;
          background-color: var(--el-bg-color-page);
          border-radius: $circle-radius;

          &:nth-child(n + 2) {
            margin-top: 10px;
          }

          &-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .attention-header-title {
              display: flex;
              align-items: center;
              font-size: 14px;
            }
          }

          &-body {
            margin: 10px 0;

            h4 {
              text-overflow: ellipsis;
              white-space: nowrap;
              overflow: hidden;
            }

            h6 {
              font-size: 14px;
              font-weight: normal;
              color: var(--el-color-info);
            }
          }

          &-footer {
            display: flex;
            justify-content: space-around;

            a {
              font-size: 14px;
            }
          }
        }
      }

      // 财报
      &-finance {
        margin-left: 10px;
        height: calc(100vh - 240px);

        // 计划与实际
        .finance-count {
          padding: 20px;
          color: #fff;
          background-color: var(--el-color-primary);
          border-radius: $circle-radius;

          .finance-count-header {
            display: flex;
            justify-content: flex-start;
            align-items: center;

            .chart-icon {
              padding: 10px;
              color: var(--el-color-primary);
              font-size: 24px;
              background-color: #fff;
              border-radius: $circle-radius;
            }

            .finance-count-title {
              margin-left: 10px;

              p {
                font-size: 14px;
                color: rgba(255, 255, 255, 0.7);
              }
            }
          }

          .finance-count-body {
            margin-top: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;

            // 未完成项目
            &.undone {
              .finance-count-item {
                .finance-count-content {
                  color: #ffc7c7;
                  h4 {
                    color: var(--el-color-danger);
                  }
                }
              }

              .finance-count-label {
                color: rgba(255, 255, 255, 0.7);
              }
            }

            .finance-count-item {
              &.right {
                text-align: right;

                h2 {
                  font-size: 18px;
                }
              }

              .finance-count-content {
                display: flex;
                justify-content: flex-start;
                align-items: center;

                h2 {
                  font-size: 18px;
                }

                h4 {
                  margin-left: 10px;
                  padding: 4px 12px;
                  font-size: 14px;
                  font-weight: normal;
                  color: #000;
                  background-color: #fff;
                  border-radius: 50px;
                }
              }

              .finance-count-label {
                margin-top: 10px;
                font-size: 14px;
              }
            }
          }
        }

        // 平均阅读收回款项
        .finance-average {
          margin: 20px 0;

          .finance-average-header {
            margin-bottom: 10px;

            h2 {
              font-size: 18px;
            }
            p {
              font-size: 14px;
              color: var(--el-color-info);
            }
          }

          .myChart {
            height: 150px;
          }
        }

        // 最赚的项目 TOP5
        .finance-ranking {
          .finance-ranking-header {
            font-size: 18px;
          }

          .ranking-item {
            margin-top: 5px;

            .ranking-item-header {
              margin-bottom: 5px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 14px;
            }
          }
        }
      }
    }
  }

  // 工程月历 - 折叠面板(自定义按钮)
  .collapse-icon {
    margin: 0 10px 0 auto;
    color: var(--el-color-primary);
  }

  // 滚动提示状态
  .is-loading {
    margin-top: 20px;
    color: var(--el-text-color-placeholder);
    text-align: center;
    font-size: 14px;

    .icon {
      animation: loadingAnimate 1s linear infinite;
    }
  }

  // 加载中图标动画
  @keyframes loadingAnimate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>

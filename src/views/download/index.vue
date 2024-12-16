<template>
  <div
    v-infinite-scroll="handleScroll"
    infinite-scroll-distance="1"
    :infinite-scroll-disabled="isDisabledScroll"
    class="task-page">
    <template v-for="(item, i) in downloadTaskList" :key="i">
      <!-- 日期 -->
      <div class="task-page-title">{{ item.date }}</div>

      <div v-for="(items, i) in item.children" :key="i" class="task-page-card card-bg">
        <!-- 数据 -->
        <div class="card-left">
          <div class="card-zip">
            <img :class="items.status != 2 ? 'expired' : ''" src="@/assets/images/zip.svg" />
          </div>

          <div class="card-data">
            <p class="card-data-title" :class="items.status == 3 ? 'expired' : ''">包名：{{ items.alias }} - {{ items.name }}</p>
            <p class="card-data-source">来源：{{ items.source }}</p>
            <p class="card-data-source">导出人：{{ items.employeeName }}</p>
            <p v-show="items.status == 1" class="card-data-gray">等待服务器打包完毕</p>
            <p v-show="items.status == 2" class="card-data-size">大小：{{ handleFilesize(items.size) }}</p>
            <p v-show="items.status == 3" class="card-data-failed">打包失败：{{ items.note }}</p>
            <p v-show="items.status == 4" class="card-data-gray">超过七日时效，服务器已自动删除。如需请重新打包</p>
            <p></p>
          </div>
        </div>

        <!-- 按钮 -->
        <div class="card-right">
          <icon-loading-four v-show="items.status == 1" class="card-loading" size="20" />
          <icon-download
            v-show="items.status == 2"
            :loading="items.loading"
            class="card-btn"
            size="20"
            @click="downloadTaskFile(items)" />
        </div>
      </div>
    </template>

    <!-- 触底加载状态 -->
    <div v-show="viewLoading" class="is-loading">
      <icon-loading-four class="icon" />
      <p>加载中...</p>
    </div>
    <!-- 触底提示 -->
    <div v-show="isLastPage" class="is-last-page">— 没有更多任务了 —</div>
  </div>
</template>

<script setup lang="ts" name="DownloadsBox">
  import { ref, onMounted, computed } from "vue"
  import type { PaginationInter } from "@/interface/index.ts"
  import type { DownloadTaskListInter } from "@/api/other/types.ts"
  import { dateFormat, downloadB, handleFilesize } from "@/utils/handle.ts"
  import * as OtherAPI from "@/api/other/index.ts"

  //【变量】页面状态【加载中】
  const viewLoading = ref<Boolean>(false)
  //【变量】是否最后一页
  const isLastPage = computed(() => {
    return listPage.value.current * listPage.value.pagesize >= listPage.value.total
  })
  //【变量】是否禁用滚动
  const isDisabledScroll = computed(() => {
    return isLastPage.value || viewLoading.value
  })

  //【变量】任务列表
  const downloadTaskList = ref<DownloadTaskListInter[]>([])
  //【变量】任务列表分页
  const listPage = ref<PaginationInter>({
    total: 0,
    current: 1,
    pagesize: 10
  })
  //【方法】获取下载中心任务列表
  const getData = () => {
    viewLoading.value = true
    OtherAPI.getDownloadTaskList({}, listPage.value)
      .then((res: any) => {
        handleTaskList(res.data.data.records)
        listPage.value = {
          current: res.data.data.current,
          pagesize: res.data.data.size,
          total: res.data.data.total
        }
      })
      .finally(() => {
        viewLoading.value = false
      })
  }
  //【方法】滚动到底部触发
  const handleScroll = () => {
    // 如果不是最后一页，则继续请求
    if (!isLastPage.value) {
      listPage.value.current++
      getData()
    }
  }

  //【方法】下载任务文件
  const downloadTaskFile = (row: any) => {
    row.loading = true

    // 生成文件名
    const name = row.url.substr(row.url.lastIndexOf("/") + 1, row.url.length)
    OtherAPI.downloadTaskFile(row.url, name)
      .then((res: any) => {
        // 下载文件
        downloadB(res.data, `${row.alias} - ${name}`)
      })
      .finally(() => {
        row.loading = false
      })
  }

  // 【生命周期】挂载后
  onMounted(() => {
    getData()
  })

  //【数据处理】任务列表按日期分组
  const handleTaskList = (data: any) => {
    data.forEach((item: any) => {
      const newData = downloadTaskList.value
      const isExist = newData.find((items: any) => items.date == dateFormat(item.createDateTime))

      if (!isExist) {
        // 不存在，创建对象
        newData.push({
          date: dateFormat(item.createDateTime),
          children: [item]
        })
      } else {
        // 已存在，添加数据
        newData.forEach((items: any) => {
          if (items.date == dateFormat(item.createDateTime)) {
            items.children.push({ ...item, loading: false })
          }
        })
      }
    })
  }
</script>

<style lang="scss" scoped>
  .task-page {
    height: calc(100vh - 90px);
    overflow: auto;

    .task-page-title {
      margin-bottom: 15px;
    }

    .task-page-card {
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .card-left {
        display: flex;
        align-items: center;
        width: 100%;

        .card-zip {
          margin-right: 10px;

          img {
            width: 40px;
            height: 40px;

            &.expired {
              filter: gray;
              filter: grayscale(1);
              -webkit-filter: grayscale(1);
              -o-filter: grayscale(1);
              -moz-filter: grayscale(1);
              -ms-filter: grayscale(1);
            }
          }
        }

        .card-data {
          width: 80%;
          font-size: 14px;

          p {
            line-height: 24px;

            &.expired {
              text-decoration: line-through;
            }
          }

          .card-data-gray {
            color: var(--el-text-color-placeholder);
          }

          .card-data-failed {
            color: var(--el-color-danger);
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
        }
      }

      .card-right {
        margin-right: 40px;

        .card-loading {
          animation: loadingAnimate 1s linear infinite;
        }

        .card-btn {
          cursor: pointer;

          &:hover {
            color: var(--el-color-primary);
          }
        }
      }
    }

    .is-loading,
    .is-last-page {
      color: var(--el-text-color-placeholder);
      text-align: center;
      font-size: 14px;

      .icon {
        animation: loadingAnimate 1s linear infinite;
      }
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

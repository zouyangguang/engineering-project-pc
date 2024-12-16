<template>
  <div>
    <!-- 菜单 -->
    <el-scrollbar v-loading="loading" :class="isMobile ? 'detail-page-menu-mobile' : 'detail-page-menu-desktop'">
      <div class="menu-title">
        <h4>开票历史</h4>
        <el-tooltip v-if="btnList.isAdd && projectInfo.status < 2" content="添加开票历史">
          <IconPlus @click="outgoHistoryAdd"></IconPlus>
        </el-tooltip>
      </div>

      <el-menu
        v-show="outgoHistoryList.length != 0"
        :mode="isMobile ? 'horizontal' : 'vertical'"
        :default-active="outgoHistoryActive?.id.toString()"
        @select="handleSelect">
        <el-menu-item v-for="item in outgoHistoryList" :key="item.id" :index="item.id.toString()">
          <template #default>
            <div class="menu-item-default">
              <p>￥ {{ item.taxAmount }}</p>
              <p>{{ dateFormat(item.outputDateTime) }}</p>
            </div>
          </template>
        </el-menu-item>
      </el-menu>
      <div v-show="outgoHistoryList.length == 0" class="no-data">暂无数据</div>
    </el-scrollbar>
    <!-- 内容 -->
    <div v-show="outgoHistoryList.length != 0" class="page">
      <el-row>
        <!-- 开票信息 -->
        <el-col :lg="14">
          <el-descriptions v-loading="outgoLoading" class="card-bg" title="开票信息" :column="isMobile ? 1 : 2">
            <template #extra>
              <el-tooltip v-if="btnList.isUpdate && projectInfo.status < 2" content="修改开票历史">
                <IconEdit @click="outgoHistoryEdit"></IconEdit>
              </el-tooltip>
              <el-tooltip v-if="btnList.isDelete && projectInfo.status < 2" content="删除开票历史">
                <IconDelete @click="outgoHistoryDelete"></IconDelete>
              </el-tooltip>
            </template>
            <el-descriptions-item label="开票日期:">{{ dateFormat(outgo?.outputDateTime as string) }}</el-descriptions-item>
            <el-descriptions-item label="走款合计:">￥{{ outgo?.totalGone }}</el-descriptions-item>
            <el-descriptions-item label="含税金额:">￥{{ outgo?.taxAmount }}</el-descriptions-item>
            <el-descriptions-item label="走款占比:">{{ outgo?.gonePercent }}%</el-descriptions-item>
            <el-descriptions-item label="税率:">{{ outgo?.dutyRate }}%</el-descriptions-item>
            <el-descriptions-item label="收款合计:">￥{{ outgo?.totalProceeds }}</el-descriptions-item>
            <el-descriptions-item label="税额:">￥{{ outgo?.tax }}</el-descriptions-item>
            <el-descriptions-item label="收款占比:">{{ outgo?.proceedsPercent }}%</el-descriptions-item>
            <el-descriptions-item label="备注:">
              {{ outgo?.note }}
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
        <!-- 开票附件 -->
        <el-col :lg="10">
          <div v-loading="outgoLoading" class="table-page card-bg">
            <!-- 上传文件 -->
            <div class="table-page-header">
              <div class="table-page-header-title">开票附件</div>
            </div>

            <!-- 文件列表 -->
            <el-table size="small" :data="outgo?.attachments">
              <el-table-column
                v-for="(item, i) in columnsTabe"
                :key="i"
                :label="item.label"
                :prop="item.prop"
                :width="item.width"
                :min-width="item.minWidth"
                :align="item.align"
                :fixed="item.fixed"
                show-overflow-tooltip>
                <template #default="scope">
                  <template v-if="item.prop == 'size'"> {{ handleFilesize(scope.row.size) }}</template>
                  <div v-if="item.prop == 'button'" class="table-btn">
                    <el-link type="primary" :underline="false" @click="downloadFile(scope.row)"> 下载 </el-link>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
      <!-- 走款 开款 表 -->
      <el-row>
        <el-col :lg="12">
          <!-- 表格 -->
          <div class="table-page card-bg">
            <div class="table-page-header">
              <div class="table-page-header-title">走款</div>
              <el-button v-if="btnList.gone.isAdd && projectInfo.status < 2" type="primary" @click="IncomeAdd(0)">
                <IconPlus></IconPlus>添加{{ TabPanes[0].label }}
              </el-button>
            </div>
            <!-- 表格数据 -->
            <el-table v-loading="TabPanes[0].loading" :data="goneTotalTableData">
              <el-table-column
                v-for="(item, i) in columnsGone"
                :key="i"
                :label="item.label"
                :prop="item.prop"
                :width="item.width"
                :min-width="item.minwidth"
                :align="item.align"
                :fixed="item.fixed"
                show-overflow-tooltip>
                <template #default="scope">
                  <template v-if="item.prop == 'goneDateTime'">{{ dateFormat(scope.row.goneDateTime) }}</template>
                  <template v-if="item.prop == 'money'">￥{{ scope.row.money }}</template>
                  <template v-if="item.prop == 'isCompany'">{{ ["个人", "企业"][scope.row.isCompany] }}</template>
                  <template v-if="item.prop == 'message'">
                    <p>{{ ["走款人名称", "单位名称"][scope.row.isCompany] }}：{{ scope.row.personOrCompanyName }}</p>
                    <p>{{ ["走款人电话", "单位电话"][scope.row.isCompany] }}：{{ scope.row.personOrCompanyPhone }}</p>
                    <p>{{ ["走款人身份证", "营业执照注册号"][scope.row.isCompany] }}：{{ scope.row.idCardOrCreditCode }}</p>
                  </template>
                  <div v-if="item.prop == 'button'" class="table-btn">
                    <el-link type="primary" :underline="false" @click="IncomeDetailed(scope.row, 0)">查看详细</el-link>
                    <!-- 更多下拉框 -->
                    <el-dropdown
                      v-if="(btnList.gone.isUpdate || btnList.proceed.isDelete) && projectInfo.status < 2"
                      trigger="click"
                      :hide-on-click="false">
                      <el-link link type="primary" :underline="false">
                        更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
                      </el-link>
                      <template #dropdown>
                        <!-- 气泡确认框 -->
                        <el-dropdown-menu>
                          <el-dropdown-item
                            v-if="btnList.gone.isUpdate && projectInfo.status < 2"
                            @click="IncomeEdit(scope.row, 0)">
                            修改{{ TabPanes[0].label }}
                          </el-dropdown-item>
                          <el-dropdown-item
                            v-if="btnList.gone.isDelete && projectInfo.status < 2"
                            @click="TotalDelete(scope.row, 0)">
                            删除{{ TabPanes[0].label }}
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <Pagination
              v-model:total="PaginationConfiguration[0].total"
              v-model:current="PaginationConfiguration[0].current"
              v-model:pagesize="PaginationConfiguration[0].pagesize"
              :pager-count="5"
              size="small"
              layout="prev, pager, next"
              class="table-page-pagination"
              @change="getGoneTotal" />
          </div>
        </el-col>
        <el-col :lg="12">
          <!-- 表格 -->
          <div class="table-page card-bg">
            <div class="table-page-header">
              <div class="table-page-header-title">收款</div>
              <el-button v-if="btnList.proceed.isAdd && projectInfo.status < 2" type="primary" @click="IncomeAdd(1)">
                <IconPlus></IconPlus>添加{{ TabPanes[1].label }}
              </el-button>
            </div>
            <!-- 表格数据 -->
            <el-table v-loading="TabPanes[1].loading" :data="backTotalTableData">
              <el-table-column
                v-for="(item, i) in columnsBack"
                :key="i"
                :label="item.label"
                :prop="item.prop"
                :width="item.width"
                :min-width="item.minwidth"
                :align="item.align"
                :fixed="item.fixed"
                show-overflow-tooltip>
                <template #default="scope">
                  <template v-if="item.prop == 'proceedsDateTime'">{{ dateFormat(scope.row.proceedsDateTime) }}</template>
                  <template v-if="item.prop == 'money'">￥{{ scope.row.money }}</template>
                  <template v-if="item.prop == 'taxFee'">￥{{ scope.row.taxFee }}</template>
                  <template v-if="item.prop == 'manageFee'">￥{{ scope.row.manageFee }}</template>
                  <template v-if="item.prop == 'personalTaxFee'">￥{{ scope.row.personalTaxFee }}</template>
                  <div v-if="item.prop == 'button'" class="table-btn">
                    <el-link type="primary" :underline="false" @click="IncomeDetailed(scope.row, 1)">查看详细</el-link>
                    <!-- 更多下拉框 -->
                    <el-dropdown
                      v-if="(btnList.proceed.isUpdate || btnList.proceed.isDelete) && projectInfo.status < 2"
                      trigger="click"
                      :hide-on-click="false">
                      <el-link link type="primary" :underline="false">
                        更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
                      </el-link>
                      <template #dropdown>
                        <!-- 气泡确认框 -->
                        <el-dropdown-menu>
                          <el-dropdown-item
                            v-if="btnList.proceed.isUpdate && projectInfo.status < 2"
                            @click="IncomeEdit(scope.row, 1)">
                            修改{{ TabPanes[1].label }}
                          </el-dropdown-item>
                          <el-dropdown-item
                            v-if="btnList.proceed.isDelete && projectInfo.status < 2"
                            @click="TotalDelete(scope.row, 1)">
                            删除{{ TabPanes[1].label }}
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <Pagination
              v-model:total="PaginationConfiguration[1].total"
              v-model:current="PaginationConfiguration[1].current"
              v-model:pagesize="PaginationConfiguration[1].pagesize"
              :pager-count="5"
              size="small"
              layout="prev, pager, next"
              class="table-page-pagination"
              @change="getBackTotal" />
          </div>
        </el-col>
      </el-row>
    </div>
    <div v-show="outgoHistoryList.length == 0" class="page card-bg" style="height: calc(100vh - 90px)">
      <div class="no-data" style="position: relative">暂无数据</div>
    </div>
  </div>
  <!-- 添加修改 开票历史 抽屉 -->
  <EditAddDrawer ref="EditAddDrawerRef" @update="getoutgoHistoryList"></EditAddDrawer>
  <!-- 修改添加查看 走款 开款 抽屉 -->
  <EditAddDrawerGoneTotal ref="EditAddDrawerGoneTotalRef" @update="getoutgoHistoryList"></EditAddDrawerGoneTotal>
  <EditAddDrawerBackTotall ref="EditAddDrawerBackTotallRef" @update="getoutgoHistoryList"></EditAddDrawerBackTotall>
</template>

<script setup lang="ts" name="ProjectOutgo">
  import { ref, reactive, onMounted } from "vue"
  import useGlobalStore from "@/stores/modules/global.ts"
  import { ElMessage, ElMessageBox } from "element-plus"
  import Pagination from "@/components/Pagination/index.vue"
  //outgoHistoryInter:开票历史  outgoInter:开票 goneInter:走款 proceedsInter:收款
  import type { outgoHistoryInter, outgoInter, goneInter, proceedsInter } from "@/api/project/outgo/types.ts"
  // 添加修改 开票历史 抽屉
  import EditAddDrawer from "./components/EditAddDrawer.vue"
  // 修改添加查看 走款  抽屉
  import EditAddDrawerGoneTotal from "./components/EditAddDrawerGoneTotal.vue"
  import EditAddDrawerBackTotall from "./components/EditAddDrawerBackTotall.vue"
  // getByProjectId获取开票历史 getOne查看开票详细 getByOutputIdGone走款列表 getByOutputIdProceeds收款列表
  //download下载文件 deleteOutputBase 删除开票信息 deleteOutputGone 删除走款 deleteOutputProceeds 删除收款
  import {
    getByProjectId,
    getOutputBaseDetail,
    getByOutputIdGone,
    getByOutputIdProceeds,
    download,
    deleteOutputBase,
    deleteOutputGone,
    deleteOutputProceeds
  } from "@/api/project/outgo/index.ts"
  import { dateFormat, downloadB, handleFilesize } from "@/utils/handle.ts"
  import { useRouter } from "vue-router"
  import useAuthStore from "@/stores/modules/auth.ts"
  import useProjectStore from "@/stores/modules/project.ts"
  //【实例】权限 - pinia
  const btnList = useAuthStore().btnList
  //【实例】项目信息 - pinia
  const projectInfo = useProjectStore().info

  //路由
  const router = useRouter()
  // 判断是否是移动端
  const globalStore = useGlobalStore()
  const isMobile = ref(globalStore.isMobile)

  //开票历史 加载显示
  const loading = ref(true)
  //开票历史 数据列表
  const outgoHistoryList = ref<Array<outgoHistoryInter>>([])
  //选中的开票历史
  const outgoHistoryActive = ref<outgoHistoryInter>()

  //获取开票历史 数据
  const getoutgoHistoryList = () => {
    loading.value = true
    getByProjectId({ projectId: sessionStorage.projectId, size: 999 })
      .then((res: any) => {
        outgoHistoryList.value = res.data.data.records
        if (res.data.data.records.length != 0) {
          if (outgoHistoryActive.value) {
            const id = outgoHistoryActive.value.id
            outgoHistoryActive.value = outgoHistoryList.value.find(item => item.id == id)
          } else {
            outgoHistoryActive.value = res.data.data.records[0]
          }
          getoutgo()
          TabChange()
        }
      })
      .finally(() => {
        loading.value = false
      })
  }

  //选择 开票历史
  const handleSelect = (key: number) => {
    outgoHistoryActive.value = outgoHistoryList.value.find(item => item.id == key)
    getoutgo()
    TabChange()
  }

  //  添加修改 开票历史 抽屉 实例
  const EditAddDrawerRef = ref<InstanceType<typeof EditAddDrawer>>()
  //添加开票历史
  const outgoHistoryAdd = () => {
    if (EditAddDrawerRef.value) {
      EditAddDrawerRef.value.drawerType = 0
      EditAddDrawerRef.value.showDrawer = true
    }
  }
  //修改开票历史
  const outgoHistoryEdit = () => {
    if (EditAddDrawerRef.value) {
      EditAddDrawerRef.value.drawerType = 1
      EditAddDrawerRef.value.outputBase = outgo.value
      EditAddDrawerRef.value.showDrawer = true
    }
  }
  //删除开票历史
  const outgoHistoryDelete = () => {
    if (outgoHistoryActive.value) {
      ElMessageBox.confirm("此操作将永久删除开票历史，请谨慎操作！", "提示", {
        type: "warning",
        confirmButtonText: "确认删除"
      }).then(() => {
        if (outgoHistoryActive.value) {
          deleteOutputBase(outgoHistoryActive.value.id.toString()).then(() => {
            outgoHistoryActive.value = undefined
            getoutgoHistoryList()
            ElMessage.success("删除成功")
          })
        }
      })
    }
  }

  //开票 数据
  const outgo = ref<outgoInter>()
  //开票详细加载
  const outgoLoading = ref(false)
  // 获取 开票 数据
  const getoutgo = () => {
    if (outgoHistoryActive.value) {
      outgoLoading.value = true
      getOutputBaseDetail(outgoHistoryActive.value.id.toString())
        .then((res: any) => {
          outgo.value = res.data.data
        })
        .finally(() => {
          outgoLoading.value = false
        })
    }
  }

  //el-tabs 配置
  const TabPanes = reactive([
    { label: "走款", name: 0, loading: true },
    { label: "收款", name: 1, loading: true }
  ])
  /**走款 开款 表 框架*/

  //走款 表 框架
  const columnsGone = [
    { prop: "goneDateTime", label: "走款时间", width: 110 },
    { prop: "money", label: "走款金额", width: 100 },
    { prop: "isCompany", label: " 走款主体", width: 90 },
    { prop: "message", label: " 走款信息", width: 300 },
    { prop: "note", label: "备注", minwidth: 100 },
    { prop: "button", label: "操作", align: "center", fixed: "right", width: "150" }
  ]
  //收款 表框架
  const columnsBack = [
    { prop: "proceedsDateTime", label: "收款时间", width: 110 },
    { prop: "money", label: "收款金额", width: 100 },
    { prop: "taxFee", label: "收回税费", width: 100 },
    { prop: "manageFee", label: "收回管理费", width: 100 },
    { prop: "personalTaxFee", label: "收回个税", width: 100 },
    { prop: "note", label: "备注", minwidth: 100 },
    { prop: "button", label: "操作", align: "center", fixed: "right", width: "150" }
  ]
  //走款 开款 切换 触发
  const TabChange = () => {
    PaginationConfiguration.value[0].current = 1
    PaginationConfiguration.value[1].current = 1
    getGoneTotal()
    getBackTotal()
  }

  //存放走款 表数据
  const goneTotalTableData = ref<goneInter[]>([])
  //存放开款 表数据
  const backTotalTableData = ref<proceedsInter[]>([])
  //获取走款 表数据
  const getGoneTotal = () => {
    if (outgoHistoryActive.value) {
      TabPanes[0].loading = true
      getByOutputIdGone({
        page: PaginationConfiguration.value[0].current,
        size: PaginationConfiguration.value[0].pagesize,
        outputId: outgoHistoryActive.value.id
      })
        .then((res: any) => {
          goneTotalTableData.value = res.data.data.records
          PaginationConfiguration.value[0].total = res.data.data.total
        })
        .finally(() => {
          TabPanes[0].loading = false
        })
    }
  }
  //获取开款 表数据
  const getBackTotal = () => {
    if (outgoHistoryActive.value) {
      TabPanes[1].loading = true
      getByOutputIdProceeds({
        page: PaginationConfiguration.value[1].current,
        size: PaginationConfiguration.value[1].pagesize,
        id: outgoHistoryActive.value.id
      })
        .then((res: any) => {
          backTotalTableData.value = res.data.data.records
          PaginationConfiguration.value[1].total = res.data.data.total
        })
        .finally(() => {
          TabPanes[1].loading = false
        })
    }
  }
  //修改添加查看 走款 抽屉 实例
  const EditAddDrawerGoneTotalRef = ref<InstanceType<typeof EditAddDrawerGoneTotal>>()
  //修改添加查看 开款 抽屉 实例
  const EditAddDrawerBackTotallRef = ref<InstanceType<typeof EditAddDrawerBackTotall>>()
  //走款 开款 添加
  const IncomeAdd = (active: 0 | 1) => {
    if (active == 0) {
      if (projectInfo.isFieldProject == 1 && projectInfo.isPrepay == 0) {
        ElMessageBox.confirm("当前项目为异地项目，且未完成费用预缴，无法添加走款明细，请前往【缴税管理】完成费用预缴。", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          router.push({ path: "./tax" })
        })
      } else {
        if (EditAddDrawerGoneTotalRef.value && outgoHistoryActive.value) {
          EditAddDrawerGoneTotalRef.value.outputId = outgoHistoryActive.value.id
          EditAddDrawerGoneTotalRef.value.FormType = 0
          EditAddDrawerGoneTotalRef.value.isShow = true
        }
      }
    } else {
      if (EditAddDrawerBackTotallRef.value && outgoHistoryActive.value) {
        EditAddDrawerBackTotallRef.value.outputId = outgoHistoryActive.value.id
        EditAddDrawerBackTotallRef.value.FormType = 0
        EditAddDrawerBackTotallRef.value.isShow = true
      }
    }
  }
  //走款 开款 修改
  const IncomeEdit = (row: goneInter | proceedsInter, active: 0 | 1) => {
    if (active == 0) {
      if (EditAddDrawerGoneTotalRef.value && outgoHistoryActive.value) {
        EditAddDrawerGoneTotalRef.value.outputId = outgoHistoryActive.value.id
        EditAddDrawerGoneTotalRef.value.FormType = 1
        EditAddDrawerGoneTotalRef.value.id = row.id
        EditAddDrawerGoneTotalRef.value.isShow = true
      }
    } else {
      if (EditAddDrawerBackTotallRef.value && outgoHistoryActive.value) {
        EditAddDrawerBackTotallRef.value.outputId = outgoHistoryActive.value.id
        EditAddDrawerBackTotallRef.value.FormType = 1
        EditAddDrawerBackTotallRef.value.id = row.id
        EditAddDrawerBackTotallRef.value.isShow = true
      }
    }
  }
  //走款 开款 详细 查看
  const IncomeDetailed = (row: goneInter | proceedsInter, active: 0 | 1) => {
    if (active == 0) {
      if (EditAddDrawerGoneTotalRef.value && outgoHistoryActive.value) {
        EditAddDrawerGoneTotalRef.value.outputId = outgoHistoryActive.value.id
        EditAddDrawerGoneTotalRef.value.FormType = 2
        EditAddDrawerGoneTotalRef.value.id = row.id
        EditAddDrawerGoneTotalRef.value.isShow = true
      }
    } else {
      if (EditAddDrawerBackTotallRef.value && outgoHistoryActive.value) {
        EditAddDrawerBackTotallRef.value.outputId = outgoHistoryActive.value.id
        EditAddDrawerBackTotallRef.value.FormType = 2
        EditAddDrawerBackTotallRef.value.id = row.id
        EditAddDrawerBackTotallRef.value.isShow = true
      }
    }
  }

  /**删除 走款 开款*/
  const TotalDelete = (row: goneInter | proceedsInter, active: 0 | 1) => {
    ElMessageBox.confirm(`此操作将永久删除该项目开票历史${TabPanes[active].label}，请谨慎操作！`, "提示", {
      confirmButtonText: "确定删除",
      cancelButtonText: "取消",
      type: "warning"
    }).then(() => {
      if (active == 0) {
        deleteOutputGone(row.id.toString())
          .then(() => {
            getoutgoHistoryList()
          })
          .finally(() => {
            ElMessage.success("删除成功")
          })
      } else if (active == 1) {
        deleteOutputProceeds(row.id.toString())
          .then(() => {
            getoutgoHistoryList()
          })
          .finally(() => {
            ElMessage.success("删除成功")
          })
      }
    })
  }
  //分页器配置
  const PaginationConfiguration = ref([
    {
      total: 10,
      current: 1,
      pagesize: 10
    },
    {
      total: 10,
      current: 1,
      pagesize: 10
    }
  ])

  //【变量】表格布局
  const columnsTabe = [
    { label: "名称", prop: "name", minWidth: 100 },
    { label: "大小", prop: "size", width: 100 },
    { label: "操作", prop: "button", width: 100, align: "center", fixed: "right" }
  ]

  //【方法】下载文件
  function downloadFile(data: any) {
    download(data.url, data.name).then((res: any) => {
      downloadB(res.data, data.name)
    })
  }

  onMounted(() => {
    getoutgoHistoryList()
  })
</script>

<style lang="scss" scoped>
  .no-data {
    position: absolute;
    top: 50%;
    width: 100%;
    text-align: center;
    color: var(--el-text-color-regular);
  }
  .el-menu-item {
    height: auto;
  }
  .i-icon {
    cursor: pointer;
    margin-left: 10px;
  }
  .menu-item-default {
    $font-size: 1em;
    p {
      font-size: $font-size;
      height: $font-size;
      line-height: $font-size;
      $font-size-2: 0.8em;
      margin: 10px 0;
      &:nth-child(2) {
        font-size: $font-size-2;
        height: $font-size;
        line-height: $font-size;
      }
    }
  }

  .menu-title {
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50px;
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: var(--el-bg-color);
  }
  $padding: 10px;
  .table-page {
    padding: 20px;
  }

  .page {
    > .el-row {
      .el-col {
        .card-bg {
          height: 100%;
        }
      }
    }
    > .el-row:nth-child(1) {
      text-align: center;
      h1 {
        margin-bottom: 10px;
      }

      .el-col:nth-child(1),
      .el-col:nth-child(2) {
        padding-right: 0px;
      }
      .el-col {
        padding-bottom: $padding;
      }

      @media (min-width: 1200px) {
        .el-col:nth-child(1) {
          padding-right: $padding;
        }
      }
    }
    > .el-row:nth-child(2) {
      .el-col:nth-child(1) {
        padding-bottom: 10px;
      }
      @media (min-width: 1200px) {
        .el-col:nth-child(1) {
          padding-bottom: 0px;
        }

        .el-col:nth-child(1) {
          padding-right: 5px;
        }
        .el-col:nth-child(2) {
          padding-left: 5px;
        }
      }
    }
  }
  @media (min-width: 1200px) {
    .page {
      width: calc(100% - 210px);
      margin-left: 210px;
    }
  }
  .detail-page-menu-desktop {
    position: fixed;
    top: 70px;
    width: 200px;
    height: calc(100vh - 90px);
    background-color: #fff;
    border-radius: $circle-radius;
  }

  .detail-page-menu-mobile {
    padding: 0 20px;
    height: auto;
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

    &.mobile {
      margin: 0 !important;
    }
  }
</style>

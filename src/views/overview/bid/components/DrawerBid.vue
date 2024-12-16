<template>
  <el-drawer
    v-model="showDrawer"
    title="查看招投标"
    :size="drawerWidth"
    destroy-on-close
    @open="drawerOpen()"
    @close="drawerClose()">
    <el-row v-loading="drawerLoading" class="drawer-page" :class="{ isMobile: isMobile }">
      <!-- 表单 -->
      <el-col :lg="12" class="drawer-form">
        <el-form ref="formRef" label-width="auto" label-suffix="：" :model="formModel" disabled>
          <el-form-item label="投标状态" prop="status" required>
            <el-select v-model="formModel.status" placeholder="投标状态">
              <el-option v-for="(item, i) in statusList" :key="i" :label="item" :value="i" />
            </el-select>
          </el-form-item>

          <template v-if="formModel.status != 4">
            <el-form-item label="招标模式" prop="patternId" required>
              <el-select v-model="formModel.patternId" placeholder="招标模式" clearable>
                <el-option v-for="(item, i) in patternSelect" :key="i" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>

            <el-form-item label="承包方式" prop="contractApproachId" required>
              <el-select v-model="formModel.contractApproachId" placeholder="承包方式" clearable>
                <el-option v-for="(item, i) in contractSelect" :key="i" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>

            <el-form-item label="投标日期" prop="bidDateTime">
              <el-date-picker v-model="formModel.bidDateTime" placeholder="选择日期" clearable />
            </el-form-item>

            <el-form-item label="招标日期" prop="tenderDateTime">
              <el-date-picker v-model="formModel.tenderDateTime" placeholder="选择日期" clearable />
            </el-form-item>

            <el-form-item label="项目细则" prop="customBidType">
              <el-input v-model="formModel.customBidType" placeholder="项目细则" clearable />
            </el-form-item>

            <el-form-item label="公司 / 私人" prop="companyPersonalName">
              <el-input v-model="formModel.companyPersonalName" placeholder="公司 / 私人" clearable />
            </el-form-item>

            <el-form-item label="施工单位" prop="constructionUnits">
              <el-input v-model="formModel.constructionUnits" placeholder="施工单位" clearable />
            </el-form-item>

            <el-form-item label="项目地址" prop="projectAddress">
              <el-input v-model="formModel.projectAddress" placeholder="项目地址" clearable />
            </el-form-item>

            <el-form-item class="form-input-number" label="投标金额" prop="bidMoney" required>
              <div class="prefix">￥</div>
              <el-input-number
                v-model="formModel.bidMoney"
                placeholder="投标金额"
                :min="0"
                :max="999999999999"
                :precision="2"
                :value-on-clear="0"
                :controls="false" />
            </el-form-item>

            <el-form-item class="form-input-number" label="建筑 / 套内面积" prop="area" required>
              <el-input-number
                v-model="formModel.area"
                type="number"
                placeholder="建筑 / 套内面积"
                :min="0"
                :max="99999999"
                :precision="2"
                :value-on-clear="0"
                :controls="false" />
              <div class="suffix">m²</div>
            </el-form-item>

            <el-form-item label="备注" prop="note">
              <el-input
                v-model="formModel.note"
                type="textarea"
                placeholder="备注内容"
                :autosize="{ minRows: 3, maxRows: 3 }"
                maxlength="250"
                show-word-limit />
            </el-form-item>
          </template>
        </el-form>
      </el-col>

      <!-- 文件列表 -->
      <el-col v-if="formModel.status != 4" :lg="12" class="drawer-table">
        <div class="table-page">
          <!-- 上传文件 -->
          <div class="table-page-header">
            <div class="table-page-header-title">附件</div>
          </div>

          <!-- 文件列表 -->
          <el-table size="small" :data="formModel.attachments">
            <el-table-column
              v-for="(item, i) in columns"
              :key="i"
              :label="item.label"
              :prop="item.prop"
              :width="item.width"
              :min-width="item.minWidth"
              :align="item.align"
              :fixed="item.fixed"
              show-overflow-tooltip>
              <template #default="scope">
                <!-- 文件大小 -->
                <div v-if="item.prop == 'size'">{{ handleFilesize(scope.row.size) }}</div>

                <!-- 操作 -->
                <div v-if="item.prop == 'button'" class="table-btn">
                  <el-link type="primary" :underline="false" @click="downloadFile(scope.row)"> 下载 </el-link>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </el-drawer>
</template>

<script setup lang="ts">
  import { ref, computed } from "vue"
  import type { FormInstance } from "element-plus"
  import type { BidFormInter } from "@/api/project/bid/types.ts"
  import useGlobalStore from "@/stores/modules/global.ts"
  import { handleFilesize, downloadB } from "@/utils/handle.ts"
  import * as BidAPI from "@/api/project/bid/index.ts"

  //【实例】全局状态
  const globalStore = useGlobalStore()
  //【变量】是否是移动端
  const isMobile = ref(globalStore.isMobile)

  //【变量】是否显示抽屉【true显示 / false隐藏】
  const showDrawer = ref<Boolean>(false)
  //【变量】抽屉宽度
  const drawerWidth = computed(() => {
    return isMobile.value ? "100%" : "70%"
  })
  //【变量】抽屉状态 - 加载中
  const drawerLoading = ref<Boolean>(false)

  //【变量】招投标ID
  const id = ref<number>()
  //【变量】投标状态
  const statusList = ["投标中", "已中标", "未中标", "已撤标", "无需投标"]
  //【变量】招标模式
  const patternSelect = ref<any[]>([])
  //【变量】承包方式
  const contractSelect = ref<any[]>([])

  //【方法】打开对话框
  function drawerOpen() {
    drawerLoading.value = true

    BidAPI.getBidDetailOne(id.value!)
      .then((res: any) => {
        formModel.value = res.data.data
      })
      .finally(() => {
        drawerLoading.value = false
      })
  }
  //【方法】关闭对话框
  function drawerClose() {
    // 清空表单
    formRef.value?.resetFields()
    // 清空文件列表
    formModel.value.attachments = []
  }
  //【变量】表格布局
  const columns = [
    { label: "名称", prop: "name", minWidth: 200 },
    { label: "大小", prop: "size", width: 100 },
    { label: "操作", prop: "button", width: 100, align: "center", fixed: "right" }
  ]

  //【实例】表单
  const formRef = ref<FormInstance>()
  //【变量】表单数据
  let formModel = ref<BidFormInter>({
    status: 0,
    patternId: 0,
    contractApproachId: 0,
    bidDateTime: "",
    tenderDateTime: "",
    customBidType: "",
    companyPersonalName: "",
    constructionUnits: "",
    projectAddress: "",
    bidMoney: 0,
    area: 0,
    note: "",
    attachments: []
  })

  //【方法】下载文件
  function downloadFile(row: any) {
    BidAPI.downloadBidFile(row.url, row.name)
      .then((res: any) => {
        downloadB(res.data, row.name)
      })
      .finally(() => {
        row.loading = false
      })
  }

  // 暴露给父组件
  defineExpose({ id, patternSelect, contractSelect, showDrawer })
</script>

<style lang="scss" scoped>
  .drawer-page {
    .drawer-form {
      padding-right: 10px;
    }

    .drawer-table {
      padding-left: 10px;
    }

    &.isMobile {
      .table-page {
        margin-top: 30px;
      }
    }
  }
</style>

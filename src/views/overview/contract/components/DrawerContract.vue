<template>
  <el-drawer
    v-model="showDrawer"
    title="查看合同"
    :size="drawerWidth"
    destroy-on-close
    @open="drawerOpen()"
    @close="drawerClose()">
    <el-row v-loading="drawerLoading" class="drawer-page" :class="{ isMobile: isMobile }">
      <!-- 表单 -->
      <el-col :lg="12" class="drawer-form">
        <el-form ref="formRef" label-width="auto" label-suffix="：" :model="formModel" :rules="formRules" disabled>
          <el-form-item label="合同类型" prop="typeId" required>
            <el-select v-model="formModel.typeId" placeholder="合同类型">
              <el-option v-for="(item, i) in typeSelect" :key="i" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>

          <el-form-item label="合同名称" prop="name">
            <el-input v-model="formModel.name" placeholder="合同名称" maxlength="250" clearable />
          </el-form-item>

          <el-form-item label="自营/客户" prop="selfCustomer" required>
            <el-input v-model="formModel.selfCustomer" placeholder="自营 / 客户" maxlength="250" clearable />
          </el-form-item>

          <el-form-item label="甲方公司" prop="partACompanyName">
            <el-input v-model="formModel.partACompanyName" placeholder="甲方公司名称" maxlength="250" clearable />
          </el-form-item>

          <el-form-item label="乙方公司" prop="partBCompanyName">
            <el-input v-model="formModel.partBCompanyName" placeholder="乙方公司名称" maxlength="250" clearable />
          </el-form-item>

          <el-form-item class="form-input-number" label="合同金额" prop="money" required>
            <div class="prefix">￥</div>
            <el-input-number
              v-model="formModel.money"
              placeholder="合同金额"
              :min="0"
              :max="999999999999"
              :precision="2"
              :value-on-clear="0"
              :controls="false"
              clearable />
          </el-form-item>

          <el-form-item label="管理费类型" prop="managementFeePointsType" required>
            <el-select v-model="formModel.managementFeePointsType" placeholder="管理费类型">
              <el-option v-for="(item, i) in managementFeeType" :key="i" :label="item" :value="i" />
            </el-select>
          </el-form-item>

          <el-form-item
            v-show="formModel.managementFeePointsType == 0 || formModel.managementFeePointsType == 2"
            class="form-input-number"
            label="管理费金额"
            prop="managementFeeMoney"
            required>
            <div class="prefix">￥</div>
            <el-input-number
              v-model="formModel.managementFeeMoney"
              placeholder="管理费金额"
              :min="0"
              :max="999999999999"
              :precision="2"
              :value-on-clear="0"
              :controls="false"
              clearable />
          </el-form-item>

          <el-form-item
            v-show="formModel.managementFeePointsType > 0"
            class="form-input-number"
            label="管理费率"
            prop="managementFeePercent"
            required>
            <el-input-number
              v-model="formModel.managementFeePercent"
              placeholder="管理费率"
              :min="0"
              :max="100"
              :precision="2"
              :value-on-clear="0"
              :controls="false"
              clearable />
            <div class="suffix">%</div>
          </el-form-item>

          <el-form-item label="签约时间" prop="signDateTime">
            <el-date-picker v-model="formModel.signDateTime" placeholder="选择日期" clearable />
          </el-form-item>

          <el-form-item label="开工时间" prop="startDateTime">
            <el-date-picker v-model="formModel.startDateTime" placeholder="选择日期" clearable />
          </el-form-item>

          <el-form-item label="竣工时间" prop="finishDateTime">
            <el-date-picker v-model="formModel.finishDateTime" placeholder="选择日期" clearable />
          </el-form-item>

          <el-form-item label="客户经理" prop="customerManagerId">
            <el-input v-model="formModel.customerManagerName" placeholder="客户经理" clearable />
          </el-form-item>

          <el-form-item label="质保信息" prop="qualityGuarantee">
            <el-input v-model="formModel.qualityGuarantee" placeholder="质保时间/金额" clearable />
          </el-form-item>

          <el-form-item label="备注" prop="note">
            <el-input
              v-model="formModel.note"
              type="textarea"
              placeholder="备注内容"
              :autosize="{ minRows: 3, maxRows: 3 }"
              :maxlength="250"
              show-word-limit />
          </el-form-item>
        </el-form>
      </el-col>

      <!-- 文件列表、增减项 -->
      <el-col :lg="12" class="drawer-table">
        <div class="table-page">
          <!-- 上传文件 -->
          <div class="table-page-header">
            <div class="table-page-header-title">附件</div>
          </div>

          <!-- 文件列表 -->
          <el-table size="small" :data="formModel.attachments">
            <el-table-column
              v-for="(item, i) in fileColumns"
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

                <div v-if="item.prop == 'button'" class="table-btn">
                  <el-link type="primary" :underline="false" @click="downloadFile(scope.row)"> 下载 </el-link>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 增减项列表 -->
        <div class="table-page">
          <div class="table-page-header">
            <div class="table-page-header-title">增项 / 减项</div>
          </div>

          <!-- 增减项列表 -->
          <el-table size="small" :data="formModel.addOrSub">
            <el-table-column
              v-for="(item, i) in inDecreaseColumns"
              :key="i"
              :label="item.label"
              :prop="item.prop"
              :width="item.width"
              :min-width="item.minWidth"
              :align="item.align"
              :fixed="item.fixed"
              show-overflow-tooltip>
              <template #default="scope">
                <!-- 类型 -->
                <div v-if="item.prop == 'type'">
                  <el-tag :type="inDecreaseType[scope.row.type].type" size="small">
                    {{ inDecreaseType[scope.row.type].label }}
                  </el-tag>
                </div>

                <!-- 金额格式 -->
                <div v-else-if="item.prop == 'money'">{{ scope.row.money }} 元</div>
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
  import type { FormInstance, FormRules } from "element-plus"
  import type { ContractFormInter } from "@/api/project/contract/types.ts"
  import useGlobalStore from "@/stores/modules/global.ts"
  import { handleFilesize, downloadB } from "@/utils/handle.ts"
  import * as ContractAPI from "@/api/project/contract/index.ts"

  //【实例】全局状态
  const globalStore = useGlobalStore()
  //【变量】是否是移动端
  const isMobile = ref(globalStore.isMobile)

  //【变量】是否显示抽屉 - true显示 / false隐藏
  const showDrawer = ref<Boolean>(false)
  //【变量】抽屉宽度
  const drawerWidth = computed(() => {
    return isMobile.value ? "100%" : "70%"
  })
  //【变量】抽屉状态 - 加载中
  const drawerLoading = ref<Boolean>(false)

  //【变量】合同ID
  const id = ref<number>()
  //【变量】管理费类型
  const managementFeeType = ["金额", "费率", "金额+费率"]
  //【变量】合同类型
  const typeSelect = ref<any[]>([])
  //【变量】增减项类型
  const inDecreaseType = [
    { type: "danger", label: "减项" },
    { type: "primary", label: "增项" }
  ]

  //【方法】打开对话框
  function drawerOpen() {
    drawerLoading.value = true
    ContractAPI.getContractDetailOne(id.value!)
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
    // 清空增减项列表
    formModel.value.addOrSub = []
  }

  //【实例】表单
  const formRef = ref<FormInstance>()
  //【变量】表单数据
  let formModel = ref<ContractFormInter>({
    typeId: 0,
    name: "",
    selfCustomer: "",
    partACompanyName: "",
    partBCompanyName: "",
    money: 0,
    managementFeePointsType: 0,
    managementFeeMoney: 0,
    managementFeePercent: 0,
    signDateTime: "",
    startDateTime: "",
    finishDateTime: "",
    customerManagerId: 0,
    qualityGuarantee: "",
    note: "",
    attachments: [],
    addOrSub: []
  })
  //【变量】表单限制
  const formRules = ref<FormRules<ContractFormInter>>({
    name: [{ required: true, message: "请填写合同名称", trigger: "blur" }],
    selfCustomer: [{ required: true, message: "请填写自营/客户", trigger: "blur" }],
    partACompanyName: [{ required: true, message: "请填写甲方公司名称", trigger: "blur" }],
    partBCompanyName: [{ required: true, message: "请填写乙方公司名称", trigger: "blur" }],
    signDateTime: [{ required: true, message: "请选择签约时间", trigger: "change" }],
    startDateTime: [{ required: true, message: "请选择开工时间", trigger: "change" }],
    finishDateTime: [{ required: true, message: "请选择竣工时间", trigger: "change" }],
    customerManagerId: [{ required: true, message: "请选择客户经理", trigger: "change" }],
    qualityGuarantee: [{ required: true, message: "请填写质保时间/金额", trigger: "blur" }]
  })

  //【变量】文件列表布局
  const fileColumns = [
    { label: "名称", prop: "name", minWidth: 200 },
    { label: "大小", prop: "size", width: 100 },
    { label: "操作", prop: "button", width: 100, align: "center", fixed: "right" }
  ]
  //【变量】增减项列表布局
  const inDecreaseColumns = [
    { label: "类型", prop: "type", width: 75, align: "center" },
    { label: "金额", prop: "money", width: 125 },
    { label: "备注", prop: "note", minWidth: 100 }
  ]
  //【方法】下载文件
  function downloadFile(row: any) {
    ContractAPI.downloadContractFile(row.url, row.name)
      .then((res: any) => {
        downloadB(res.data, row.name)
      })
      .finally(() => {
        row.loading = false
      })
  }

  // 暴露给父组件
  defineExpose({ id, typeSelect, showDrawer })
</script>

<style lang="scss" scoped>
  .drawer-page {
    .drawer-form {
      padding-right: 10px;
    }

    .drawer-table {
      padding-left: 10px;

      .table-page:nth-child(2) {
        margin-top: 30px;
      }
    }

    &.isMobile {
      .table-page {
        margin-top: 30px;
      }
    }
  }
</style>

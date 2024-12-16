<template>
  <div v-loading="viewLoading" class="info-page">
    <!-- 基本信息、合同信息、项目成员管理 -->
    <el-row>
      <!-- 基本信息 -->
      <el-col :lg="8">
        <el-descriptions class="basic-info card-bg" title="基本信息" :column="2">
          <template #extra>
            <el-tooltip v-if="btnList.isUpdate && projectInfo.status < 2" content="修改项目">
              <icon-edit size="16" @click="projectUpdateBtn" />
            </el-tooltip>
          </template>
          <el-descriptions-item label="项目名称:" :span="2">{{ projectInfo?.name }}</el-descriptions-item>
          <el-descriptions-item label="项目归属:">{{ ["本地", "异地"][projectInfo?.isFieldProject] }}</el-descriptions-item>
          <el-descriptions-item label="项目类型:">{{ projectInfo?.typeName }}</el-descriptions-item>
          <el-descriptions-item label="立项人:" :span="2">{{ projectInfo?.proposerName }}</el-descriptions-item>
          <el-descriptions-item label="预期截止日期:" :span="2">
            {{ dateFormat(projectInfo?.expectFinishDateTime as string) }}
          </el-descriptions-item>
          <el-descriptions-item label="投标状态:" :span="2">
            <el-tag :type="['info', 'success'][projectInfo.isBid]">{{ ["待中标", "已中标"][projectInfo.isBid] }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-col>

      <!-- 合同信息 -->
      <el-col :lg="8">
        <el-descriptions class="contract-info card-bg" title="合同信息" :column="1">
          <el-descriptions-item label="合同金额:">￥{{ projectInfo?.money || 0 }}</el-descriptions-item>
          <el-descriptions-item label="结算金额:">
            ￥{{ projectInfo?.amount || 0 }}
            <el-tooltip content="合同金额 ( 含增减项 ) "> <icon-help theme="filled"></icon-help> </el-tooltip>
          </el-descriptions-item>

          <el-descriptions-item label="开工时间:">
            {{ dateFormat(projectInfo?.contractStartDateTime as string) }}
          </el-descriptions-item>
          <el-descriptions-item label="竣工时间:">
            {{ dateFormat(projectInfo?.contractFinishDateTime as string) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-col>

      <!-- 项目成员管理 -->
      <el-col :lg="8">
        <el-descriptions class="member-info card-bg" title="项目成员管理" :column="1">
          <template #extra>
            <el-tooltip v-if="btnList.isUpdate && projectInfo.status < 2" content="项目成员管理">
              <icon-every-user size="16" @click="MemberUpdateBtn" />
            </el-tooltip>
          </template>
          <el-descriptions-item label="项目负责人:">{{ projectInfo?.principalName }}</el-descriptions-item>
          <el-descriptions-item label="项目成员:">{{ projectInfo?.memberNames }}</el-descriptions-item>
        </el-descriptions>
      </el-col>
    </el-row>

    <!-- 数据汇总 -->
    <div class="collect-data card-bg">
      <!-- 标题 -->
      <div class="collect-data-header">
        <h1>数据汇总</h1>
        <el-button v-if="btnList.isExport" type="primary" @click="DownloadAccessory">
          <icon-efferent-three />导出项目附件
        </el-button>
      </div>

      <div class="collect-data-body">
        <el-row class="collect-data-item" :class="projectInfo.typeId != 1 ? 'item1' : 'item1-long'">
          <el-col :lg="10">
            <span class="descriptions-title">回款进度</span>

            <p class="large-text">{{ projectInfo.progress }} %</p>
          </el-col>

          <el-col :lg="14">
            <el-descriptions :column="1">
              <template #title><span class="descriptions-title">收款情况</span></template>
              <el-descriptions-item label="结算金额:">￥{{ projectInfo?.amount || 0 }}</el-descriptions-item>
              <el-descriptions-item label="回款合计:">￥{{ projectInfo?.sumConstructionReturn || 0 }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>

        <!-- 劳务项目隐藏 -->
        <div v-if="projectInfo.typeId != 1" class="collect-data-item item2">
          <el-descriptions :column="1">
            <template #title><span class="descriptions-title">成本情况</span></template>
            <el-descriptions-item label="成本总和:">￥{{ projectInfo.sumConstructionImpl || 0 }}</el-descriptions-item>
            <el-descriptions-item label="剩余成本:">
              ￥{{ handleNumber(2, projectInfo.sumConstructionReturn - projectInfo.sumConstructionImpl) || 0 }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="collect-data-item" :class="projectInfo.typeId != 1 ? 'item3' : 'item3-long'">
          <div class="descriptions-title">利润</div>

          <p class="large-text">￥ {{ projectInfo.profit || 0 }}</p>
        </div>

        <div class="collect-data-item item4">
          <el-descriptions :column="1">
            <template #title><span class="descriptions-title">缴税情况</span></template>
            <el-descriptions-item label="纳税总和:">￥{{ projectInfo.sumGlobalTax || 0 }}</el-descriptions-item>
            <el-descriptions-item label="累计个税:">￥{{ projectInfo.sumPersonalTax || 0 }}</el-descriptions-item>
            <el-descriptions-item label="累计预缴税:">￥{{ projectInfo.sumPrepay || 0 }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="collect-data-item item5">
          <el-descriptions :column="1">
            <template #title><span class="descriptions-title">收票情况（进项）</span></template>
            <el-descriptions-item label="累计收票金额:">￥{{ projectInfo.sumIncomeTaxAmount || 0 }}</el-descriptions-item>
            <el-descriptions-item label="累计走款金额:">￥{{ projectInfo.sumIncomeGoneTotal || 0 }}</el-descriptions-item>
            <el-descriptions-item label="累计回款金额:">￥{{ projectInfo.sumIncomeBackTotal || 0 }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="collect-data-item item6">
          <el-descriptions :column="1">
            <template #title><span class="descriptions-title">开票情况（销项）</span></template>
            <el-descriptions-item label="累计开票金额:">￥{{ projectInfo.sumTaxAmount || 0 }}</el-descriptions-item>
            <el-descriptions-item label="未开票金额:">￥{{ projectInfo.notInvoicedMoney || 0 }}</el-descriptions-item>
            <el-descriptions-item label="累计走款:">￥{{ projectInfo.sumGoneMoney || 0 }}</el-descriptions-item>
            <el-descriptions-item label="累计收款:">￥{{ projectInfo.sumProceedsMoney || 0 }}</el-descriptions-item>
            <el-descriptions-item label="累计开票税额:">￥{{ projectInfo.sumTax || 0 }}</el-descriptions-item>
            <el-descriptions-item label="累计收回个税:">￥{{ projectInfo.sumPersonalTaxFee || 0 }}</el-descriptions-item>
            <el-descriptions-item label="累计收回管理费:">￥{{ projectInfo.sumManageFee || 0 }}</el-descriptions-item>
            <el-descriptions-item label="累计收回税费:">￥{{ projectInfo.sumTaxFee || 0 }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="collect-data-item item7">
          <div class="descriptions-title">项目归属</div>

          <p class="large-text">{{ ["本地", "异地"][projectInfo.isFieldProject] }}</p>
        </div>

        <div class="collect-data-item item8">
          <div class="descriptions-title">预缴情况</div>
          <p v-show="projectInfo.isFieldProject == 0" class="large-text">无需预缴</p>

          <p v-show="projectInfo.isFieldProject == 1" class="large-text" :class="{ 'red': projectInfo.isPrepay == 0 }">
            {{ ["待预缴", "已预缴"][projectInfo.isPrepay] }}
          </p>
        </div>

        <div class="collect-data-item item9">
          <div class="descriptions-title">项目备注</div>
          <p class="note">{{ projectInfo.note }}</p>
        </div>

        <div class="collect-data-item item10">
          <div class="descriptions-title">项目类型</div>
          <p class="large-text">
            {{ ["工程（自营）", "劳务", "工程（挂靠）"][projectInfo.nature] }}
          </p>
        </div>
      </div>
    </div>
  </div>
  <!-- 修改 项目信息对话框 -->
  <EditAddDialog ref="editAddDialogRef" />
  <!-- 修改项目成员信息 对话框 -->
  <EditAddMember ref="editAddMemberRef" />
</template>

<script setup lang="ts" name="ProjectInfo">
  import { ref, onMounted, computed } from "vue"
  import { ElMessage, ElMessageBox } from "element-plus"
  import EditAddMember from "./components/EditAddMember.vue"
  import EditAddDialog from "@/views/project/components/EditAddDialog.vue"
  // exportAttachments 导出附件
  import { exportAttachments } from "@/api/project/info/index.ts"
  import { dateFormat, handleNumber } from "@/utils/handle.ts"
  import useAuthStore from "@/stores/modules/auth.ts"
  import useProjectStore from "@/stores/modules/project.ts"

  //【实例】权限 - pinia
  const btnList = useAuthStore().btnList
  //【实例】项目信息 - pinia
  const projectStore = useProjectStore()
  //【变量】项目信息
  const projectInfo = computed(() => projectStore.info)
  //【实例】项目立项表单 - 对话框
  const editAddDialogRef = ref<InstanceType<typeof EditAddDialog>>()
  //【实例】项目成员管理 - 对话框
  const editAddMemberRef = ref<InstanceType<typeof EditAddMember>>()

  //【变量】页面状态 - 加载中
  const viewLoading = ref<Boolean>(false)

  /**修改项目信息按钮*/
  const projectUpdateBtn = () => {
    if (editAddDialogRef.value) {
      editAddDialogRef.value.id = projectInfo.value.id
      editAddDialogRef.value.FormType = 1
      editAddDialogRef.value.isShow = true
    }
  }

  //存放修改成员信息对话框 实例
  /**修改修改成员按钮*/
  const MemberUpdateBtn = () => {
    if (editAddMemberRef.value) {
      editAddMemberRef.value.id = projectInfo.value.id
      editAddMemberRef.value.isShow = true
    }
  }
  //导出附件
  const DownloadAccessory = () => {
    ElMessageBox.prompt("是否添加导出任务？", "提示", {
      type: "warning",
      confirmButtonText: "确认导出",
      inputPlaceholder: "导出文件名称（用于下载至本地的文件名称）",
      inputValidator: value => {
        if (!value) return "请输入导出文件名称"
      }
    }).then(({ value }) => {
      exportAttachments(projectInfo.value.id, value).then(() => {
        ElMessage({
          message: "导出任务提交成功，请前往【下载中心】下载",
          type: "success"
        })
      })
    })
  }

  onMounted(() => {
    projectStore.getProjectInfo()
  })
</script>

<style lang="scss" scoped>
  $padding: 10px;

  .info-page {
    .basic-info,
    .contract-info,
    .member-info {
      margin-bottom: 20px;
      height: 250px;
    }

    .collect-data {
      .collect-data-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .collect-data-body {
        margin-top: 20px;
        display: grid;
        grid-template-columns: auto;
        grid-template-rows: repeat(3, auto);
        grid-auto-flow: row dense;

        .collect-data-item {
          margin: 5px;
          padding: 10px;
          border: 1px solid var(--el-border-color-lighter);
          border-radius: $circle-radius;
          overflow: hidden;
        }
      }
    }

    @media (min-width: 1200px) {
      // 合同信息、项目成员管理
      .contract-info,
      .member-info {
        margin-left: 20px;
      }

      // 数据汇总
      .collect-data-body {
        grid-template-columns: repeat(12, 8.33%) !important;

        .collect-data-item {
          &.item1 {
            grid-column-start: 1;
            grid-column-end: 5;
          }

          &.item1-long {
            grid-column-start: 1;
            grid-column-end: 7;
          }

          &.item2 {
            grid-column-start: 5;
            grid-column-end: 9;
          }

          &.item3 {
            grid-column-start: 9;
            grid-column-end: 13;
          }

          &.item3-long {
            grid-column-start: 7;
            grid-column-end: 13;
          }

          &.item4 {
            grid-column-start: 1;
            grid-column-end: 4;
            grid-row-start: 2;
            grid-row-end: 3;
          }

          &.item5 {
            grid-column-start: 1;
            grid-column-end: 4;
            grid-row-start: 3;
            grid-row-end: 4;
          }

          &.item6 {
            grid-column-start: 4;
            grid-column-end: 7;
            grid-row-start: 2;
            grid-row-end: 4;
          }

          &.item7 {
            grid-column-start: 7;
            grid-column-end: 10;
            grid-row-start: 2;
            grid-row-end: 3;
          }

          &.item8 {
            grid-column-start: 10;
            grid-column-end: 13;
            grid-row-start: 2;
            grid-row-end: 3;
          }

          &.item9 {
            grid-column-start: 7;
            grid-column-end: 10;
            grid-row-start: 3;
            grid-row-end: 4;
          }

          &.item10 {
            grid-column-start: 10;
            grid-column-end: 13;
            grid-row-start: 3;
            grid-row-end: 4;
          }
        }
      }

      .item-row2 {
        height: 340px;
      }

      .item-row2-mini {
        margin: 0 5px !important;
        height: 160px;
      }

      .item-row2-flex {
        margin-top: 5px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 340px;
      }
    }
  }

  .descriptions-title {
    color: #999999;
    font-weight: normal;
    font-size: 14px;
  }

  .large-text {
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(100% - 30px);
    font-size: 2rem;
    font-weight: bold;

    &.red {
      color: var(--el-color-danger);
    }
  }

  .note {
    margin-top: 16px;
    font-size: 14px;
  }

  .i-icon {
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary);
    }
  }
</style>

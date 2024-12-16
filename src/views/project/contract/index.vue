<template>
  <div>
    <el-row v-show="!isFirstUpdate || isUpdate">
      <!-- 表单 -->
      <el-col :lg="18" :xl="20">
        <div v-loading="viewLoading" class="form-page card-bg">
          <!-- header -->
          <div class="page-header">
            <div class="page-header-title">合同表单</div>
            <el-tooltip v-if="btnList.isUpdate && projectInfo.status < 2" content="编辑" placement="left">
              <icon-edit v-show="!isUpdate" class="page-header-icon" size="18" @click="isUpdate = true" />
            </el-tooltip>
          </div>

          <!-- content -->
          <el-form ref="formRef" label-width="auto" label-suffix="：" :model="formModel" :rules="formRules" :disabled="!isUpdate">
            <el-row :gutter="10">
              <el-col :lg="12">
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

                <el-form-item v-if="projectInfo.nature > 0" label="管理费类型" prop="managementFeePointsType" required>
                  <el-select v-model="formModel.managementFeePointsType" placeholder="管理费类型">
                    <el-option v-for="(item, i) in managementFeeType" :key="i" :label="item" :value="i" />
                  </el-select>
                </el-form-item>

                <el-form-item
                  v-if="
                    projectInfo.nature > 0 && (formModel.managementFeePointsType == 0 || formModel.managementFeePointsType == 2)
                  "
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
                  v-if="projectInfo.nature > 0 && formModel.managementFeePointsType > 0"
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

                <el-form-item class="form-input-number">
                  <template #label>
                    <div>
                      含税利润
                      <el-tooltip>
                        <IconHelp theme="filled"></IconHelp>

                        <template #content>
                          <p>挂靠项目：</p>
                          <p>1、按管理费金额：含税利润 = 管理费金额</p>
                          <p>2、按管理费费率：含税利润 = 结算金额 x 管理费率 ÷ (1 + 管理费率)</p>
                          <p>3、按管理费金额 + 管理费费率：含税利润 = 结算金额 x 管理费率 ÷ (1 + 管理费率) + 管理费金额</p>
                          <br />
                          <p>自营项目：</p>
                          <p>1、无管理费：含税利润 = 结算金额 - 成本总和</p>
                        </template>
                      </el-tooltip>
                      ：
                    </div>
                  </template>

                  <div class="prefix">￥</div>
                  <el-input-number v-model="taxProfit" :precision="2" :controls="false" disabled />
                </el-form-item>
              </el-col>

              <el-col :lg="12">
                <el-form-item label="签约时间" prop="signDateTime">
                  <el-date-picker
                    v-model="formModel.signDateTime"
                    placeholder="选择日期"
                    value-format="YYYY-MM-DD 00:00:00"
                    clearable />
                </el-form-item>

                <el-form-item label="开工时间" prop="startDateTime">
                  <el-date-picker
                    v-model="formModel.startDateTime"
                    placeholder="选择日期"
                    value-format="YYYY-MM-DD 00:00:00"
                    clearable />
                </el-form-item>

                <el-form-item label="竣工时间" prop="finishDateTime">
                  <el-date-picker
                    v-model="formModel.finishDateTime"
                    placeholder="选择日期"
                    value-format="YYYY-MM-DD 00:00:00"
                    clearable />
                </el-form-item>

                <el-form-item label="客户经理" prop="customerManagerId">
                  <el-select
                    v-model="formModel.customerManagerId"
                    placeholder="合同类型"
                    filterable
                    remote
                    :remote-method="remoteMethod"
                    :loading="selectLoading"
                    clearable>
                    <el-option v-for="(item, i) in staffList" :key="i" :label="item.name" :value="item.id" />
                  </el-select>
                </el-form-item>

                <el-form-item label="质保信息" prop="qualityGuarantee">
                  <el-input v-model="formModel.qualityGuarantee" placeholder="质保时间/金额" maxlength="250" clearable />
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
              </el-col>
            </el-row>
          </el-form>

          <!-- footer -->
          <div v-show="isUpdate" class="form-footer">
            <el-button @click="cancelForm()">取消</el-button>
            <el-button v-show="isFirstUpdate" type="primary" @click="addContract()">确认添加</el-button>
            <el-button v-show="!isFirstUpdate" type="warning" @click="updateContract()">确认修改</el-button>
          </div>
        </div>
      </el-col>

      <!-- 附件 / 增减项 -->
      <el-col :lg="6" :xl="4">
        <!-- 附件 -->
        <div v-loading="viewLoading" class="file-page card-bg">
          <!-- header -->
          <div class="page-header">
            <div class="page-header-title">附件</div>

            <el-upload
              v-if="btnList.isUpdate && projectInfo.status < 2"
              :action="uploadUrl"
              :headers="uploadHeader"
              :data="uploadData"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :on-success="successUpload"
              :on-error="errorUpload">
              <el-tooltip content="上传附件" placement="left">
                <el-link v-loading="uploadLoading" :underline="false" style="color: #000">
                  <icon-upload size="16" />
                </el-link>
              </el-tooltip>
            </el-upload>
          </div>

          <!-- content -->
          <el-scrollbar style="height: calc(100% - 40px)">
            <div v-for="(item, i) in formModel.attachments" :key="i" class="file-item">
              <el-tooltip :content="item.name" placement="left">
                <p class="file-item-title">{{ item.name }}</p>
              </el-tooltip>
              <p class="file-item-size">大小：{{ handleFilesize(item.size) }}</p>

              <div class="file-item-btn">
                <el-link type="primary" :underline="false" @click="downloadFile(item)"> <icon-to-bottom />下载 </el-link>
                <el-link
                  v-if="btnList.isUpdate && projectInfo.status < 2"
                  type="danger"
                  :underline="false"
                  @click="deleteFile(i)">
                  <icon-delete />删除
                </el-link>
              </div>
            </div>
          </el-scrollbar>
        </div>

        <!-- 增减项 -->
        <div v-loading="viewLoading" class="indecrease-page card-bg">
          <!-- header -->
          <div class="page-header">
            <div class="page-header-title">增减项</div>
            <el-tooltip v-if="btnList.isUpdate && projectInfo.status < 2" content="添加增减项" placement="left">
              <icon-plus class="page-header-icon" size="18" @click="showDialogInDecrease(0)" />
            </el-tooltip>
          </div>

          <!-- content -->
          <el-scrollbar style="height: calc(100% - 40px)">
            <el-timeline class="indecrease-item">
              <el-timeline-item v-for="(item, i) in formModel.addOrSub" :key="i" :type="item.type ? 'primary' : 'danger'" hollow>
                <div class="indecrease-item-title">
                  <p>{{ item.type ? "+" : "-" }} {{ item.money }}</p>

                  <el-dropdown v-if="btnList.isUpdate && projectInfo.status < 2" trigger="click" :hide-on-click="false">
                    <el-link :underline="false">
                      <icon-more class="indecrease-item-icon" />
                    </el-link>
                    <template #dropdown>
                      <!-- 气泡确认框 -->
                      <el-dropdown-menu>
                        <el-dropdown-item @click="showDialogInDecrease(1, i)"> 修改 </el-dropdown-item>
                        <el-dropdown-item @click="deleteDecrease(i)"> 删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>

                <div class="indecrease-item-note">{{ item.note }}</div>
              </el-timeline-item>
            </el-timeline>
          </el-scrollbar>
        </div>
      </el-col>
    </el-row>

    <div v-show="isFirstUpdate && !isUpdate" class="no-data card-bg">
      <icon-agreement class="text" size="60" stroke-width="2" />
      <span class="text">暂无数据</span>

      <el-button v-if="btnList.isAdd && projectInfo.status < 2" type="primary" @click="isUpdate = true">
        <icon-plus />添加合同
      </el-button>
    </div>

    <!-- 【对话框】添加、修改增/减项 -->
    <DialogInDecrease ref="inDecreaseRef" @update="updateInDecrease" />
  </div>
</template>

<script setup lang="ts" name="ProjectBid">
  import { ref, computed, onMounted, nextTick } from "vue"
  import { ElMessage, ElMessageBox } from "element-plus"
  import type { FormInstance, FormRules, UploadFile } from "element-plus"
  import type { ContractFormInter } from "@/api/project/contract/types.ts"
  import { handleFilesize, downloadB } from "@/utils/handle.ts"
  import DialogInDecrease from "./components/DialogInDecrease.vue"
  import * as ContractAPI from "@/api/project/contract/index.ts"
  import * as StaffAPI from "@/api/system/staff/index.ts"
  import useAuthStore from "@/stores/modules/auth.ts"
  import useProjectStore from "@/stores/modules/project.ts"
  import { handleNumber } from "@/utils/handle.ts"

  //【实例】项目信息 - 实例
  const projectStore = useProjectStore()

  //【变量】是否编辑表单
  const isUpdate = ref<Boolean>(false)
  //【变量】是否首次修改
  const isFirstUpdate = ref<Boolean>(false)
  //【变量】页面状态 - 加载中
  const viewLoading = ref<Boolean>(false)
  //【变量】选择器状态 - 加载中
  const selectLoading = ref<Boolean>(false)
  //【变量】保存按钮 - 加载中
  const subLoading = ref<Boolean>(false)
  //【变量】按钮权限列表
  const btnList = useAuthStore().btnList

  //【变量】项目信息
  const projectInfo = computed(() => projectStore.info)
  //【变量】管理费类型
  const managementFeeType = ["金额", "费率", "金额+费率"]
  //【变量】合同类型
  const typeSelect = projectStore.contractTypeList
  //【变量】员工列表
  const staffList = ref<any[]>([])
  //【方法】查询员工
  const remoteMethod = (query: string) => {
    selectLoading.value = true

    StaffAPI.getStaffList({ name: query }, { current: 1, pagesize: 100 })
      .then((res: any) => {
        staffList.value = res.data.data.records
      })
      .finally(() => {
        selectLoading.value = false
      })
  }
  //【变量】结算金额
  const amount = computed(() => {
    let count = 0

    formModel.value.addOrSub.forEach((item: any) => {
      if (item.type) {
        count += item.money
      } else {
        count -= item.money
      }
    })

    return handleNumber(2, formModel.value.money + count)
  })
  //【变量】含税利润
  const taxProfit = computed(() => {
    if (projectInfo.value.nature > 0) {
      // 管理费率
      const manageRate = projectInfo.value.managementFeePercent / 100

      // 劳务、工程挂靠项目(根据管理费类型计算)
      switch (formModel.value.managementFeePointsType) {
        case 0:
          // 【0金额】含税利润 = 管理费金额
          return formModel.value.managementFeeMoney

        case 1:
          // 【1费率】含税利润 = 结算金额 x 管理费率 ÷ (1 + 管理费率)
          console.log(handleNumber(2, (amount.value * manageRate) / (1 + manageRate)))
          return handleNumber(2, (amount.value * manageRate) / (1 + manageRate))

        case 2:
          // 【2金额+费率】含税利润 = 结算金额 x 管理费率 ÷ (1 + 管理费率) + 管理费金额
          return handleNumber(2, (amount.value * manageRate) / (1 + manageRate) + formModel.value.managementFeeMoney)

        default:
          return 0
      }
    } else {
      // 自营项目(无管理费)含税利润 = 结算金额 - 成本总和】
      return handleNumber(2, amount.value - projectInfo.value.sumConstructionImpl)
    }
  })

  //【实例】表单
  const formRef = ref<FormInstance>()
  //【变量】表单数据
  let formModel = ref<ContractFormInter>({
    typeId: null,
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
    customerManagerId: null,
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
  //【方法】获取合同详情
  const getData = () => {
    viewLoading.value = true

    ContractAPI.getContractDetailTwo(sessionStorage.projectId)
      .then((res: any) => {
        // 更新项目信息
        projectStore.getProjectInfo()

        // 如果res.data.data为空，则表示该项目没有招投标记录，需要添加
        isFirstUpdate.value = true

        if (res.data.data) {
          isFirstUpdate.value = false
          formModel.value = res.data.data
          remoteMethod(res.data.data.customerManagerName)
        }
      })
      .finally(() => {
        viewLoading.value = false
      })
  }
  //【方法】添加合同
  const addContract = async () => {
    await formRef.value?.validate(valid => {
      if (valid) {
        subLoading.value = true
        formModel.value.projectId = sessionStorage.projectId

        ContractAPI.addContract(formModel.value)
          .then(() => {
            ElMessage.success("添加成功")
            isUpdate.value = false

            getData()
          })
          .finally(() => {
            subLoading.value = false
          })
      } else {
        ElMessage.error("修改失败，请按照提示完成输入")
      }
    })
  }
  //【方法】修改合同
  const updateContract = async () => {
    await formRef.value?.validate(valid => {
      if (valid) {
        subLoading.value = true
        formModel.value.projectId = sessionStorage.projectId

        ContractAPI.updateContract(formModel.value)
          .then(() => {
            ElMessage.success("修改成功")
            isUpdate.value = false

            getData()
          })
          .finally(() => {
            subLoading.value = false
          })
      } else {
        ElMessage.error("修改失败，请按照提示完成输入")
      }
    })
  }
  //【方法】取消
  const cancelForm = () => {
    isUpdate.value = false
    formRef.value.resetFields()
    getData()
  }

  //【变量】上传状态 - 加载中
  const uploadLoading = ref<Boolean>(false)
  //【变量】上传路径
  const uploadUrl = `${import.meta.env.VITE_API_URL}/project/contract/upload`
  //【变量】上传请求头
  const uploadHeader = { token: localStorage.engineeringToken }
  //【变量】上传附带参数
  const uploadData = {}
  //【方法】上传文件前
  function beforeUpload(file: any) {
    if (file.size > 1024 * 1024 * 200) {
      ElMessage.error("请上传 200M 内的 文档文件")
      return false
    } else {
      uploadLoading.value = true
    }
  }
  //【方法】上传成功
  function successUpload(response: any, uploadFile: UploadFile) {
    if (response.code == 200) {
      const data = {
        orderNumber: formModel.value.attachments.length,
        name: uploadFile.name,
        type: uploadFile.name.substr(uploadFile.name.lastIndexOf(".") + 1, uploadFile.name.length),
        url: response.data,
        note: "",
        size: uploadFile.size
      }
      formModel.value.attachments.unshift(data)

      // 判断是否首次添加，如果不是则请求修改接口
      if (!isFirstUpdate.value) {
        ContractAPI.updateContract(formModel.value)
          .then(() => {
            ElMessage.success("上传成功")

            getData()
          })
          .finally(() => {
            uploadLoading.value = false
          })
      }
    } else {
      uploadLoading.value = false
      ElMessage.error(response.msg)
    }
  }
  //【方法】上传失败
  function errorUpload() {
    uploadLoading.value = false
    ElMessage.error("上传失败")
  }
  //【方法】下载文件
  const downloadFile = (row: any) => {
    ContractAPI.downloadContractFile(row.url, row.name)
      .then((res: any) => {
        downloadB(res.data, row.name)
      })
      .finally(() => {
        row.loading = false
      })
  }

  //【方法】删除文件
  const deleteFile = (index: number) => {
    ElMessageBox.confirm("此操作将永久删除该文件，是否继续？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(() => {
      formModel.value.attachments.splice(index, 1)

      // 判断是否首次添加，如果不是则请求修改接口
      if (!isFirstUpdate.value) {
        ContractAPI.updateContract(formModel.value).then(() => {
          ElMessage.success("删除成功")

          getData()
        })
      }
    })
  }

  //【实例】组件-增减项（对话框）
  const inDecreaseRef = ref()
  //【变量】增减项当前更改行数
  const inDecreaseIndex = ref<number>()
  //【方法】添加 / 修改增减项
  function showDialogInDecrease(type: number, index?: number) {
    inDecreaseIndex.value = index

    inDecreaseRef.value.showDialog = true
    inDecreaseRef.value.dialogType = type

    if (type == 1) inDecreaseRef.value.formModel = formModel.value.addOrSub[index!]
  }
  //【方法】删除增减项
  function deleteDecrease(index: number) {
    ElMessageBox.confirm("此操作将永久删除该增减项，是否继续？", "提示", { type: "warning" }).then(() => {
      formModel.value.addOrSub.splice(index, 1)

      // 判断是否首次添加，如果不是则请求修改接口
      if (!isFirstUpdate.value) {
        ContractAPI.updateContract(formModel.value).then(() => {
          ElMessage.success("删除成功")

          getData()
        })
      }
    })
  }
  //【方法】更新增减项
  function updateInDecrease(type: number, data: any) {
    if (type) {
      // 修改
      formModel.value.addOrSub[inDecreaseIndex.value!] = data
    } else {
      // 添加
      formModel.value.addOrSub.unshift(data)
    }

    nextTick(() => {
      // 判断是否首次添加，如果不是则请求修改接口
      if (!isFirstUpdate.value) {
        ContractAPI.updateContract(formModel.value)
          .then(() => {
            ElMessage.success(`${type ? "修改" : "添加"}成功`)

            getData()
          })
          .finally(() => {
            uploadLoading.value = false
          })
      }
    })
  }

  // 【生命周期】挂载后
  onMounted(() => {
    getData()
  })
</script>

<style lang="scss" scoped>
  .no-data {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 90px);

    .text {
      color: var(--el-text-color-regular);
    }

    button {
      margin-top: 30px;
    }
  }

  .page-header {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .page-header-title {
      padding-left: 5px;
      border-left: 3px solid var(--el-color-primary);
    }

    .page-header-icon {
      cursor: pointer;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  .form-page {
    position: relative;
    height: calc(100% + 30px);

    .form-footer {
      position: absolute;
      right: 20px;
      bottom: 20px;
    }
  }

  .file-page {
    margin-top: 50px;

    .file-item {
      padding-bottom: 10px;
      width: 100%;
      font-size: 14px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:nth-child(n + 3) {
        margin-top: 10px;
      }

      a {
        font-size: 14px;
      }

      .file-item-title {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .file-item-size {
        margin: 5px 0;
        font-size: 14px;
        color: var(--el-text-color-placeholder);
      }

      .file-item-btn {
        display: flex;
        justify-content: space-around;
        align-items: center;
      }
    }
  }

  .indecrease-page {
    margin-top: 20px;

    .indecrease-item {
      padding: 0 5px;

      .indecrease-item-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;

        .indecrease-item-icon {
          cursor: pointer;
        }
      }

      .indecrease-item-note {
        margin-top: 5px;
        font-size: 14px;
        color: var(--el-text-color-placeholder);
      }
    }
  }

  @media (min-width: 1200px) {
    .form-page,
    .file-page,
    .indecrease-page {
      margin: 0;
    }

    .form-page {
      margin-right: 10px;
      height: calc(100vh - 90px);
    }

    .file-page {
      margin-left: 10px;
      height: calc(50vh - 55px);
    }

    .indecrease-page {
      margin-top: 20px;
      margin-left: 10px;
      height: calc(50vh - 55px);
    }
  }
</style>

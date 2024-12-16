<template>
  <el-drawer
    v-model="showDrawer"
    :title="drawerTitle[drawerType]"
    :size="drawerWidth"
    :close-on-click-modal="drawerType == 2"
    destroy-on-close
    @open="drawerOpen()"
    @close="drawerClose()">
    <el-row v-loading="drawerLoading" class="drawer-page" :class="{ isMobile: isMobile }">
      <!-- 表单 -->
      <el-col :lg="12" class="drawer-form">
        <el-form
          ref="formRef"
          label-width="auto"
          label-suffix="："
          :model="formModel"
          :rules="formRules"
          :disabled="drawerType == 2">
          <el-form-item class="form-input-number" label="含税金额" prop="taxAmount" required>
            <div class="prefix">￥</div>
            <el-input-number
              v-model="formModel.taxAmount"
              placeholder="含税金额"
              :min="0"
              :max="999999999999"
              :precision="2"
              :value-on-clear="0"
              :controls="false" />
          </el-form-item>

          <el-form-item class="form-input-number" label="税率" prop="taxRate" required>
            <el-input-number
              v-model="formModel.taxRate"
              placeholder="税率"
              :min="0"
              :max="100"
              :precision="2"
              :value-on-clear="0"
              :controls="false" />
            <div class="suffix">%</div>
          </el-form-item>

          <el-form-item class="form-input-number">
            <template #label>
              <div>
                税额
                <el-tooltip content="税额 = 含税金额 x 税率 ÷ (1 + 税率)">
                  <IconHelp theme="filled"></IconHelp>
                </el-tooltip>
                ：
              </div>
            </template>
            <div class="prefix">￥</div>
            <el-input-number
              v-model="taxAmount"
              placeholder="税额"
              :precision="2"
              :value-on-clear="taxAmount"
              :controls="false"
              disabled />
          </el-form-item>

          <el-form-item class="form-input-number" label="管理点数" prop="inManagementPoints" required>
            <el-input-number
              v-model="formModel.inManagementPoints"
              placeholder="管理点数"
              :min="0"
              :max="100"
              :precision="2"
              :value-on-clear="0"
              :controls="false" />
            <div class="suffix">%</div>
          </el-form-item>

          <el-form-item class="form-input-number">
            <template #label>
              <div>
                开票管理费
                <el-tooltip content="开票管理费=含税金额*购票点数/(1+购票点数)">
                  <IconHelp theme="filled"></IconHelp>
                </el-tooltip>
                ：
              </div>
            </template>
            <div class="prefix">￥</div>

            <el-input-number
              v-model="invoiceMoney"
              placeholder="开票管理费"
              :precision="2"
              :value-on-clear="invoiceMoney"
              :controls="false"
              disabled />
          </el-form-item>

          <el-form-item label="转账日期" prop="invoiceTransferDateTime">
            <el-date-picker
              v-model="formModel.invoiceTransferDateTime"
              value-format="YYYY-MM-DD 23:59:59"
              type="date"
              placeholder="选择日期"
              clearable />
          </el-form-item>

          <el-form-item label="开票日期" prop="invoiceDateTime">
            <el-date-picker
              v-model="formModel.invoiceDateTime"
              value-format="YYYY-MM-DD 23:59:59"
              type="date"
              placeholder="选择日期"
              clearable />
          </el-form-item>

          <el-form-item label="对接人" prop="materialJoinerId">
            <el-select
              v-model="formModel.materialJoinerId"
              remote
              :remote-method="remoteMethod"
              :loading="materialJoinerIdLoading"
              filterable
              placeholder="对接人"
              clearable>
              <el-option v-for="item in materialJoinerIdList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
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

      <!-- 文件列表 -->
      <el-col :lg="12" class="drawer-table">
        <div v-loading="uploadLoading" class="table-page">
          <!-- 上传文件 -->
          <div class="table-page-header">
            <div class="table-page-header-title">附件</div>

            <el-upload
              :action="uploadUrl"
              :headers="uploadHeader"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :on-success="successUpload"
              :on-error="errorUpload">
              <el-button v-if="drawerType != 2" type="primary"><icon-upload />&nbsp;上传文件</el-button>
            </el-upload>
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
                <template v-if="item.prop == 'size'"> {{ handleFilesize(scope.row.size) }}</template>
                <div v-if="item.prop == 'button'" class="table-btn">
                  <el-link v-if="drawerType == 2" type="primary" :underline="false" @click="downloadFile(scope.row)">
                    下载
                  </el-link>
                  <el-link v-if="drawerType != 2" type="danger" :underline="false" @click="removeFile(scope.$index)">
                    删除
                  </el-link>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>

    <template v-if="drawerType != 2" #footer>
      <el-button @click="showDrawer = false"> 取消 </el-button>
      <el-button v-if="drawerType == 0" type="primary" :loading="drawerLoading" @click="AddBtn"> 确认添加 </el-button>
      <el-button v-if="drawerType == 1" type="warning" :loading="drawerLoading" @click="EditBtn"> 确认修改 </el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from "vue"
  import { ElMessage, ElMessageBox } from "element-plus"
  import type { FormInstance, FormRules, UploadFile } from "element-plus"
  import useGlobalStore from "@/stores/modules/global.ts"
  import type { invoiceFormInter, employeeIdListInter, AttachmentInter } from "@/api/project/income/types.ts"
  //addIncome添加收票历史 download下载 修改updateIncome收票历史
  import { addIncome, download, updateIncome } from "@/api/project/income/index.ts"
  //下载文件   handleFilesize 文件大小转换
  import { downloadB, handleFilesize } from "@/utils/handle.ts"
  // getStaffList 搜索 成员
  import { getStaffList } from "@/api/system/staff/index.ts"
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
  //【变量】抽屉类型【0添加，1修改，2查看】
  const drawerType = ref<number>(0)
  //【变量】抽屉标题
  const drawerTitle = reactive<string[]>(["添加收票历史", "修改收票历史", "查看收票历史"])
  //【变量】招投标ID
  const id = ref<number>()
  //【变量】抽屉状态【加载中】
  const drawerLoading = ref<Boolean>(false)
  //存放 修改时 传入的收票详细
  const invoice = ref()
  //【方法】关闭对话框
  function drawerClose() {
    // 清空表单
    formRef.value?.resetFields()
    // 清空文件列表
    formModel.attachments = []
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
  let formModel = reactive<invoiceFormInter>({
    "projectId": sessionStorage.projectId,
    "taxRate": 0,
    "taxAmount": 0,
    "inManagementPoints": 0,
    "invoiceTransferDateTime": "",
    "invoiceDateTime": "",
    "materialJoinerId": "",
    "note": "",
    "attachments": []
  })
  //税额
  const taxAmount = computed(() => {
    return (formModel.taxAmount * (formModel.taxRate / 100)) / (1 + formModel.taxRate / 100)
  })
  // 开票管理费=含税金额*购票点数/(1+购票点数)
  const invoiceMoney = computed(() => {
    return (formModel.taxAmount * (formModel.inManagementPoints / 100)) / (formModel.inManagementPoints / 100 + 1)
  })

  //【变量】表单限制
  const formRules = reactive<FormRules<invoiceFormInter>>({
    invoiceTransferDateTime: [{ required: true, message: "请选择转账日期", trigger: "blur" }],
    invoiceDateTime: [{ required: true, message: "请选择开票日期", trigger: "blur" }],
    materialJoinerId: [{ required: true, message: "请填写对接人", trigger: "blur" }]
  })
  // 向父组件传递事件，定义事件
  const emit = defineEmits(["update"])
  //存放 员工 列表信息 用于 选择对接人
  const materialJoinerIdList = ref<employeeIdListInter[]>([])
  //设置 对接人加载
  const materialJoinerIdLoading = ref<boolean>(false)
  //搜索员工
  const remoteMethod = (query: string) => {
    materialJoinerIdLoading.value = true
    getStaffList({ name: query }, { current: 1, pagesize: 100 })
      .then((res: any) => {
        materialJoinerIdList.value = res.data.data.records
      })
      .finally(() => {
        materialJoinerIdLoading.value = false
      })
  }

  //【方法】打开对话框
  function drawerOpen() {
    if (drawerType.value) {
      formModel.taxRate = invoice.value.taxRate
      formModel.taxAmount = invoice.value.taxAmount
      formModel.inManagementPoints = invoice.value.inManagementPoints
      formModel.invoiceTransferDateTime = invoice.value.invoiceTransferDateTime
      formModel.invoiceDateTime = invoice.value.invoiceDateTime
      formModel.materialJoinerId = invoice.value.materialJoinerId
      formModel.note = invoice.value.note
      formModel.attachments = invoice.value.attachments
      remoteMethod(invoice.value.materialJoinerName)
    }
  }
  //添加表单
  const AddBtn = async () => {
    await formRef.value?.validate(valid => {
      if (valid) {
        drawerLoading.value = true
        addIncome(formModel)
          .then(() => {
            emit("update")
            ElMessage.success("添加成功")
          })
          .finally(() => {
            drawerLoading.value = false
            showDrawer.value = false
          })
      } else {
        ElMessage.error("添加失败，请按照提示完成输入")
      }
    })
  }

  const EditBtn = async () => {
    await formRef.value?.validate(valid => {
      if (valid) {
        invoice.value.taxRate = formModel.taxRate
        invoice.value.taxAmount = formModel.taxAmount
        invoice.value.inManagementPoints = formModel.inManagementPoints
        invoice.value.invoiceTransferDateTime = formModel.invoiceTransferDateTime
        invoice.value.invoiceDateTime = formModel.invoiceDateTime
        invoice.value.materialJoinerId = formModel.materialJoinerId
        invoice.value.note = formModel.note
        invoice.value.attachments = formModel.attachments
        updateIncome(invoice.value)
          .then(() => {
            emit("update")
            ElMessage.success("修改成功")
          })
          .finally(() => {
            drawerLoading.value = false
            showDrawer.value = false
          })
      } else {
        ElMessage.error("修改失败，请按照提示完成输入")
      }
    })
  }

  //【变量】上传状态【加载中】
  const uploadLoading = ref<Boolean>(false)
  //【变量】上传路径
  const uploadUrl = `${import.meta.env.VITE_API_URL}/project/income/incomeBase/upload`
  //【变量】上传请求头
  const uploadHeader = { token: localStorage.engineeringToken }

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
      if (uploadFile.raw) {
        const data: AttachmentInter = {
          orderNumber: formModel.attachments.length,
          name: uploadFile.name,
          type: uploadFile.name.substr(uploadFile.name.lastIndexOf(".") + 1, uploadFile.name.length),
          url: response.data,
          note: "",
          size: uploadFile.size as number
        }
        formModel.attachments.unshift(data)
        ElMessage.success("上传成功")
      }
    } else {
      ElMessage.error(response.msg)
    }
    uploadLoading.value = false
  }
  //【方法】上传失败
  function errorUpload() {
    uploadLoading.value = false
    ElMessage.error("上传失败")
  }
  //【方法】下载文件
  function downloadFile(data: any) {
    download(data.url, data.name).then((res: any) => {
      downloadB(res.data, data.name)
    })
  }
  //【方法】删除文件
  function removeFile(index: number) {
    ElMessageBox.confirm("此操作将永久删除该文件，是否继续？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(() => {
      formModel.attachments.splice(index, 1)
      ElMessage.success("删除成功")
    })
  }

  // 暴露给父组件
  defineExpose({ id, showDrawer, drawerType, invoice })
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

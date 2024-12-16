<template>
  <el-drawer
    v-model="showDrawer"
    :title="drawerTitle[drawerType]"
    :size="drawerWidth"
    :close-on-click-modal="drawerType == 2"
    destroy-on-close
    @open="drawerOpen()"
    @close="drawerClose()">
    <div v-loading="drawerLoading">
      <!-- 表单 -->

      <el-form
        ref="formRef"
        label-width="auto"
        label-suffix="："
        :model="formModel"
        :rules="formRules"
        :disabled="drawerType == 2">
        <el-form-item label="项目编号">
          <el-input v-model="formModel.projectId" placeholder="项目编号" disabled />
        </el-form-item>

        <el-form-item label="合同编号">
          <el-input v-model="contract.id" placeholder="合同编号" disabled />
        </el-form-item>

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

        <el-form-item class="form-input-number" label="税率" prop="dutyRate" required>
          <el-input-number
            v-model="formModel.dutyRate"
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

          <el-input-number v-model="taxAmount" placeholder="税额" :precision="2" :value-on-clear="0" :controls="false" disabled />
        </el-form-item>
        <el-form-item label="开票日期" prop="outputDateTime">
          <el-date-picker
            v-model="formModel.outputDateTime"
            value-format="YYYY-MM-DD 23:59:59"
            type="date"
            placeholder="选择日期"
            clearable />
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

      <!-- 文件列表 -->

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
                <el-link v-if="drawerType != 2" type="danger" :underline="false" @click="removeFile(scope.$index)">
                  删除
                </el-link>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template v-if="drawerType != 2" #footer>
      <el-button @click="showDrawer = false"> 取消 </el-button>
      <el-button v-if="drawerType == 0" type="primary" :loading="drawerLoading" @click="AddBtn"> 确认添加 </el-button>
      <el-button v-if="drawerType == 1" type="warning" :loading="drawerLoading" @click="EditBtn"> 确认修改 </el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from "vue"
  import { ElMessage, ElMessageBox } from "element-plus"
  import type { FormInstance, FormRules, UploadFile } from "element-plus"
  import useGlobalStore from "@/stores/modules/global.ts"
  import type { outgoFormInter, AttachmentInter } from "@/api/project/outgo/types.ts"
  import { handleFilesize } from "@/utils/handle.ts"
  //addOutputBase 添加开票 updateOutputBase 修改开票信息
  import { getOutputBaseDetail, addOutputBase, updateOutputBase } from "@/api/project/outgo/index.ts"
  //getContractDetailTwo 获取 合同
  import { getContractDetailTwo } from "@/api/project/contract/index.ts"

  //【实例】全局状态
  const globalStore = useGlobalStore()
  //【变量】是否是移动端
  const isMobile = ref(globalStore.isMobile)
  //【变量】是否显示抽屉【true显示 / false隐藏】
  const showDrawer = ref<Boolean>(false)
  //【变量】抽屉宽度
  const drawerWidth = computed(() => {
    return isMobile.value ? "100%" : "40%"
  })
  //【变量】抽屉类型【0添加，1修改，2查看】
  const drawerType = ref<number>(0)
  //【变量】抽屉标题
  const drawerTitle = reactive<string[]>(["添加开票历史", "修改开票历史", "查看开票历史"])

  //【变量】抽屉状态【加载中】
  const drawerLoading = ref<Boolean>(false)

  //【变量】表格布局
  const columns = [
    { label: "名称", prop: "name", minWidth: 200 },
    { label: "大小", prop: "size", width: 100 },
    { label: "操作", prop: "button", width: 100, align: "center", fixed: "right" }
  ]
  //合同详细
  const contract = ref()

  //【实例】表单
  const formRef = ref<FormInstance>()

  //【变量】表单数据
  let formModel = reactive<outgoFormInter>({
    "projectId": sessionStorage.projectId,
    "dutyRate": 0,
    "taxAmount": 0,
    "outputDateTime": "",
    "attachments": [],
    "note": ""
  })
  //开票详细
  const outputBase = ref()

  //税额
  const taxAmount = computed(() => {
    return (formModel.taxAmount * (formModel.dutyRate / 100)) / (1 + formModel.dutyRate / 100)
  })

  //【变量】表单限制
  const formRules = reactive<FormRules<outgoFormInter>>({
    outputDateTime: [
      {
        required: true,
        message: "请选择开票日期",
        trigger: "blur"
      }
    ]
  })
  // 向父组件传递事件，定义事件
  const emit = defineEmits(["update"])
  //添加
  const AddBtn = async () => {
    await formRef.value?.validate(valid => {
      if (valid) {
        drawerLoading.value = true
        addOutputBase(formModel)
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
  // 编辑更改
  const EditBtn = async () => {
    await formRef.value?.validate(valid => {
      if (valid) {
        drawerLoading.value = true
        outputBase.value.taxAmount = formModel.taxAmount
        outputBase.value.dutyRate = formModel.dutyRate
        outputBase.value.outputDateTime = formModel.outputDateTime
        outputBase.value.attachments = formModel.attachments
        outputBase.value.note = formModel.note

        updateOutputBase(formModel)
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
  const uploadUrl = `${import.meta.env.VITE_API_URL}/project/output/outputBase/upload`
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
      } else {
        ElMessage.error(response.msg)
      }
    }
    uploadLoading.value = false
  }
  //【方法】上传失败
  function errorUpload() {
    uploadLoading.value = false
    ElMessage.error("上传失败")
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
  //【方法】打开对话框
  function drawerOpen() {
    if (drawerType.value) {
      getOutputBaseDetail(outputBase.value.id).then((res: any) => {
        console.log(res.data.data)
        formModel = Object.assign(formModel, res.data.data)
        console.log(formModel)
      })
    }
  }
  //【方法】关闭对话框
  function drawerClose() {
    // 清空文件列表
    formModel.attachments = []
    outputBase.value = {}
    // 清空表单
    formRef.value?.resetFields()
  }

  onMounted(() => {
    getContractDetailTwo(sessionStorage.projectId).then((res: any) => {
      contract.value = res.data.data
    })
  })

  // 暴露给父组件
  defineExpose({ showDrawer, drawerType, outputBase })
</script>

<style lang="scss" scoped></style>

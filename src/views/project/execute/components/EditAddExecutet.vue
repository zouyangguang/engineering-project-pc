<template>
  <el-drawer
    v-model="showDrawer"
    :title="drawerTitle[drawerType]"
    :size="drawerWidth"
    :close-on-click-modal="drawerType == 2"
    destroy-on-close
    @open="drawerOpen"
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
          <el-form-item label="班组类型" prop="teamTypeId" required>
            <el-select v-model="formModel.teamTypeId" placeholder="班组类型" clearable>
              <el-option v-for="item in teamTypeSelect" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>

          <el-form-item label="团队名称" prop="teamName">
            <el-input v-model="formModel.teamName" placeholder="团队名称" maxlength="250" clearable />
          </el-form-item>

          <el-form-item label="工作内容" prop="workContent">
            <el-input v-model="formModel.workContent" placeholder="工作内容" maxlength="250" clearable />
          </el-form-item>

          <el-form-item class="form-input-number" label="成本" prop="cost" required>
            <div class="prefix">￥</div>
            <el-input-number
              v-model="formModel.cost"
              placeholder="成本"
              :min="0"
              :max="999999999999"
              :precision="2"
              :value-on-clear="0"
              :controls="false"
              clearable />
          </el-form-item>
          <el-form-item label="支出时间" prop="costPayDateTime">
            <el-date-picker
              v-model="formModel.costPayDateTime"
              value-format="YYYY-MM-DD 23:59:59"
              type="date"
              placeholder="选择日期"
              clearable />
          </el-form-item>

          <el-form-item label="回执单" prop="receipt">
            <el-input v-model="formModel.receipt" placeholder="回执单" maxlength="250" clearable />
          </el-form-item>

          <el-form-item label="对接人" prop="contactPerson">
            <el-input v-model="formModel.contactPerson" placeholder="对接人" maxlength="250" clearable />
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
      <el-button v-if="drawerType == 0" type="primary" @click="AddBtn"> 确认添加 </el-button>
      <el-button v-if="drawerType == 1" type="warning" @click="EditBtn"> 确认修改 </el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from "vue"
  import { ElMessage, ElMessageBox } from "element-plus"
  import type { FormInstance, FormRules, UploadFile } from "element-plus"
  import useGlobalStore from "@/stores/modules/global.ts"
  import type { formInter, AttachmentInter } from "@/api/project/execute/types.ts"
  import { download, addExecute, getOne, updateExecute } from "@/api/project/execute/index.ts"
  //下载文件   handleFilesize 文件大小转换
  import { downloadB, handleFilesize } from "@/utils/handle.ts"
  import useProjectStore from "@/stores/modules/project.ts"

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
  const drawerTitle = reactive<string[]>(["添加实施过程", "修改实施过程", "查看实施过程"])
  //【变量】招投标ID
  const id = ref<number>()
  //【变量】抽屉状态【加载中】
  const drawerLoading = ref<Boolean>(false)

  // 向父组件传递事件，定义事件
  const emit = defineEmits(["update"])

  //查看程实施信息详细
  const GetOne = () => {
    drawerLoading.value = true
    getOne(id.value?.toString() as string)
      .then((res: any) => {
        formModel.value = res.data.data
      })
      .finally(() => {
        drawerLoading.value = false
      })
  }

  //【方法】打开对话框
  function drawerOpen() {
    if (drawerType.value) {
      GetOne()
    }
  }
  //【方法】关闭对话框
  function drawerClose() {
    // 清空表单
    formRef.value?.resetFields()
    // 清空文件列表
    formModel.value.attachments = []
  }

  // 暴露给父组件
  defineExpose({ id, showDrawer, drawerType })

  //【变量】表格布局
  const columns = [
    { label: "名称", prop: "name", minWidth: 200 },
    { label: "大小", prop: "size", width: 100 },
    { label: "操作", prop: "button", width: 100, align: "center", fixed: "right" }
  ]

  //【实例】表单
  const formRef = ref<FormInstance>()
  //【变量】表单数据
  let formModel = ref<formInter>({
    "projectId": sessionStorage.projectId,
    "teamTypeId": "",
    "teamName": "",
    "workContent": "",
    "cost": 0,
    "amount": 0,
    "costPayDateTime": "",
    "receipt": "",
    "contactPerson": "",
    "note": "",
    "attachments": []
  })
  //存放班组类型 列表
  const teamTypeSelect = useProjectStore().teamTypeList
  //【变量】表单限制
  const formRules = reactive<FormRules<formInter>>({
    teamTypeId: [{ required: true, message: "请选择班组类型", trigger: "blur" }],
    teamName: [{ required: true, message: "请填写团队名称", trigger: "blur" }],
    workContent: [{ required: true, message: "请填写工作内容", trigger: "blur" }],
    cost: [{ required: true, message: "请填写成本", trigger: "blur" }],
    costPayDateTime: [{ required: true, message: "请选择支出时间", trigger: "change" }],
    receipt: [{ required: true, message: "请填写回执单", trigger: "blur" }],
    contactPerson: [{ required: true, message: "请填写对接人", trigger: "blur" }]
  })

  //添加实施过程
  const AddBtn = async () => {
    await formRef.value?.validate(valid => {
      if (valid) {
        drawerLoading.value = true
        addExecute(formModel.value)
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
  // 修改
  const EditBtn = async () => {
    await formRef.value?.validate(valid => {
      if (valid) {
        drawerLoading.value = true
        updateExecute(formModel.value)
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
  const uploadUrl = `${import.meta.env.VITE_API_URL}/project/constructionReturned/upload`
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
          orderNumber: formModel.value.attachments.length,
          name: uploadFile.name,
          type: uploadFile.name.substr(uploadFile.name.lastIndexOf(".") + 1, uploadFile.name.length),
          url: response.data,
          note: "",
          size: uploadFile.size as number
        }
        formModel.value.attachments.unshift(data)
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
      formModel.value.attachments.splice(index, 1)
      ElMessage.success("删除成功")
    })
  }
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
  :deep(.el-input-group__append) {
    background-color: #fff;
  }
</style>

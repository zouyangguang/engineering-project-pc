<template>
  <el-drawer
    v-model="isShow"
    :size="drawerWidth"
    :title="title"
    :close-on-click-modal="FormType == 2"
    destroy-on-close
    @open="dialogOpen"
    @close="dialogClose">
    <div v-loading="drawerLoading" class="drawer-page">
      <el-form
        ref="backTotallTableDataRef"
        label-suffix="："
        :rules="formRules"
        :model="backTotallTableData"
        :disabled="FormType == 2"
        label-width="auto">
        <el-form-item class="form-input-number" required label="收款金额" prop="money">
          <div class="prefix">￥</div>
          <el-input-number
            v-model="backTotallTableData.money"
            placeholder="收款金额"
            :min="0"
            :max="999999999999"
            :precision="2"
            :value-on-clear="0"
            :controls="false" />
        </el-form-item>

        <el-form-item class="form-input-number" required label="收回税费" prop="taxFee">
          <div class="prefix">￥</div>
          <el-input-number
            v-model="backTotallTableData.taxFee"
            placeholder="收回税费"
            :min="0"
            :max="999999999999"
            :precision="2"
            :value-on-clear="0"
            :controls="false" />
        </el-form-item>

        <el-form-item class="form-input-number" required label="收回个税" prop="personalTaxFee">
          <div class="prefix">￥</div>
          <el-input-number
            v-model="backTotallTableData.personalTaxFee"
            placeholder="收回个税"
            :min="0"
            :max="999999999999"
            :precision="2"
            :value-on-clear="0"
            :controls="false" />
        </el-form-item>

        <el-form-item class="form-input-number" required label="收回管理费" prop="manageFee">
          <div class="prefix">￥</div>
          <el-input-number
            v-model="backTotallTableData.manageFee"
            placeholder="收回管理费"
            :min="0"
            :max="999999999999"
            :precision="2"
            :value-on-clear="0"
            :controls="false" />
        </el-form-item>

        <el-form-item label="收款时间" prop="proceedsDateTime">
          <el-date-picker
            v-model="backTotallTableData.proceedsDateTime"
            value-format="YYYY-MM-DD 23:59:59"
            type="date"
            placeholder="选择日期"
            clearable />
        </el-form-item>

        <el-form-item label="备注" prop="note">
          <el-input
            v-model="backTotallTableData.note"
            type="textarea"
            placeholder="备注内容"
            :autosize="{ minRows: 3, maxRows: 3 }"
            :maxlength="250"
            show-word-limit />
        </el-form-item>
      </el-form>

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
            <el-button v-if="FormType != 2" type="primary"><icon-upload />&nbsp;上传文件</el-button>
          </el-upload>
        </div>

        <!-- 文件列表 -->
        <el-table size="small" :data="backTotallTableData.attachments">
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
                <el-link v-if="FormType == 2" type="primary" :underline="false" @click="downloadFile(scope.row)"> 下载 </el-link>
                <el-link v-if="FormType != 2" type="danger" :underline="false" @click="removeFile(scope.$index)"> 删除 </el-link>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template v-if="FormType != 2" #footer>
      <div>
        <el-button @click="isShow = false">取消</el-button>
        <el-button v-if="FormType == 0" type="primary" @click="AddBtn">确认添加</el-button>
        <el-button v-if="FormType == 1" type="warning" @click="editBtn">确认修改</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts" name="EditAddCollect">
  import { ElMessage, ElMessageBox } from "element-plus"
  import { reactive, ref, defineExpose, computed } from "vue"
  import type { FormInstance, FormRules, UploadFile } from "element-plus"
  // proceedsFormInter:收款表单 AttachmentInter 文件
  import type { proceedsFormInter, AttachmentInter } from "@/api/project/outgo/types.ts"
  import useGlobalStore from "@/stores/modules/global.ts"
  import { downloadB, handleFilesize } from "@/utils/handle.ts"
  //downloadOutputProceeds  下载文件 addOutputProceeds 添加收款 getOneOutputProceeds 获取 走款详细 updateOutputProceeds 更改走款详细
  import {
    downloadOutputProceeds,
    addOutputProceeds,
    getOneOutputProceeds,
    updateOutputProceeds
  } from "@/api/project/outgo/index.ts"

  //【实例】全局状态
  const globalStore = useGlobalStore()
  //【变量】是否是移动端
  const isMobile = ref(globalStore.isMobile)

  //【变量】抽屉宽度
  const drawerWidth = computed(() => {
    return isMobile.value ? "100%" : "40%"
  })
  // 标题
  const title = computed(() => {
    return ["添加收款", "修改收款", "查看收款"][FormType.value]
  })
  /**控制对话框显示隐藏*/
  const isShow = ref<boolean>(false)
  /**表单类型【0添加，1修改，2查看】*/
  const FormType = ref<0 | 1 | 2>(0)
  const id = ref<number>()

  //收款  表单实例
  const backTotallTableDataRef = ref<FormInstance>()

  //存放收款 表数据
  const backTotallTableData = reactive<proceedsFormInter>({
    "outputId": 0,
    "money": 0,
    "taxFee": 0,
    "manageFee": 0,
    "personalTaxFee": 0,
    "proceedsDateTime": "",
    "note": "",
    "attachments": []
  })
  //存放收款款详细
  const outputProceeds = ref()
  //【变量】状态【加载中】
  const drawerLoading = ref<Boolean>(false)
  // 表单限制
  const formRules = reactive<FormRules<proceedsFormInter>>({
    proceedsDateTime: [
      {
        required: true,
        message: "请选择收款时间",
        trigger: "blur"
      }
    ]
  })

  //开票历史 ID 销项ID
  const outputId = ref()
  // 向父组件传递事件，定义事件
  const emit = defineEmits(["update"])
  //确认添加
  const AddBtn = async () => {
    await backTotallTableDataRef.value?.validate(valid => {
      if (valid) {
        //isShow.value = false
        backTotallTableData.outputId = outputId.value
        drawerLoading.value = true
        addOutputProceeds(backTotallTableData)
          .then(() => {
            emit("update")
            ElMessage.success("添加成功")
          })
          .finally(() => {
            drawerLoading.value = false
            isShow.value = false
          })
      } else {
        ElMessage.error("添加失败，请按照提示完成输入")
      }
    })
  }

  //修改按钮
  const editBtn = async () => {
    await backTotallTableDataRef.value?.validate(valid => {
      if (valid) {
        backTotallTableData.outputId = outputId.value
        mergeObjects(outputProceeds.value, backTotallTableData)
        drawerLoading.value = true
        updateOutputProceeds(outputProceeds.value)
          .then(() => {
            emit("update")
            ElMessage.success("修改成功")
          })
          .finally(() => {
            drawerLoading.value = false
            isShow.value = false
          })
      } else {
        ElMessage.error("修改失败，请按照提示完成输入")
      }
    })
  }
  //属性赋值
  function mergeObjects(obj1: any, obj2: any) {
    // 遍历第二个对象的所有属性
    for (const key in obj2) {
      if (obj1.hasOwnProperty(key)) {
        obj1[key] = obj2[key]
      }
    }
  }
  //	Dialog 打开的回调
  const dialogOpen = () => {
    if (FormType.value) {
      if (id.value) {
        drawerLoading.value = true
        getOneOutputProceeds(id.value.toString())
          .then((res: any) => {
            outputProceeds.value = res.data.data
            mergeObjects(backTotallTableData, res.data.data)
          })
          .finally(() => {
            drawerLoading.value = false
          })
      }
    }
  }
  //Dialog 关闭的回调
  const dialogClose = () => {
    backTotallTableData.attachments = []
    //清空表单
    backTotallTableDataRef.value?.resetFields()
  }
  //【变量】表格布局
  const columns = [
    { label: "名称", prop: "name", minWidth: 200 },
    { label: "大小", prop: "size", width: 100 },
    { label: "操作", prop: "button", width: 100, align: "center", fixed: "right" }
  ]
  //【变量】上传状态【加载中】
  const uploadLoading = ref<Boolean>(false)
  //【变量】上传路径
  const uploadUrl = `${import.meta.env.VITE_API_URL}/project/output/outputProceeds/upload`
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
          orderNumber: backTotallTableData.attachments.length,
          name: uploadFile.name,
          type: uploadFile.name.substr(uploadFile.name.lastIndexOf(".") + 1, uploadFile.name.length),
          url: response.data,
          note: "",
          size: uploadFile.size as number
        }
        backTotallTableData.attachments.unshift(data)
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
    downloadOutputProceeds(data.url, data.name).then((res: any) => {
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
      backTotallTableData.attachments.splice(index, 1)
      ElMessage.success("删除成功")
    })
  }

  defineExpose({
    FormType,
    isShow,
    id,
    outputId
  })
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

<template>
  <el-drawer
    v-model="isShow"
    :size="drawerWidth"
    :title="['添加回款账单', '修改回款账单', '查看回款账单'][FormType]"
    :close-on-click-modal="FormType == 2"
    destroy-on-close
    @open="dialogOpen"
    @close="dialogClose">
    <div v-loading="drawerLoading">
      <el-form
        ref="dialogFormRef"
        label-suffix="："
        :rules="formRules"
        :model="DialogForm"
        :disabled="FormType == 2"
        label-width="auto">
        <el-form-item label="回款单号" prop="receipt">
          <el-input v-model="DialogForm.receipt" maxlength="250" placeholder="回款单号" clearable />
        </el-form-item>
        <el-form-item class="form-input-number" required label="回款金额" prop="returnedMoney">
          <div class="prefix">￥</div>
          <el-input-number
            v-model="DialogForm.returnedMoney"
            placeholder="回款金额"
            :min="0"
            :max="999999999999"
            :precision="2"
            :value-on-clear="0"
            :controls="false" />
        </el-form-item>
        <el-form-item label="回款时间" prop="returnedDateTime">
          <el-date-picker
            v-model="DialogForm.returnedDateTime"
            value-format="YYYY-MM-DD 23:59:59"
            type="date"
            placeholder="选择日期"
            clearable />
        </el-form-item>
        <el-form-item label="备注" prop="note">
          <el-input
            v-model="DialogForm.note"
            :rows="4"
            resize="none"
            show-word-limit
            type="textarea"
            placeholder="备注内容"
            maxlength="250" />
        </el-form-item>
      </el-form>
      <div v-loading="uploadLoading" class="table-page">
        <!-- 上传文件 -->
        <div class="table-page-header">
          <div class="table-page-header-title">附件</div>

          <el-upload
            :action="uploadUrl"
            :headers="uploadHeader"
            :data="uploadData"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-success="successUpload"
            :on-error="errorUpload">
            <el-button v-if="FormType != 2" type="primary"><icon-upload />&nbsp;上传文件</el-button>
          </el-upload>
        </div>

        <!-- 文件列表 -->
        <el-table size="small" :data="DialogForm.attachments">
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
  import type { formInter, Attachment } from "@/api/project/collect/types.ts"
  import useGlobalStore from "@/stores/modules/global.ts"
  //addCollect 添加回款账单 getOne 查看详细账单 download 下载附件 updateCollect修改账单
  import { addCollect, getOne, download, updateCollect } from "@/api/project/collect/index.ts"
  //下载文件   handleFilesize 文件大小转换
  import { downloadB, handleFilesize } from "@/utils/handle.ts"

  //【实例】全局状态
  const globalStore = useGlobalStore()
  //【变量】是否是移动端
  const isMobile = ref(globalStore.isMobile)

  //【变量】抽屉宽度
  const drawerWidth = computed(() => {
    return isMobile.value ? "100%" : "40%"
  })
  /**控制对话框显示隐藏*/
  const isShow = ref<boolean>(false)
  /**表单类型【0添加，1修改，2查看】*/
  const FormType = ref<number>(0)
  const id = ref<number>()
  /**对话框 表单实例*/
  const dialogFormRef = ref<FormInstance>()
  /**对话框 表单数据*/
  const DialogForm = ref<formInter>({
    projectId: sessionStorage.projectId, //项目编号
    returnedDateTime: "", //回款日期
    returnedMoney: 0, //回款金额
    receipt: "", //回执单号
    note: "", //备注
    attachments: []
  })
  //【变量】状态【加载中】
  const drawerLoading = ref<Boolean>(false)
  // 表单限制
  const formRules = reactive<FormRules<formInter>>({
    receipt: [{ required: true, message: "请填写回执单号", trigger: "blur" }],
    returnedDateTime: [{ required: true, message: "请选择回款日期", trigger: "blur" }]
  })
  // 向父组件传递事件，定义事件
  const emit = defineEmits(["update"])

  //添加
  const AddBtn = async () => {
    await dialogFormRef.value?.validate(valid => {
      if (valid) {
        drawerLoading.value = true
        addCollect(DialogForm.value)
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
    await dialogFormRef.value?.validate(valid => {
      if (valid) {
        drawerLoading.value = true
        updateCollect(DialogForm.value)
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

  const GetOne = () => {
    drawerLoading.value = true
    getOne(id.value?.toString() as string)
      .then((res: any) => {
        DialogForm.value = res.data.data
      })
      .finally(() => {
        drawerLoading.value = false
      })
  }

  //	Dialog 打开的回调
  const dialogOpen = () => {
    if (FormType.value) {
      GetOne()
    }
  }
  //Dialog 关闭的回调
  const dialogClose = () => {
    //清空表单
    DialogForm.value.attachments = []
    dialogFormRef.value?.resetFields()
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
  const uploadUrl = `${import.meta.env.VITE_API_URL}/project/constructionReturned/upload`
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
      if (uploadFile.raw) {
        const data: Attachment = {
          orderNumber: DialogForm.value.attachments.length,
          name: uploadFile.name,
          type: uploadFile.name.substr(uploadFile.name.lastIndexOf(".") + 1, uploadFile.name.length),
          url: response.data,
          note: "",
          size: uploadFile.size as number
        }
        DialogForm.value.attachments.unshift(data)
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
      DialogForm.value.attachments.splice(index, 1)
      ElMessage.success("删除成功")
    })
  }

  defineExpose({
    FormType,
    isShow,
    id
  })
</script>

<style lang="scss" scoped></style>

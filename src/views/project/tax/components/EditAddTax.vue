<template>
  <el-drawer
    v-model="isShow"
    :size="drawerWidth"
    :title="['添加税款', '修改税款', '查看税款'][FormType]"
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
        <el-form-item label="是否预缴" prop="prepay" required>
          <el-select v-model="DialogForm.prepay" placeholder="是否预缴">
            <el-option label="否" :value="0" />
            <el-option label="是" :value="1" />
          </el-select>
        </el-form-item>

        <el-form-item label="缴税类型" prop="typeId">
          <el-select v-model="DialogForm.typeId" placeholder="缴税类型" clearable>
            <el-option v-for="item in typeSelect" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item class="form-input-number" required label="缴税金额" prop="tax">
          <div class="prefix">￥</div>
          <el-input-number
            v-model="DialogForm.tax"
            placeholder="缴税金额"
            :min="0"
            :max="999999999999"
            :precision="2"
            :value-on-clear="0"
            :controls="false" />
        </el-form-item>

        <el-form-item label="缴税时间" prop="taxDateTime">
          <el-date-picker
            v-model="DialogForm.taxDateTime"
            value-format="YYYY-MM-DD 23:59:59"
            type="date"
            placeholder="选择日期"
            clearable />
        </el-form-item>

        <el-form-item label="经办人" prop="runnerEmployeeId">
          <el-select
            v-model="DialogForm.runnerEmployeeId"
            remote
            :remote-method="remoteMethod"
            :loading="runnerEmployeeIdLoading"
            filterable
            placeholder="经办人"
            clearable>
            <el-option v-for="item in runnerEmployeeIdList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="note">
          <el-input
            v-model="DialogForm.note"
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
  import type { taxFormInter, Attachment } from "@/api/project/tax/types.ts"
  import useGlobalStore from "@/stores/modules/global.ts"
  import { downloadB, handleFilesize } from "@/utils/handle.ts"
  import { addTax, download, getOne, updateTax } from "@/api/project/tax/index.ts"
  // getStaffList 搜索 成员
  import { getStaffList } from "@/api/system/staff/index.ts"
  import useProjectStore from "@/stores/modules/project.ts"

  //【实例】全局状态
  const globalStore = useGlobalStore()
  //【变量】是否是移动端
  const isMobile = ref(globalStore.isMobile)

  //【变量】抽屉宽度
  const drawerWidth = computed(() => {
    return isMobile.value ? "100%" : "600"
  })
  /**控制对话框显示隐藏*/
  const isShow = ref<boolean>(false)
  /**表单类型【0添加，1修改，2查看】*/
  const FormType = ref<number>(0)
  const id = ref<number>()
  /**对话框 表单实例*/
  const dialogFormRef = ref<FormInstance>()
  /**对话框 表单数据*/
  const DialogForm = reactive<taxFormInter>({
    "projectId": sessionStorage.projectId,
    "runnerEmployeeId": "",
    "tax": 0,
    "typeId": "",
    "taxDateTime": "",
    "prepay": 1,
    "note": "",
    "attachments": []
  })
  //存放详细
  const taxOne = ref()
  //存放纳税类型列表
  const typeSelect = useProjectStore().taxTypeList
  //存放经办人列表
  const runnerEmployeeIdList = ref()
  const runnerEmployeeIdLoading = ref(false)
  //【变量】状态【加载中】
  const drawerLoading = ref<Boolean>(false)
  // 表单限制
  const formRules = reactive<FormRules<taxFormInter>>({
    typeId: [{ required: true, message: "请选择缴税类型", trigger: "blur" }],
    taxDateTime: [{ required: true, message: "请选择缴税时间", trigger: "blur" }],
    runnerEmployeeId: [{ required: true, message: "请选择经办人", trigger: "blur" }]
  })
  //搜索员工
  const remoteMethod = (query: string) => {
    runnerEmployeeIdLoading.value = true
    getStaffList({ name: query }, { current: 1, pagesize: 100 })
      .then((res: any) => {
        runnerEmployeeIdList.value = res.data.data.records
      })
      .finally(() => {
        runnerEmployeeIdLoading.value = false
      })
  }
  // 向父组件传递事件，定义事件
  const emit = defineEmits(["update"])
  const AddBtn = async () => {
    await dialogFormRef.value?.validate(valid => {
      if (valid) {
        drawerLoading.value = true
        addTax(DialogForm)
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
        mergeObjects(taxOne.value, DialogForm)
        updateTax(taxOne.value)
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
      drawerLoading.value = true
      getOne(id.value?.toString() as string)
        .then((res: any) => {
          taxOne.value = res.data.data
          mergeObjects(DialogForm, res.data.data)
        })
        .finally(() => {
          drawerLoading.value = false
        })
    }
  }
  //Dialog 关闭的回调
  const dialogClose = () => {
    DialogForm.attachments = []
    //清空表单
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
  const uploadUrl = `${import.meta.env.VITE_API_URL}/project/tax/upload`
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
        const data: Attachment = {
          orderNumber: DialogForm.attachments.length,
          name: uploadFile.name,
          type: uploadFile.name.substr(uploadFile.name.lastIndexOf(".") + 1, uploadFile.name.length),
          url: response.data,
          note: "",
          size: uploadFile.size as number
        }
        DialogForm.attachments.unshift(data)
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
      DialogForm.attachments.splice(index, 1)
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

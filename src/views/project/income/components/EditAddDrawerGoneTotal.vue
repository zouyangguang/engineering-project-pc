<template>
  <el-drawer
    v-model="isShow"
    :size="drawerWidth"
    :title="title"
    :close-on-click-modal="FormType == 2"
    destroy-on-close
    @open="dialogOpen"
    @close="dialogClose">
    <div v-loading="drawerLoading">
      <el-form
        ref="goneTotalTableDataRef"
        label-suffix="："
        :rules="formRules"
        :model="goneTotalTableData"
        :disabled="FormType == 2"
        label-width="auto">
        <el-form-item class="form-input-number" required label="走款金额" prop="money">
          <div class="prefix">￥</div>

          <el-input-number
            v-model="goneTotalTableData.money"
            placeholder="走款金额"
            :min="0"
            :max="999999999999"
            :precision="2"
            :value-on-clear="0"
            :controls="false" />
        </el-form-item>

        <el-form-item label="走款时间" prop="goneDateTime">
          <el-date-picker
            v-model="goneTotalTableData.goneDateTime"
            value-format="YYYY-MM-DD 23:59:59"
            type="date"
            placeholder="选择日期"
            clearable />
        </el-form-item>

        <el-form-item label="走款人" prop="employeeId">
          <el-select
            v-model="goneTotalTableData.employeeId"
            remote
            :remote-method="remoteMethod"
            :loading="employeeIdLoading"
            filterable
            placeholder="走款人"
            clearable>
            <el-option v-for="item in employeeIdList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="备注" prop="note">
          <el-input
            v-model="goneTotalTableData.note"
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
        <el-table size="small" :data="goneTotalTableData.attachments">
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
  // goneTotalInter:走款表单
  import type { goneTotalFormInter, employeeIdListInter, AttachmentInter } from "@/api/project/income/types.ts"
  import useGlobalStore from "@/stores/modules/global.ts"
  // getStaffList 搜索 成员
  import { getStaffList } from "@/api/system/staff/index.ts"
  //下载文件   handleFilesize 文件大小转换
  import { downloadB, handleFilesize } from "@/utils/handle.ts"
  //downloadGone 下载附件 addGone 添加走款 getOneGone 查看走款详细 updateIncomeGone修改走款详细
  import { downloadGone, addGone, getOneGone, updateIncomeGone } from "@/api/project/income/index.ts"

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
    return ["添加走款", "修改走款", "查看走款"][FormType.value]
  })
  /**控制对话框显示隐藏*/
  const isShow = ref<boolean>(false)
  /**表单类型【0添加，1修改，2查看】*/
  const FormType = ref<0 | 1 | 2>(0)
  const id = ref<string>()
  const incomeId = ref<number>()
  //走款  表单实例
  const goneTotalTableDataRef = ref<FormInstance>()

  //存放走款 表数据
  const goneTotalTableData = reactive<goneTotalFormInter>({
    "incomeId": "",
    "employeeId": "",
    "goneDateTime": "",
    "money": 0,
    "note": "",
    "attachments": []
  })
  //存放走款 详细数据
  const oneBase = ref()
  //【变量】状态【加载中】
  const drawerLoading = ref<Boolean>(false)
  // 表单限制
  const formRules = reactive<FormRules<goneTotalFormInter>>({
    goneDateTime: [{ required: true, message: "请选择走款时间", trigger: "blur" }],
    employeeId: [{ required: true, message: "请填写走款人", trigger: "blur" }]
  })

  //存放 员工 列表信息 用于 选择走款人
  const employeeIdList = ref<employeeIdListInter[]>([])
  //设置 走款人加载
  const employeeIdLoading = ref<boolean>(false)
  //搜索员工
  const remoteMethod = (query: string) => {
    employeeIdLoading.value = true
    getStaffList({ name: query }, { current: 1, pagesize: 100 })
      .then((res: any) => {
        employeeIdList.value = res.data.data.records
      })
      .finally(() => {
        employeeIdLoading.value = false
      })
  }
  // 向父组件传递事件，定义事件
  const emit = defineEmits(["update"])
  //确认添加
  const AddBtn = async () => {
    await goneTotalTableDataRef.value?.validate(valid => {
      if (valid) {
        if (incomeId.value) {
          drawerLoading.value = true
          goneTotalTableData.incomeId = incomeId.value
          addGone(goneTotalTableData)
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
      }
    })
  }

  //修改按钮
  const editBtn = async () => {
    await goneTotalTableDataRef.value?.validate(valid => {
      if (valid) {
        if (incomeId.value) {
          goneTotalTableData.incomeId = incomeId.value
          oneBase.value.incomeId = goneTotalTableData.incomeId
          oneBase.value.employeeId = goneTotalTableData.employeeId
          oneBase.value.goneDateTime = goneTotalTableData.goneDateTime
          oneBase.value.money = goneTotalTableData.money
          oneBase.value.note = goneTotalTableData.note
          oneBase.value.attachments = goneTotalTableData.attachments
          updateIncomeGone(oneBase.value)
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
      }
    })
  }

  //	Dialog 打开的回调
  const dialogOpen = () => {
    if (FormType.value) {
      drawerLoading.value = true
      getOneGone(id.value)
        .then((res: any) => {
          oneBase.value = res.data.data
          employeeIdList.value = []
          employeeIdList.value.push({ id: res.data.data.employeeId, name: res.data.data.employeeName })
          goneTotalTableData.incomeId = res.data.data.incomeId
          goneTotalTableData.employeeId = res.data.data.employeeId
          goneTotalTableData.goneDateTime = res.data.data.goneDateTime
          goneTotalTableData.money = res.data.data.money
          goneTotalTableData.note = res.data.data.note
          goneTotalTableData.attachments = res.data.data.attachments
        })
        .finally(() => {
          drawerLoading.value = false
        })
    }
  }
  //Dialog 关闭的回调
  const dialogClose = () => {
    goneTotalTableData.attachments = []
    //清空表单
    goneTotalTableDataRef.value?.resetFields()
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
  const uploadUrl = `${import.meta.env.VITE_API_URL}/project/income/incomeBack/upload`
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
          orderNumber: goneTotalTableData.attachments.length,
          name: uploadFile.name,
          type: uploadFile.name.substr(uploadFile.name.lastIndexOf(".") + 1, uploadFile.name.length),
          url: response.data,
          note: "",
          size: uploadFile.size as number
        }
        goneTotalTableData.attachments.unshift(data)
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
    downloadGone(data.url, data.name).then((res: any) => {
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
      goneTotalTableData.attachments.splice(index, 1)
      ElMessage.success("删除成功")
    })
  }

  defineExpose({
    FormType,
    isShow,
    id,
    incomeId
  })
</script>

<style lang="scss" scoped></style>

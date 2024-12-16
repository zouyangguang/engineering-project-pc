<template>
  <div>
    <el-row v-show="!isFirstUpdate || isUpdate">
      <!-- 表单 -->
      <el-col :lg="18" :xl="20">
        <div v-loading="viewLoading" class="form-page card-bg">
          <!-- header -->
          <div class="page-header">
            <div class="page-header-title">招投标表单</div>
            <el-tooltip v-if="btnList.isUpdate && projectInfo.status < 2" content="编辑" placement="left">
              <icon-edit v-show="!isUpdate" class="page-header-icon" size="18" @click="isUpdate = true" />
            </el-tooltip>
          </div>

          <!-- content -->
          <el-form ref="formRef" label-width="auto" label-suffix="：" :model="formModel" :rules="formRules" :disabled="!isUpdate">
            <el-row :gutter="10">
              <el-col :lg="12">
                <el-form-item label="投标状态" prop="status" required>
                  <el-select v-model="formModel.status" placeholder="投标状态">
                    <el-option v-for="(item, i) in statusList" :key="i" :label="item" :value="i" />
                  </el-select>
                </el-form-item>

                <template v-if="formModel.status != 4">
                  <el-form-item label="招标模式" prop="patternId">
                    <el-select v-model="formModel.patternId" placeholder="招标模式" clearable>
                      <el-option v-for="(item, i) in patternSelect" :key="i" :label="item.name" :value="item.id" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="承包方式" prop="contractApproachId">
                    <el-select v-model="formModel.contractApproachId" placeholder="承包方式" clearable>
                      <el-option v-for="(item, i) in contractSelect" :key="i" :label="item.name" :value="item.id" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="投标日期" prop="bidDateTime">
                    <el-date-picker
                      v-model="formModel.bidDateTime"
                      placeholder="选择日期"
                      value-format="YYYY-MM-DD 00:00:00"
                      clearable />
                  </el-form-item>

                  <el-form-item label="招标日期" prop="tenderDateTime">
                    <el-date-picker
                      v-model="formModel.tenderDateTime"
                      placeholder="选择日期"
                      value-format="YYYY-MM-DD 00:00:00"
                      clearable />
                  </el-form-item>

                  <el-form-item label="项目细则" prop="customBidType">
                    <el-input v-model="formModel.customBidType" placeholder="项目细则" clearable />
                  </el-form-item>

                  <el-form-item label="公司 / 私人" prop="companyPersonalName">
                    <el-input v-model="formModel.companyPersonalName" placeholder="公司 / 私人" clearable />
                  </el-form-item>

                  <el-form-item label="施工单位" prop="constructionUnits">
                    <el-input v-model="formModel.constructionUnits" placeholder="施工单位" clearable />
                  </el-form-item>

                  <el-form-item label="项目地址" prop="projectAddress">
                    <el-input v-model="formModel.projectAddress" placeholder="项目地址" clearable />
                  </el-form-item>
                </template>
              </el-col>

              <el-col v-if="formModel.status != 4" :lg="12">
                <el-form-item class="form-input-number" label="投标金额" prop="bidMoney" required>
                  <div class="prefix">￥</div>
                  <el-input-number
                    v-model="formModel.bidMoney"
                    placeholder="投标金额"
                    :min="0"
                    :max="999999999999"
                    :precision="2"
                    :value-on-clear="0"
                    :controls="false" />
                </el-form-item>

                <el-form-item class="form-input-number" label="建筑 / 套内面积" prop="area" required>
                  <el-input-number
                    v-model="formModel.area"
                    type="number"
                    placeholder="建筑 / 套内面积"
                    :min="0"
                    :max="99999999"
                    :precision="2"
                    :value-on-clear="0"
                    :controls="false" />
                  <div class="suffix">m²</div>
                </el-form-item>

                <el-form-item label="备注" prop="note">
                  <el-input
                    v-model="formModel.note"
                    type="textarea"
                    placeholder="备注内容"
                    :autosize="{ minRows: 6, maxRows: 6 }"
                    :maxlength="250"
                    show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <!-- footer -->
          <div v-show="isUpdate" class="form-footer">
            <el-button @click="cancelForm()">取消</el-button>
            <el-button v-show="isFirstUpdate" type="primary" @click="addBid()">确认添加</el-button>
            <el-button v-show="!isFirstUpdate" type="warning" @click="updateBid()">确认修改</el-button>
          </div>
        </div>
      </el-col>

      <!-- 附件 -->
      <el-col :lg="6" :xl="4">
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
      </el-col>
    </el-row>

    <div v-show="isFirstUpdate && !isUpdate" class="no-data card-bg">
      <icon-gavel class="text" size="60" stroke-width="2" />
      <span class="text">暂无数据</span>

      <div class="btn-group">
        <el-button v-if="btnList.isAdd && projectInfo.status < 2" type="primary" plain @click="skipBid">
          <icon-redo /> 跳过
        </el-button>

        <el-button v-if="btnList.isAdd && projectInfo.status < 2" type="primary" @click="isUpdate = true">
          <icon-plus size="18" />添加招投标
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="ProjectBid">
  import { ref, onMounted } from "vue"
  import { ElMessage, ElMessageBox } from "element-plus"
  import type { FormInstance, FormRules, UploadFile } from "element-plus"
  import type { BidFormInter } from "@/api/project/bid/types.ts"
  import { handleFilesize, downloadB } from "@/utils/handle.ts"
  import * as BidAPI from "@/api/project/bid/index.ts"
  import useAuthStore from "@/stores/modules/auth.ts"
  import useProjectStore from "@/stores/modules/project.ts"

  //【变量】是否编辑表单
  const isUpdate = ref<Boolean>(false)
  //【变量】是否首次修改
  const isFirstUpdate = ref<Boolean>(false)
  //【变量】页面状态 - 加载中
  const viewLoading = ref<Boolean>(false)
  //【变量】保存按钮 - 加载中
  const subLoading = ref<Boolean>(false)
  //【变量】按钮权限列表
  const btnList = useAuthStore().btnList

  //【变量】项目信息
  const projectInfo = useProjectStore().info
  //【变量】投标状态
  const statusList = ["投标中", "已中标", "未中标", "已撤标", "无需投标"]
  //【变量】招标模式
  const patternSelect = useProjectStore().bidPatternList
  //【变量】承包方式
  const contractSelect = useProjectStore().bidContractList

  //【实例】表单
  const formRef = ref<FormInstance>()
  //【变量】表单数据
  let formModel = ref<BidFormInter>({
    status: 0,
    patternId: null,
    contractApproachId: null,
    bidDateTime: "",
    tenderDateTime: "",
    customBidType: "",
    companyPersonalName: "",
    constructionUnits: "",
    projectAddress: "",
    bidMoney: 0,
    area: 0,
    note: "",
    attachments: [],
    version: 1
  })
  //【变量】表单限制
  const formRules = ref<FormRules<BidFormInter>>({
    patternId: [{ required: true, message: "请选择招标模式", trigger: "change" }],
    contractApproachId: [{ required: true, message: "请选择承包方式", trigger: "change" }],
    bidDateTime: [{ required: true, message: "请选择投标日期", trigger: "change" }],
    tenderDateTime: [{ required: true, message: "请选择招标日期", trigger: "change" }],
    customBidType: [{ required: true, message: "请填写项目细则", trigger: "blur" }],
    companyPersonalName: [{ required: true, message: "请填写公司 / 私人名称", trigger: "blur" }],
    constructionUnits: [{ required: true, message: "请填写施工单位", trigger: "blur" }],
    projectAddress: [{ required: true, message: "请填写项目地址", trigger: "blur" }]
  })
  //【方法】获取招投标详情
  const getData = () => {
    viewLoading.value = true

    BidAPI.getBidDetailTwo(sessionStorage.projectId)
      .then((res: any) => {
        // 如果res.data.data为空，则表示该项目没有招投标记录，需要添加
        isFirstUpdate.value = true

        if (res.data.data) {
          isFirstUpdate.value = false
          formModel.value = res.data.data
        }
      })
      .finally(() => {
        viewLoading.value = false
      })
  }
  //【方法】添加招投标
  const addBid = async () => {
    await formRef.value?.validate(valid => {
      if (valid) {
        subLoading.value = true
        formModel.value.projectId = sessionStorage.projectId

        BidAPI.addBid(formModel.value)
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
  //【方法】修改招投标
  const updateBid = async () => {
    await formRef.value?.validate(valid => {
      if (valid) {
        subLoading.value = true
        formModel.value.projectId = sessionStorage.projectId

        BidAPI.updateBid(formModel.value)
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
  //【方法】跳过招投标
  const skipBid = () => {
    ElMessageBox.confirm("此操作将跳过招投标操作，是否继续？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(() => {
      formModel.value.projectId = sessionStorage.projectId
      formModel.value.status = 4

      BidAPI.addBid(formModel.value)
        .then(() => {
          ElMessage.success("已跳过招投标")

          getData()
        })
        .finally(() => {
          subLoading.value = false
        })
    })
  }
  //【方法】取消
  const cancelForm = () => {
    isUpdate.value = false
    formRef.value.resetFields()
    getData()
  }

  //【变量】上传状态【加载中】
  const uploadLoading = ref<Boolean>(false)
  //【变量】上传路径
  const uploadUrl = `${import.meta.env.VITE_API_URL}/project/bid/upload`
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
        BidAPI.updateBid(formModel.value)
          .then(() => {
            ElMessage.success("上传成功")
            isUpdate.value = false

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
    BidAPI.downloadBidFile(row.url, row.name)
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
        BidAPI.updateBid(formModel.value)
          .then(() => {
            ElMessage.success("删除成功")

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

  @media (min-width: 1200px) {
    .form-page,
    .file-page {
      margin: 0;
    }

    .form-page {
      margin-right: 10px;
      height: calc(100vh - 90px);
    }

    .file-page {
      margin-left: 10px;
      height: calc(100vh - 90px);
    }
  }
</style>

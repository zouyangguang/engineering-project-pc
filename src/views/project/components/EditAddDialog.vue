<template>
  <el-dialog
    v-model="isShow"
    :title="FormType == 0 ? '项目立项 ' : '修改项目信息'"
    :close-on-click-modal="false"
    align-center
    width="400px"
    destroy-on-close
    @open="dialogOpen"
    @close="dialogClose">
    <el-form
      ref="dialogFormRef"
      v-loading="FormLoading"
      label-suffix="："
      class="dialog-form dialog-page"
      :model="DialogForm"
      :rules="dialogFormRules"
      label-width="auto">
      <el-form-item label="项目归属" prop="isFieldProject" required>
        <el-radio-group v-model="DialogForm.isFieldProject">
          <el-radio label="本地" :value="0" />
          <el-radio label="异地" :value="1" />
        </el-radio-group>
      </el-form-item>

      <el-form-item label="项目类别" prop="typeId">
        <el-select v-model="DialogForm.typeId" placeholder="项目类别" clearable>
          <el-option v-for="item in typeSelect" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item v-if="DialogForm.typeId != 1" label="自营 / 挂靠" prop="typeId2" required>
        <el-radio-group v-model="DialogForm.typeId2">
          <el-radio label="自营" :value="0" />
          <el-radio label="挂靠" :value="1" />
        </el-radio-group>
      </el-form-item>

      <el-form-item label="项目名称" prop="name">
        <el-input v-model="DialogForm.name" placeholder="项目名称" maxlength="250" clearable />
      </el-form-item>

      <el-form-item label="项目负责人" prop="principalId">
        <el-select
          v-model="DialogForm.principalId"
          remote
          :remote-method="remoteMethod"
          :loading="principalIdLoading"
          filterable
          placeholder="项目负责人"
          clearable>
          <el-option v-for="item in principalIdList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="预期截止日期" prop="expectFinishDateTime">
        <el-date-picker
          v-model="DialogForm.expectFinishDateTime"
          value-format="YYYY-MM-DD 23:59:59"
          style="width: 100%"
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

    <template #footer>
      <div>
        <el-button @click="isShow = false">取消</el-button>
        <el-button v-if="FormType == 0" type="primary" @click="Addbtn()">确认添加</el-button>
        <el-button v-if="FormType == 1" type="warning" @click="editBtn">确认修改</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="EditAddDialog">
  import { ElMessage } from "element-plus"
  import { watch, reactive, ref } from "vue"
  import type { FormInstance, FormRules } from "element-plus"
  import type { DialogFormInter } from "@/api/project/default/types.ts"
  import { addProject, updateProjec, getOne } from "@/api/project/default/index.ts"
  // getStaffList 搜索 成员
  import { getStaffList } from "@/api/system/staff/index.ts"
  import useProjectStore from "@/stores/modules/project.ts"
  /**控制对话框显示隐藏*/
  const isShow = ref<boolean>(false)
  //双向绑定 defineModel("绑定名称", { 必填: true, 默认值: 0 , 类型：any })
  const FormType = ref<number>(0)
  const id = ref<string>()
  /**对话框 表单实例*/
  const dialogFormRef = ref<FormInstance>()
  /**对话框 表单数据*/
  const DialogForm = reactive<DialogFormInter>({
    name: "",
    typeId: null,
    typeId2: 0,
    principalId: "",
    expectFinishDateTime: "",
    isFieldProject: 0,
    members: [],
    note: ""
  })
  // 表单限制
  const dialogFormRules = reactive<FormRules<DialogFormInter>>({
    name: [{ required: true, message: "请填写项目名称", trigger: "blur" }],
    typeId: [{ required: true, message: "请选择项目类别", trigger: "blur" }],
    principalId: [{ required: true, message: "请填写负责人姓名", trigger: "blur" }],
    expectFinishDateTime: [{ required: true, message: "请选择预期截止日期", trigger: "blur" }]
  })
  //设置 表单 加载
  const FormLoading = ref<boolean>(false)
  //存放 员工 列表信息 用于 选择项目负责人
  const principalIdList = ref<any>([])
  //设置 项目负责人 加载
  const principalIdLoading = ref<boolean>(false)
  //搜索员工
  const remoteMethod = (query: string) => {
    principalIdLoading.value = true
    getStaffList({ name: query }, { current: 1, pagesize: 100 })
      .then((res: any) => {
        principalIdList.value = res.data.data.records
      })
      .finally(() => {
        principalIdLoading.value = false
      })
  }

  // 向父组件传递事件，定义事件
  const emit = defineEmits(["update"])
  //添加按钮
  const Addbtn = async () => {
    await dialogFormRef.value?.validate(valid => {
      if (valid) {
        FormLoading.value = true
        addProject(DialogForm)
          .then(() => {
            ElMessage({
              message: "添加成功",
              type: "success"
            })
          })
          .finally(() => {
            FormLoading.value = false
            isShow.value = false
            emit("update")
          })
      } else {
        ElMessage({
          message: "请完善输入框",
          type: "error"
        })
      }
    })
  }

  //项目详细
  const oneProject = ref()

  //修改按钮
  const editBtn = async () => {
    await dialogFormRef.value?.validate(valid => {
      if (valid) {
        FormLoading.value = true
        oneProject.value.name = DialogForm.name
        oneProject.value.typeId = DialogForm.typeId
        oneProject.value.nature = DialogForm.nature
        oneProject.value.principalId = DialogForm.principalId
        oneProject.value.expectFinishDateTime = DialogForm.expectFinishDateTime
        oneProject.value.note = DialogForm.note
        oneProject.value.isFieldProject = DialogForm.isFieldProject
        updateProjec(oneProject.value)
          .then(() => {
            ElMessage({
              message: "修改成功",
              type: "success"
            })
          })
          .finally(() => {
            FormLoading.value = false
            isShow.value = false
            emit("update")
          })
      } else {
        ElMessage({
          message: "请完善输入框",
          type: "error"
        })
      }
    })
  }
  // 项目类别
  const typeSelect = useProjectStore().projectTypeList
  //	Dialog 打开的回调
  const dialogOpen = () => {
    //判断对话框是修改模式
    if (FormType.value === 1) {
      //通过 id 获取 项目详细
      FormLoading.value = true
      getOne(id.value?.toString() as string)
        .then((res: any) => {
          DialogForm.name = res.data.data.name
          DialogForm.typeId = res.data.data.typeId
          DialogForm.typeId2 = res.data.data.nature == 0 ? 0 : 1
          DialogForm.nature = res.data.data.nature
          DialogForm.principalId = res.data.data.principalId
          DialogForm.isFieldProject = res.data.data.isFieldProject
          DialogForm.expectFinishDateTime = res.data.data.expectFinishDateTime
          DialogForm.note = res.data.data.note
          oneProject.value = res.data.data

          remoteMethod(res.data.data.principalName)

          principalIdList.value = []
          principalIdList.value.push({ id: res.data.data.proposerId, name: res.data.data.proposerName })
        })
        .finally(() => {
          FormLoading.value = false
        })
    }
  }

  //Dialog 关闭的回调
  const dialogClose = () => {
    //清空表单
    dialogFormRef.value?.resetFields()
  }

  //【监听】项目类别业务逻辑
  watch(
    () => [DialogForm.typeId, DialogForm.typeId2],
    () => {
      if (DialogForm.typeId == 1) {
        // 项目类别为【劳务】，类型仅能为挂靠
        DialogForm.nature = 1
      } else {
        if (DialogForm.typeId2 == 0) {
          // 项目类别不为【劳务】，类型为自营
          DialogForm.nature = 0
        } else {
          // 项目类别不为【劳务】，类型为挂靠
          DialogForm.nature = 2
        }
      }

      console.log(DialogForm)
    }
  )

  defineExpose({
    isShow,
    FormType,
    id
  })
</script>

<style lang="scss" scoped></style>

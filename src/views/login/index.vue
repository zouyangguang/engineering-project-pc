<template>
  <el-row class="container">
    <el-col class="container-left" :xs="0" :sm="0" :lg="16" :xl="18">
      <img class="illustration" src="@/assets/images/engineering-animate.svg" />

      <img class="wave" src="@/assets/images/wave.svg" />
    </el-col>

    <el-col class="container-right" :xs="24" :sm="24" :lg="8" :xl="6">
      <div class="card-bg">
        <div class="welcome">
          <h1>HI~</h1>
          <h3>欢迎回到，项目管理平台</h3>
        </div>

        <el-form ref="formRef" class="login-form" :model="formModel" :rules="formRules">
          <el-form-item prop="number">
            <el-input
              v-model="formModel.number"
              size="large"
              placeholder="手机号 / 工号"
              maxlength="13"
              clearable
              @keyup.enter="login()">
              <template #prefix>
                <icon-user />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="formModel.password"
              type="password"
              size="large"
              placeholder="密码"
              show-password
              clearable
              @keyup.enter="login()">
              <template #prefix>
                <icon-lock />
              </template>
            </el-input>
          </el-form-item>

          <el-button class="login-btn" type="primary" :loading="subLoading" @click="login">登录</el-button>
        </el-form>
      </div>
    </el-col>
  </el-row>
</template>

<script setup lang="ts" name="Login">
  import { ref, reactive } from "vue"
  import { useRouter } from "vue-router"
  import { ElMessage } from "element-plus"
  import type { FormInstance, FormRules } from "element-plus"
  import type { LoginInter } from "@/api/auth/types.ts"
  import * as AuthAPI from "@/api/auth/index.ts"

  //【实例】路由
  const router = useRouter()
  //【实例】表单
  const formRef = ref<FormInstance>()
  //【变量】提交按钮【加载中】
  const subLoading = ref<Boolean>(false)

  //【变量】表单数据
  const formModel = reactive<LoginInter>({
    number: "",
    password: ""
  })
  //【变量】表单限制
  const formRules = reactive<FormRules<LoginInter>>({
    number: [{ required: true, message: "请填写手机号 / 工号", trigger: "blur" }],
    password: [{ required: true, message: "请填写密码", trigger: "blur" }]
  })
  //【方法】登录
  async function login() {
    await formRef.value?.validate(valid => {
      if (valid) {
        subLoading.value = true

        AuthAPI.login(formModel)
          .then((res: any) => {
            localStorage.engineeringToken = res.data.data.token
            router.push("/")
          })
          .finally(() => {
            subLoading.value = false
          })
      } else {
        ElMessage.error("请填写手机号/工号 和 密码")
      }
    })
  }
</script>

<style lang="scss" scoped>
  .container {
    .container-left {
      position: relative;
      height: 100vh;
      background-color: var(--el-color-primary);

      .illustration {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 50%;
        z-index: 99;
      }

      .wave {
        position: absolute;
        right: -1px;
        height: 100vh;
        transform: rotate(180deg);
      }
    }

    .container-right {
      position: relative;
      height: 100vh;
      background-color: #f6f8fa;

      .card-bg {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 400px;
        transform: translate(-50%, -50%);
        transition: 0.3s;

        @media (max-width: 576px) {
          width: 300px;
        }
      }

      .welcome {
        margin-bottom: 38px;
      }

      .login-form .login-btn {
        margin-top: 20px;
        width: 100%;
      }
    }
  }
</style>

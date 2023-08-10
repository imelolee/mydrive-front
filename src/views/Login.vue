<template>
  <div class="login-body">
    <div class="login-panel">
      <el-form class="login-register" :model="formData" :rules="rules" ref="formDataRef">
        <div class="login-title">MyDriveログイン</div>
        <!--email-->
        <el-form-item prop="email">
          <el-input size="large" clearable placeholder="メールアドレス" v-model.trim="formData.email" maxLength="150">
            <template #prefix>
              <span class="iconfont icon-account"></span>
            </template>
          </el-input>
        </el-form-item>
        <!-- password login -->
        <el-form-item prop="password" v-if="opType == 1">
          <el-input size="large" type="password" clearable placeholder="パスワード" v-model.trim="formData.password"
            show-password>
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>
        <!-- register -->
        <div v-if="opType == 0 || opType == 2">
          <!-- nickname -->
          <el-form-item prop="nickName" v-if="opType == 0">
            <el-input size="large" clearable placeholder="ニックネーム" v-model.trim="formData.nickName" maxLength="20">
              <template #prefix>
                <span class="iconfont icon-account"></span>
              </template>
            </el-input>
          </el-form-item>
          <!-- set password -->
          <el-form-item prop="registerPassword">
            <el-input type="password" size="large" clearable placeholder="パスワード" v-model.trim="formData.registerPassword"
              maxLength="20" show-password>
              <template #prefix>
                <span class="iconfont icon-password"></span>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="reRegisterPassword">
            <el-input type="password" size="large" clearable placeholder="パスワードをもう一度確認"
              v-model.trim="formData.reRegisterPassword" maxLength="20" show-password>
              <template #prefix>
                <span class="iconfont icon-password"></span>
              </template>
            </el-input>
          </el-form-item>
        </div>
        <!-- validation code -->
        <el-form-item prop="checkCode">
          <div class="check-code-panel">
            <el-input size="large" placeholder="認証コード" v-model.trim="formData.checkCode">
              <template #prefix>
                <span class="iconfont icon-checkcode"></span>
              </template>
            </el-input>
            <img :src="checkCodeUrl" class="check-code" @click="changeCheckCode(0)" />

          </div>
        </el-form-item>
        <el-form-item v-if="opType == 1">
          <div class="rememberme-panel">
            <el-checkbox v-model="formData.rememberMe">
              次回から自動ログインする
            </el-checkbox>
          </div>
          <div class="no-account">
            <a href="javascript:void(0)" class="a-link" @click="showPanel(2)">パスワードが分からない</a>
            <a href="javascript:void(0)" class="a-link" @click="showPanel(0)">新規会員登録へ</a>
          </div>
        </el-form-item>
        <el-form-item v-if="opType == 0">
          <a href="javascript:void(0)" class="a-link" @click="showPanel(1)">アカウントを持っています？</a>
        </el-form-item>
        <el-form-item v-if="opType == 2">
          <a href="javascript:void(0)" class="a-link" @click="showPanel(1)">ログイン？</a>
        </el-form-item>
        <!-- Login Button -->
        <el-form-item>
          <el-button type="primary" class="op-btn" size="large" @click="doSubmit">
            <span v-if="opType == 1">ログイン</span>
            <span v-if="opType == 0">登録へ</span>
            <span v-if="opType == 2">リセット</span>
          </el-button>
        </el-form-item>
      </el-form>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import md5 from "js-md5";

const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
const api = {
  checkCode: "/api/checkCode",
  register: "/register",
  login: "/login",
  resetPwd: "/resetPwd",
};

const formData = ref({});
const formDataRef = ref();


const checkCodeUrl = ref(api.checkCode);
const checkCodeUrl4SendMailCode = ref(api.checkCode);

// operation type: 0:register, 1:log in, 2:reset password

const opType = ref(1);
const showPanel = (type) => {
  opType.value = type;
  resetForm();
};

const checkRePassword = (rule, value, callback) => {
  if (value !== formData.value.registerPassword) {
    console.log(value);
    console.log(formData.value.registerPassword);
    callback(new Error(rule.message));
  } else {
    callback();
  }
};


const changeCheckCode = (type) => {
  if (type == 0) {
    checkCodeUrl.value =
      api.checkCode + "?type=" + type + "&time=" + new Date().getTime();
  } else {
    checkCodeUrl4SendMailCode.value =
      api.checkCode + "?type=" + type + "&time=" + new Date().getTime();
  }

};

const rules = {
  email: [
    { required: true, message: "メールを入力してください" },
    { validator: proxy.Verify.email, message: "正しいメールを入力してください" }
  ],
  password: [
    { required: true, message: "パスワードを入力してください" },
  ],
  nickName: [
    { required: true, message: "ニックネームを入力してください" }
  ],
  registerPassword: [
    { required: true, message: "パスワードを入力してください" },
    { validator: proxy.Verify.password, message: "パスワードは数字、アルファベット、特殊文字のみで、長さは8～18文字" }
  ],
  reRegisterPassword: [
    { required: true, message: "パスワードを入力してください" },
    { validator: checkRePassword, message: "入力されたパスワードの不一致" }
  ],
  checkCode: [
    { required: true, message: "認証コードを入力してください" }
  ]
};

// reset form
const resetForm = () => {
  changeCheckCode(0);
  formDataRef.value.resetFields();
  formData.value = {};
  // login
  if (opType.value == 1) {
    const cookieLoginInfo = proxy.VueCookies.get("loginInfo");
    if (cookieLoginInfo) {
      formData.value = cookieLoginInfo;
    }
  }
};

const doSubmit = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let params = {};
    Object.assign(params, formData.value);
    // register & reset password
    if (opType.value == 0 || opType.value == 2) {
      params.password = params.registerPassword;
      delete params.registerPassword;
      delete params.reRegisterPassword;

    }
    // login
    if (opType.value == 1) {
      let cookieLoginInfo = proxy.VueCookies.get("loginInfo");
      let cookiePassword =
        cookieLoginInfo == null ? null : cookieLoginInfo.password;
      if (params.password !== cookiePassword) {
        params.password = md5(params.password);
      }
    }
    let url = null;
    if (opType.value == 0) {
      url = api.register;
    } else if (opType.value == 1) {
      url = api.login;
    } else if (opType.value == 2) {
      url = api.resetPwd;
    }
    let result = await proxy.Request({
      url: url,
      params: params,
      errorCallback: () => {
        changeCheckCode(0);
      }
    })
    if (!result) {
      return;
    }
    // return register
    if (opType.value == 0) {
      proxy.Message.success("登録に成功");
      showPanel(1);
    } else if (opType.value == 1) {
      if (params.rememberMe) {
        const loginInfo = {
          email: params.email,
          password: params.password,
          rememberMe: params.rememberMe
        };
        proxy.VueCookies.set("loginInfo", loginInfo, "7d");
      } else {
        proxy.VueCookies.remove("loginInfo");
      }
      proxy.Message.success("ログインに成功");
      // restore cookies
      proxy.VueCookies.set("userInfo", result.data, 0);
      // redirect to original page
      const redirectUrl = route.query.redirectUrl || "/";
      router.push(redirectUrl);
    } else if (opType.value == 2) {
      proxy.Message.success("パスワードのリセットに成功");
      showPanel(1);
    }
  });
}

</script>

<style lang="scss" scoped>
.login-body {
  background: url("../assets/login_bg.png");
  width: 100%;
  height: 100%;
  position: fixed;
  background-size: 100% 100%;

  .login-panel {
    width: 430px;
    margin-left: 13%;
    margin-top: calc((100vh - 500px)/2);


    .login-register {
      padding: 25px;
      border-radius: 10px;
      background: rgba(255, 255, 255, .5);
      -webkit-backdrop-filter: blur(10px);
      backdrop-filter: blur(10px);

      .login-title {
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 20px;
      }

      .rememberme-panel {
        width: 100%;
      }

      .no-account {
        width: 100%;
        display: flex;
        justify-content: space-between;
      }

      .op-btn {
        width: 100%;
      }
    }
  }

  .check-code-panel {
    width: 100%;
    display: flex;

    .check-code {
      margin-left: 5px;
      cursor: pointer;
    }
  }



}
</style>


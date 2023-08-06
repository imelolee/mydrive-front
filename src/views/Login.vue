<template>
    <div class="login-body">
        <div class="login-panel">
            <el-form class="login-register" :model="formData" :rules="rules" ref="formDataRef" @submit.prevent>
                <div class="login-title">MyDriveログイン</div>
                <!--email-->
                <el-form-item prop="email">
                    <el-input size="large" clearable placeholder="メールアドレスを入力してください" v-model.trim="formData.email"
                        maxLength="150">
                        <template #prefix>
                            <span class="iconfont icon-account"></span>
                        </template>
                    </el-input>
                </el-form-item>
                <!-- password login -->
                <el-form-item prop="password" v-if="opType == 1">
                    <el-input size="large" type="password" clearable placeholder="パスワードを入力してください"
                        v-model.trim="formData.password" show-password>
                        <template #prefix>
                            <span class="iconfont icon-password"></span>
                        </template>
                    </el-input>
                </el-form-item>
                <!-- register -->
                <div v-if="opType == 0 || opType == 2">
                    <!-- nickname -->
                    <el-form-item prop="nickName" v-if="opType == 0">
                        <el-input size="large" clearable placeholder="ニックネームを入力してください" v-model.trim="formData.nickName"
                            maxLength="20">
                            <template #prefix>
                                <span class="iconfont icon-account"></span>
                            </template>
                        </el-input>
                    </el-form-item>
                    <!-- set password -->
                    <el-form-item prop="registerPassword">
                        <el-input type="password" size="large" clearable placeholder="パスワードを入力してください"
                            v-model.trim="formData.registerPassword" maxLength="20">
                            <template #prefix>
                                <span class="iconfont icon-password"></span>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="reRegisterPassword">
                        <el-input type="password" size="large" clearable placeholder="パスワードをもう一度確認してください"
                            v-model.trim="formData.reRegisterPassword" maxLength="20">
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
                    <el-button type="primary" class="op-btn" size="large">
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
    sendMailCode: "/sendEmailCode",
    register: "/register",
    login: "/login",
    resetPwd: "/resetPwd",
};

const formData = ref({});
const formDataRef = ref();
const rules = {
    title: [{ required: true, message: "内容を入力してください" }],
};

const checkCodeUrl = ref(api.checkCode);
// operation type: 0:register, 1:log in, 2:reset password

const opType = ref(1);
const showPanel = (type) => {
    opType.value = type;
}


const changeCheckCode = (type) => {

    checkCodeUrl.value =
        api.checkCode + "?type=" + type + "&time=" + new Date().getTime();

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


<template>
  <div>
    <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons" width="500px"
      :showCancel="true" @close="dialogConfig.show = false">
      <el-form :model="formData" ref="formDataRef" label-width="80px" :rules="rules" @submit.prevent>
        <el-form-item label="新しいパスワード" prop="password">
          <el-input type="password" size="large" placeholder="パスワードを入力" v-model.trim="formData.password" show-password>
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="確認パスワード" prop="rePassword">
          <el-input type="password" size="large" placeholder="パスワードをもう一度確認" v-model.trim="formData.rePassword"
            show-password>
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue";

const { proxy } = getCurrentInstance();

const api = {
  updatePassword: "updatePassword",
}

const formData = ref({});
const formDataRef = ref();

const checkRePassword = (rule, value, callback) => {
  if (value !== formData.value.password) {

    callback(new Error(rule.message));
  } else {
    callback();
  }
};


const rules = {
  password: [
    { required: true, message: "パスワードを入力してください" },
    {
      validator: proxy.Verify.password,
      message: "パスワードは数字、アルファベット、特殊文字のみで、長さは8～18文字",
    },
  ],
  rePassword: [
    { required: true, message: "パスワードを入力してください" },
    {
      validator: checkRePassword,
      message: "入力されたパスワードの不一致",
    },
  ],
};

const show = () => {
  dialogConfig.value.show = true;
  nextTick(() => {
    formDataRef.value.resetFields();
    formData.value = {};
  });
};

defineExpose({ show });

const dialogConfig = ref({
  show: false,
  title: "パスワードの変更",
  buttons: [
    {
      type: "primary",
      text: "確認",
      click: (e) => {
        submitForm();
      },
    },
  ],
})

const submitForm = async () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let result = await proxy.Request({
      url: api.updatePassword,
      params: {
        password: formData.value.password,
      },
    });
    if (!result) {
      return;
    }
    dialogConfig.value.show = false;
    proxy.Message.success("パスワードを変更されました");
  });
};

</script>

<style lang="scss" scoped></style>
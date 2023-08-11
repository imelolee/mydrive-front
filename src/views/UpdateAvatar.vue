<template>
  <div>
    <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons" width="500px"
      :showCancel="true" @close="dialogConfig.show = false">
      <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="80px" @submit.prevent>

        <el-form-item label="ニックネーム" prop="">
          {{ formData.nickName }}
        </el-form-item>

        <el-form-item label="アバター" prop="">
          <AvatarUpload v-model="formData.avatar"></AvatarUpload>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue";
import AvatarUpload from "@/components/AvatarUpload.vue";
import { useRouter, useRoute } from "vue-router";

const { proxy } = getCurrentInstance();

const api = {
  updateUserAvatar: "updateUserAvatar",
};

const formData = ref({});
const formDataRef = ref();
const rules = {
  title: [{ required: true, message: "内容を入力してください" }]
}

const show = (data) => {
  formData.value = Object.assign({}, data);
  formData.value.avatar = { userId: data.userId, qqAvatar: data.avatar };
  dialogConfig.value.show = true;
}

defineExpose({ show });

const dialogConfig = ref({
  show: false,
  title: "アバターの変更",
  buttons: [
    {
      type: "danger",
      text: "確認",
      click: (e) => {
        submitForm();
      },
    },
  ],
});

</script> 

<style lang="scss" scoped></style>
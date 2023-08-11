<template>
  <el-config-provider :locale="locale" :message="config">
    <router-view></router-view>
  </el-config-provider>
</template>

<script setup>
import { reactive } from "vue";
import ja from 'element-plus/dist/locale/ja.mjs'

const locale = ja;
const config = reactive({
  max: 1,
});
</script>

<style scoped></style>

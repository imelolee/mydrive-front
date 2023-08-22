<template>
  <span :style="{ width: width + 'px', height: width + 'px' }" class="icon">
    <img :src="getImage()" :style="{ 'object-fit': fit }" />
  </span>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from "vue";
const { proxy } = getCurrentInstance();

const props = defineProps({
  fileType: {
    type: Number,
  },
  iconName: {
    type: String,
  },
  cover: {
    type: String,
  },
  width: {
    type: Number,
    default: 32,
  },
  fit: {
    type: String,
    default: "cover",
  },
});

const fileTypeMap = {
  0: { desc: "フォルダ", icon: "folder" },
  1: { desc: "ビデオ", icon: "video" },
  2: { desc: "音楽", icon: "music" },
  3: { desc: "画像", icon: "image" },
  4: { desc: "PDF", icon: "pdf" },
  5: { desc: "word", icon: "word" },
  6: { desc: "excel", icon: "excel" },
  7: { desc: "ppt", icon: "ppt" },
  8: { desc: "txt", icon: "txt" },
  9: { desc: "コード", icon: "code" },
  10: { desc: "圧縮ファイル", icon: "zip" },
  11: { desc: "exe", icon: "exe" },
  12: { desc: "その他", icon: "others" },

};

const getImage = () => {
  if (props.cover) {
    return proxy.globalInfo.imageUrl + props.cover;
  }
  let icon = "unknow_icon";
  if (props.iconName) {
    icon = props.iconName;
  } else {
    const iconMap = fileTypeMap[props.fileType];
    if (iconMap != undefined) {
      icon = iconMap["icon"];
    }
  }
  return new URL(`/src/assets/icon-image/${icon}.png`, import.meta.url).href;
};
</script>

<style lang="scss" scoped>
.icon {
  text-align: center;
  display: inline-block;
  border-radius: 3px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
  }
}
</style>
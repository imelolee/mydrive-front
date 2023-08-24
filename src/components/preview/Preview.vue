<template>
  <PreviewImage ref="imageViewerRef" :imageList="[imageUrl]" v-if="fileInfo.fileCategory == 3"></PreviewImage>
  <Window :show="windowShow" @close="closeWindow" :width="fileInfo.fileCategory == 1 ? 1500 : 900"
    :title="fileInfo.fileName" :align="fileInfo.fileCategory == 1 ? 'center' : 'top'" v-else></Window>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, computed } from "vue";
import PreviewImage from "./PreviewImage.vue"

const { proxy } = getCurrentInstance()

const fileInfo = ref({})
const imageViewerRef = ref()

const windowShow = ref(false)
const closeWindow = () => {
  windowShow.value = false
}

const FILE_URL_MAP = {
  0: {
    fileUrl: "/file/getFile",
    videoUrl: "/file/ts/getVideoInfo",
    createDownloadUrl: "/file/createDownloadUrl",
    downloadUrl: "/api/file/download",
  },
  1: {
    fileUrl: "/showShare/getFile",
    videoUrl: "/showShare/ts/getVideoInfo",
    createDownloadUrl: "/showShare/createDownloadUrl",
    downloadUrl: "/api/showShare/download",
  },
}

const imageUrl = computed(() => {
  return (
    proxy.globalInfo.imageUrl + fileInfo.value.fileCover.replaceAll("_.", ".")
  )
})


const showPreview = (data, showPart) => {
  fileInfo.value = data
  if (data.fileCategory == 3) {
    // image
    nextTick(() => {
      imageViewerRef.value.show(0)
    })
  } else {
    windowShow.value = true
  }
}

defineExpose({ showPreview })
</script>

<style lang="scss" scoped></style>
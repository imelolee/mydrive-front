<template>
  <div class="image-viewer">
    <el-image-viewer :initial-index="previewImgIndex" hide-on-click-modal :url-list="imageList" @close="closeImgViewer"
      v-if="previewImgIndex != null">
    </el-image-viewer>
  </div>
</template>


<script setup>
import { ref, reactive, getCurrentInstance, nextTick, computed } from "vue";
const { proxy } = getCurrentInstance();

const props = defineProps({
  imageList: {
    type: Array,
  }
})

const previewImgIndex = ref(null)

const show = (index) => {
  previewImgIndex.value = index
}

defineExpose({ show })

const closeImgViewer = () => {
  previewImgIndex.value = null
}



</script>

<style lang="scss" scoped>
.image-viewer {
  .el-image-viewer__mask {
    opacity: 0.7;
  }
}
</style>
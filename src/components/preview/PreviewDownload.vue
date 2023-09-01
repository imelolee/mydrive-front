<template>
  <div class="others">
    <div class="body-content">
      <div>
        <Icon :iconName="fileInfo.fileType == 0 ? 'zip' : 'others'" :width="80"></Icon>
      </div>
      <div class="file-name">{{ fileInfo.fileName }}</div>
      <div class="tips">
        このタイプのファイルはプレビューをサポートしていません、ダウンロードして表示してください
      </div>
      <div class="download-btn">
        <el-button type="primary" @click="download">ダウンロード{{ proxy.Utils.size2Str(fileInfo.fileSize) }}</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import APlayer from "aplayer"
import "aplayer/dist/APlayer.min.css"
import { ref, reactive, getCurrentInstance, nextTick, onMounted, onUnmounted } from "vue"
const { proxy } = getCurrentInstance()

const props = defineProps({
  createDownloadUrl: {
    type: String,
  },
  downloadUrl: {
    type: String,
  },
  fileInfo: {
    type: Object,
  },

})

const download = async () => {
  let result = await proxy.Request({
    url: props.createDownloadUrl,
  })
  if (!result) {
    return
  }
  window.location.href = props.downloadUrl + "/" + result.data
}

</script>


<style lang="scss" scoped>
.others {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  .body-content {
    text-align: center;

    .file-name {
      font-weight: bold;
    }

    .tips {
      color: #999898;
      margin-top: 5px;
      font-size: 13px;
    }

    .download-btn {
      margin-top: 20px;
    }
  }
}
</style>
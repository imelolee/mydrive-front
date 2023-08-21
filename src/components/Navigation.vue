<template>
  <div class="top-navigation">
    <template v-if="folderList.length > 0">
      <span class="back link" @click="backParent">
        戻る
      </span>
      <el-divider direction="vertical"></el-divider>
    </template>
    <span v-if="folderList.length == 0" class="all-file">
      全てのファイル
    </span>
    <span v-if="folderList.length > 0" class="link">
      全てのファイル
    </span>
    <template v-for="(item, index) in folderList">
      <span class="iconfont icon-right"></span>
      <span class="link" v-if="index < folderList.length - 1" @click="setCurrentFolder(index)">{{ item.fileName }}</span>
      <span v-if="index == folderList.length - 1" class="text">{{ item.fileName }}</span>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, watch } from "vue";
const { proxy } = getCurrentInstance();
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

const props = defineProps({
  watchPath: {
    type: Boolean,
    default: true,
  },
  shareId: {
    type: String,
  },

})

const api = {
  getFolderInfo: "/file/getFolderInfo",
  getFolderInfo4Share: "/showShare/getFolderInfo",
}

const category = ref()

const folderList = ref([])
const currentFolder = ref({ fileId: "0" })

const openFolder = (data) => {
  const { fileId, fileName } = data
  const folder = {
    fileName: fileName,
    fileId: fileId,
  }
  folderList.value.push(folder)
  currentFolder.value = folder
  setPath()
}

const setPath = () => {
  if (!props.watchPath) {
    // TODO unwatch router callback
    return
  }
  let pathArray = []
  folderList.value.forEach(item => {
    pathArray.push(item.fileId)
  })
  router.push({
    path: route.path,
    query: pathArray.length == 0 ? "" : { path: pathArray.join("/") }
  })
}

defineExpose({
  openFolder
})
// get current path 
const getNavigationFolder = async (path) => {
  let url = api.getFolderInfo
  if (props.shareId) {
    url = api.getFolderInfo4Share
  }

  let result = await proxy.Request({
    url: url,
    showLoading: false,
    params: {
      path: path,
      shareId: props.shareId,
    }
  })
  if (!result) {
    return
  }
  folderList.value = result.data;

}

watch(() => route,
  (newVal, oldVal) => {
    if (!props.watchPath) {
      return
    }
    if (newVal.path.indexOf("/main") === -1) {
      return
    }
    const path = newVal.query.path
    category.value = newVal.params.category
    if (path == undefined) {

    } else {
      getNavigationFolder()
      let pathArray = path.split("/")
      currentFolder.value = {
        fileId: pathArray[pathArray.length - 1],
      }
    }

  }, { immediate: true, deep: true })
</script>

<style lang="scss" scoped>
.top-navigation {
  font-size: 13px;
  display: flex;
  align-items: center;
  line-height: 40px;

  .all-file {
    font-weight: bold;
  }

  .link {
    color: #06a7ff;
    cursor: pointer;
  }

  .icon-right {
    color: #06a7ff;
    padding: 0px 5px;
    font-size: 13px;
  }
}
</style>
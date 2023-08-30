<template>
  <div>
    <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons" width="500px"
      :showCanel="true" @close="dialogConfig.show = false">

      <div class="navigation-panel">
        <Navigation ref="navigationRef" @navChange="navChange" :watchPath="false"></Navigation>
      </div>
      <div class="folder-list" v-if="folderList.length > 0">
        <div class="folder-item" v-for="item in folderList" @click="selectFolder(item)">
          <icon :fileType="0"></icon>
          <span class="file-name">{{ item.fileName }}</span>
        </div>
      </div>
      <div v-else class="tips">
        <span>{{ currentFolder.fileName }}</span>移動
      </div>
    </Dialog>

  </div>
</template>



<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue";
const { proxy } = getCurrentInstance();

const api = {
  loadAllFolder: "/file/loadAllFolder",
}

const dialogConfig = ref({
  show: false,
  title: "このフォルダに移動",
  buttons: [
    {
      type: "primary",
      text: "移動",
      click: () => {
        folderSelect();
      },
    },
  ],
});

// parent folder id
const filePid = ref("0");
const folderList = ref([]);
const currentFileIds = ref({});
const currentFolder = ref({});

const loadAllFolder = async () => {
  let result = await proxy.Request({
    url: api.loadAllFolder,
    params: {
      filePid: filePid.value,
    },
  });
  if (!result) {
    return;
  }
  folderList.value = result.data;
}

const close = () => {
  dialogConfig.value.show = false;
};

const showFolderDialog = (currentFolder) => {
  dialogConfig.value.show = true
  currentFileIds.value = currentFolder
  filePid.value = "0"
  loadAllFolder()
  navigationRef.value.cleanFolderList()
}

defineExpose({
  showFolderDialog,
  close,
});

// select folder
const navigationRef = ref()


const selectFolder = (data) => {

  navigationRef.value.openFolder(data)
}

// confirm selected folder
const emit = defineEmits(["folderSelect"])
const folderSelect = () => {
  emit("folderSelect", filePid.value);
}

// navigation change callback
const navChange = (data) => {
  const { curFolder } = data
  currentFolder.value = curFolder
  filePid.value = curFolder.fileId
  loadAllFolder()
}
</script>


<style lang="scss" scoped>
.navigation-panel {
  padding-left: 10px;
  background: #f1f1f1;
}

.folder-list {
  .folder-item {
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 10px;

    .file-name {
      display: inline-block;
      margin-left: 10px;
    }

    &:hover {
      background: #f8f8f8;
    }
  }

  max-height: calc(100vh - 200px);
  min-height: 200px;
}

.tips {
  text-align: center;
  line-height: 200px;

  span {
    color: #06a7ff;
  }
}
</style>
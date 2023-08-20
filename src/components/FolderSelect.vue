<template>
  <div>
    <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :button="dialogConfig.buttons" width="400px"
      :showCanel="true" @close="dialogConfig.show = false">
      <div class="navigation-panel"></div>
      <div class="folder-list" v-if="folderList.length > 0">
        <div class="folder-item" v-for="item in folderList" @click="selectFolder(item)">
          <icon :fileType="0"></icon>
          <span class="file-name">{{ item.fileName }}</span>
        </div>
      </div>
      <div v-else class="tips">
        <span>{{ currentFolder.fileName }}</span>へ移動
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
      click: () => {
        folderSelect();
      },
      text: "ここに移動",
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
      currentFileIds: currentFileIds.value,
    },
  });
  if (!result) {
    return;
  }
  folderList.value = result.data;
};

const close = () => {
  dialogConfig.value.show = false;
};

const showFolderDialog = (currentFolder) => {
  dialogConfig.value.show = true;
  loadAllFolder();
};

defineExpose({
  showFolderDialog,
  close,
});


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
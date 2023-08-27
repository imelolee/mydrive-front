<template>
  <div>
    <div class="top">
      <div class="top-op">
        <div class="btn">
          <el-upload :show-file-list="false" :with-credentials="true" :multiple="true" :http-request="addFile"
            :accept="fileAccept">
            <el-button type="primary">
              <span class="iconfont icon-upload">アップロード</span>
            </el-button>
          </el-upload>
        </div>
        <el-button type="success" @click="newFolder">
          <span class="iconfont icon-folder-add">新規フォルダー</span>
        </el-button>
        <el-button type="danger" :disabled="selectFileIdList.length == 0" @click="delFileBatch">
          <span class="iconfont icon-del">ごみ箱に移動</span>
        </el-button>
        <el-button type="warning" :disabled="selectFileIdList.length == 0" @click="moveFolderBatch">
          <span class="iconfont icon-move">移動</span>
        </el-button>
        <div class="search-panel">
          <el-input clearable placeholder="ファイル名を検索" v-model="fileNameSearch" @keyup.enter="search">
            <template #suffix>
              <i class="iconfont icon-search" @click="search"></i>
            </template>
          </el-input>
        </div>
        <div class="iconfont icon-refresh" @click="loadDataList"></div>
      </div>
      <!-- Nav -->
      <Navigation ref="navigationRef" @navChange="navChange"></Navigation>
    </div>
    <div class="file-list" v-if="tableData.list && tableData.list.length > 0">
      <Table ref="dataTableRef" :columns="columns" :showPagination="true" :dataSource="tableData" :fetch="loadDataList"
        :initFetch="false" :options="tableOptions" @rowSelected="rowSelected">
        <template #fileName="{ index, row }">
          <div class="file-item" @mouseenter="showOp(row)" @mouseleave="cancelShowOp(row)">
            <template v-if="(row.fileType == 3 || row.fileType == 1) && row.status == 2">
              <Icon :cover="row.fileCover" :width="32"></Icon>
            </template>
            <template v-else="">
              <Icon v-if="row.folderType == 0" :fileType="row.fileType"></Icon>
              <Icon v-if="row.folderType == 1" :fileType="0"></Icon>
            </template>
            <span class="file-name" v-if="!row.showEdit" :title="row.fileName">
              <span @click="preview(row)">{{ row.fileName }}</span>
              <span v-if="row.status == 0" class="transfer-status">トランスコーディング</span>
              <span v-if="row.status == 1" class="transfer-status transfer-fail">トランスに失敗</span>
            </span>
            <div class="edit-panel" v-if="row.showEdit">
              <el-input v-model.trim="row.fileNameReal" ref="editNameRef" :maxLength="190"
                @keyup.enter="saveNameEdit(index)">
                <template #suffix>{{ row.fileSuffix }}</template>
              </el-input>
              <span :class="[
                'iconfont icon-right1',
                row.fileNameReal ? '' : 'not-allow',
              ]" @click="saveNameEdit(index)"></span>
              <span class="iconfont icon-error" @click="cancelNameEdit(index)"></span>
            </div>
            <span class="op">
              <template v-if="row.showOp && row.fileId && row.status == 2">
                <span class="iconfont icon-share1" @click="share(row)">共有</span>
                <span class="iconfont icon-download" v-if="row.folderType == 0" @click="download(row)">ダウンロード</span>
                <span class="iconfont icon-del" @click="delFile(row)">削除</span>
                <span class="iconfont icon-edit" @click="editFileName(index)">名前を変更</span>
                <span class="iconfont icon-move" @click="moveFolder">移動</span>
              </template>
            </span>
          </div>
        </template>
        <template #fileSize="{ index, row }">
          <span v-if="row.fileSize">
            {{ proxy.Utils.size2Str(row.fileSize) }}
          </span>
        </template>
      </Table>
    </div>
    <div class="no-data" v-else>
      <div class="no-data-inner">
        <Icon iconName="no_data" :width="120" fit="fill"></Icon>
        <div class="tips">データなし</div>
        <div class="op-list">
          <el-upload :show-file-list="false" :with-credentials="true" :multiple="true" :http-request="addFile"
            :accept="fileAccept">
            <div class="op-item">
              <Icon iconName="file" :width="60"></Icon>
              <div class="op-text">アップロード</div>
            </div>
          </el-upload>
          <div class="op-item" v-if="category == 'all'" @click="newFolder">
            <Icon iconName="folder" :width="60"></Icon>
            <div class="op-text">新規フォルダー</div>
          </div>
        </div>
      </div>
    </div>
    <FolderSelect ref="folderSelectRef" @folderSelect="moveFolderDone"></FolderSelect>
    <!-- preview -->
    <Preview ref="previewRef"></Preview>
    <!-- file share -->
    <FileShare ref="shareRef"></FileShare>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, computed } from "vue";
import CategoryInfo from "@/js/CategoryInfo"
import FileShare from "./ShareFile.vue"

const { proxy } = getCurrentInstance();
const emit = defineEmits(["addFile"])
const addFile = (fileData) => {
  emit("addFile", { file: fileData.file, filePid: currentFolder.value.fileId })
}

// add file callback
const reload = () => {
  showLoading.value = false
  loadDataList()
}

defineExpose({
  reload,
})

const currentFolder = ref({ fileId: "0" })

const api = {
  loadDataList: "/file/loadDataList",
  rename: "/file/rename",
  newFoloder: "/file/newFolder",
  getFolderInfo: "/file/getFolderInfo",
  delFile: "/file/delFile",
  changeFileFolder: "/file/changeFileFolder",
  createDownloadUrl: "/file/createDownloadUrl",
  download: "/api/file/download",
}

const fileAccept = computed(() => {
  const categoryItem = CategoryInfo[category.value]
  return categoryItem ? categoryItem.accept : "*"
})

// file search
const search = () => {
  if (!fileNameSearch.value) {
    currentFolder.value.fileId = "0"

  } else {
    currentFolder.value.fileId = ""
  }
  fileNameFuzzy.value = fileNameSearch.value
  showLoading.value = true
  loadDataList()
  fileNameFuzzy.value = ""
}


const columns = [
  {
    label: "名前",
    prop: "fileName",
    scopedSlots: "fileName",
  },
  {
    label: "最終更新",
    prop: "lastUpdateTime",
    width: 200,
  },
  {
    label: "ファイルサイズ",
    prop: "fileSize",
    scopedSlots: "fileSize",
    width: 200,
  },
]
const tableData = ref({});
const tableOptions = {
  extHeight: 50,
  selectType: "checkbox",
};

const fileNameSearch = ref();

const fileNameFuzzy = ref();

const showLoading = ref(true);
const category = ref();

const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo,
    pageSize: tableData.value.pageSize,
    fileNameFuzzy: fileNameFuzzy.value,
    filePid: currentFolder.value.fileId,
    category: category.value,
  };
  if (params.category !== "all") {
    delete params.filePid;
  }
  let result = await proxy.Request({
    url: api.loadDataList,
    showLoading: showLoading.value,
    params: params,
  });
  if (!result) {
    return;
  }
  tableData.value = result.data
};

// multi selceted
const selectFileIdList = ref([]);

const rowSelected = (rows) => {
  selectFileIdList.value = [];
  rows.forEach(item => {
    selectFileIdList.value.push(item.fileId)
  })
}

const showOp = (row) => {
  tableData.value.list.forEach(element => {
    element.showOp = false;
  })
  row.showOp = true;
}

const cancelShowOp = (row) => {
  row.showOp = false;
}
// edit row
const editing = ref(false)
const editNameRef = ref()

// create new folder
const newFolder = () => {
  if (editing.value) {
    return
  }
  tableData.value.list.forEach(element => {
    element.showEdit = false;
  })
  editing.value = true;
  tableData.value.list.unshift({
    showEdit: true,
    fileType: 0,
    fileId: "",
    filePid: currentFolder.value.fileId,

  })
  nextTick(() => {
    editNameRef.value.focus()
  })
}

const cancelNameEdit = (index) => {
  const fileData = tableData.value.list[index];
  if (fileData.fileId) {
    fileData.showEdit = false
  } else {
    tableData.value.list.splice(index, 1)

  }
  editing.value = false
}
const saveNameEdit = async (index) => {
  const { fileId, filePid, fileNameReal } = tableData.value.list[index];
  if (fileNameReal == "" || fileNameReal.indexOf("/") != -1) {
    proxy.Message.warning("ファイル名を空にしたり、'/'を含めたりすることはできません")
  }
  let url = api.rename;
  if (fileId == "") {
    url = api.newFoloder;
  }
  let result = await proxy.Request({
    url: url,
    params: {
      fileId: fileId,
      filePid: filePid,
      fileName: fileNameReal
    }
  })
  if (!result) {
    return;
  }
  tableData.value.list[index] = result.data;
  editing.value = false;
}

const editFileName = async (index) => {
  if (tableData.value.list[0].fileId == "") {
    tableData.value.list.splice(0, 1);
    index = index - 1;
  }
  tableData.value.list.forEach(element => {
    element.showEdit = false;
  })
  let currentData = tableData.value.list[index];
  currentData.showEdit = true;
  // edit file
  if (currentData.folderType == 0) {
    currentData.fileNameReal = currentData.fileName.substring(0, currentData.fileName.indexOf("."));
    currentData.fileSuffix = currentData.fileName.substring(currentData.fileName.indexOf("."))
  } else {
    currentData.fileNameReal = currentData.fileName;
    currentData.fileSuffix = "";
  }
  editing.value = true;

  nextTick(() => {
    editNameRef.value.focus();
  })

}

const delFile = (row) => {
  proxy.Confirm(`${row.fileName}を削除しますか？`, async () => {
    let result = await proxy.Request({
      url: api.delFile,
      params: {
        fileIds: row.fileId,
      }
    })
    if (!result) {
      return;
    }
    loadDataList();
  })
}

const delFileBatch = () => {
  if (selectFileIdList.value.length == 0) {
    return;
  }
  proxy.Confirm(`削除しますか？`, async () => {
    let result = await proxy.Request({
      url: api.delFile,
      params: {
        fileIds: selectFileIdList.value.join(","),
      }
    })
    if (!result) {
      return;
    }
    loadDataList();
  })
}

const folderSelectRef = ref();

const currentMoveFile = ref({});
const moveFolder = (data) => {
  currentMoveFile.value = data;
  folderSelectRef.value.showFolderDialog(currentFolder.value.fileId)
}

const moveFolderBatch = () => {
  currentMoveFile.value = {};
  folderSelectRef.value.showFolderDialog(currentFolder.value.fileId);
}

const moveFolderDone = async (folderId) => {
  if (
    currentMoveFile.value.filePid === folderId ||
    currentFolder.value.fileId == folderId
  ) {
    proxy.Message.warning("ファイルはこのディレクトリにあるので、移動する必要はない");
    return;
  }
  let filedIdsArray = [];
  if (currentMoveFile.value.fileId) {
    filedIdsArray.push(currentMoveFile.value.fileId);
  } else {
    filedIdsArray = filedIdsArray.concat(selectFileIdList.value);
  }
  let result = await proxy.Request({
    url: api.changeFileFolder,
    params: {
      fileIds: filedIdsArray.join(","),
      filePid: folderId,
    },
  });
  if (!result) {
    return;
  }
  folderSelectRef.value.close();
  loadDataList();
};

// preview
const navigationRef = ref()
const previewRef = ref()

const preview = (data) => {
  // folder
  if (data.folderType == 1) {
    navigationRef.value.openFolder(data)
    return
  }
  // file
  if (data.status != 2) {
    proxy.Message.warning("このファイルはトランスコード中であり、現在プレビューすることはできません")
    return
  }
  previewRef.value.showPreview(data, 0)
}

const navChange = (data) => {
  const { categoryId, curFolder } = data;
  currentFolder.value = curFolder
  category.value = categoryId
  loadDataList()
}

// download file
const download = async (row) => {
  let result = await proxy.Request({
    url: api.createDownloadUrl + "/" + row.fileId,
  })
  if (!result) {
    return
  }
  window.location.href = api.download + "/" + result.data
}

// share
const shareRef = ref()
const share = (row) => {
  shareRef.value.show(row)
}

</script>

<style lang="scss" scoped>
@import "@/assets/file.list.scss";
</style>
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
          <el-input clearable placeholder="ファイル名を検索">
            <template #suffix>
              <i class="iconfont icon-search"></i>
            </template>
          </el-input>
        </div>
        <div class="iconfont icon-refresh" @click="loadDataList"></div>
      </div>
      <!-- Nav -->
      <Navigation ref="navigationRef"></Navigation>
    </div>
    <div class="file-list">
      <Table ref="dataTableRef" :columns="columns" :showPagination="true" :dataSource="tableData" :fetch="loadDataList"
        :initFetch="true" :options="tableOptions" @rowSelected="rowSelected">
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
                @keyup.enter="saveNameEdit(index)" @input="handlerChange">
                <template #suffix>{{ row.fileSuffix }}</template>
              </el-input>
              <el-button :class="['iconfont icon-right1', row.fileNameReal ? '' : 'not-allow']"
                :disabled="isRewiriteEditor.value == false">
                <span @click="saveNameEdit(index)"></span>
              </el-button>
              <el-button class="iconfont icon-error" @click="cancelNameEdit(index)">
              </el-button>

            </div>
            <span class="op">
              <template v-if="row.showOp && row.fileId && row.status == 2">
                <span class="iconfont icon-share1">共有</span>
                <span class="iconfont icon-download" v-if="row.folderType == 0">ダウンロード</span>
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
    <FolderSelect ref="folderSelectRef" @folderSelect="moveFolderDone"></FolderSelect>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue";

const { proxy } = getCurrentInstance();
const emit = defineEmits(["addFile"])
const addFile = (fileData) => {
  emit("addFile", { file: fileData.file, filePid: currentFolder.value.fileId })
}

const currentFolder = ref({ fileId: 0 })

const api = {
  loadDataList: "/file/loadDataList",
  rename: "/file/rename",
  newFoloder: "/file/newFolder",
  getFolderInfo: "/file/getFolderInfo",
  delFile: "/file/delFile",
  changeFileFolder: "/file/changeFileFolder",
  createDownloadUrl: "/file/createDownloadUrl",
  download: "/api/file/download",
};


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
const fileNameFuzzy = ref();
const category = ref();

const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo,
    pageSize: tableData.value.pageSize,
    fileNameFuzzy: fileNameFuzzy.value,
    filePid: 0,
  };
  if (params.category !== "all") {
    delete params.filePid;
  }
  let result = await proxy.Request({
    url: api.loadDataList,
    params,
  });
  if (!result) {
    return;
  }
  tableData.value = result.data;
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
    filePid: 0,

  })
  nextTick(() => {
    editNameRef.value.focus();
  })
}

let isRewiriteEditor = ref(false);
const handlerChange = (e) => {
  console.log(isRewiriteEditor.value)
  isRewiriteEditor.value = true;
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
  // console.log(folderId);
  if (currentFolder.value.fileId == folderId) {
    proxy.Message.warning("ファイルを移動する必要はありません")
    return
  }
  let fileIdsArray = [];
  if (currentMoveFile.value.fileId) {
    fileIdsArray.push(currentMoveFile.value.fileId);
  } else {
    fileIdsArray = fileIdsArray.concat(selectFileIdList.value);
  }
  let result = await proxy.Request({
    url: api.changeFileFolder,
    params: {
      fileIds: fileIdsArray.join(","),
      filePid: folderId,
    }
  })
  if (!result) {
    return;
  }
  loadDataList();
}

// preview
const navigationRef = ref()

const preview = (data) => {
  if (data.folderType == 1) {
    navigationRef.value.openFolder(data)
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/file.list.scss";
</style>
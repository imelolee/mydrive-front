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
        <el-button type="success">
          <span class="iconfont icon-folder-add">フォルダーを作る</span>
        </el-button>
        <el-button type="danger">
          <span class="iconfont icon-del">削除</span>
        </el-button>
        <el-button type="warning">
          <span class="iconfont icon-move">移動</span>
        </el-button>
        <div class="search-panel">
          <el-input clearable placeholder="ファイル名を入力してください">
            <template #suffix>
              <i class="iconfont icon-search"></i>
            </template>
          </el-input>
        </div>
        <div class="iconfont icon-refresh" @click="loadDataList"></div>
      </div>
      <!-- Nav -->
      <div>すべてのファイル</div>
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
            <span class="file-name" :title="row.fileName">
              <span>{{ row.fileName }}</span>
              <span v-if="row.status == 0" class="transfer-status">トランスコーディング</span>
              <span v-if="row.status == 1" class="transfer-status transfer-fail">トランスに失敗</span>
            </span>
            <span class="op">
              <template v-if="row.showOp && row.fileId && row.status == 2">
                <span class="iconfont icon-share1">共有</span>
                <span class="iconfont icon-download" v-if="row.folderType == 0">ダウンロード</span>
                <span class="iconfont icon-del">削除</span>
                <span class="iconfont icon-edit">名前を変更</span>
                <span class="iconfont icon-move">移動</span>
              </template>
            </span>
          </div>
        </template>
      </Table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue";

const { proxy } = getCurrentInstance();
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
    label: "ファイル名",
    prop: "fileName",
    scopedSlots: "fileName",
  },
  {
    label: "変更時間",
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


const rowSelected = () => {

}

const showOp = (row) => {
  tableData.value.list.forEach(element => {
    element.showOp = false;
  })
  row.showOp = true;
};

const cancelShowOp = (row) => {
  row.showOp = false;
}
</script>

<style lang="scss" scoped>
@import "@/assets/file.list.scss";
</style>
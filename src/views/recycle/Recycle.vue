<template>
  <div>
    <div class="top">
      <el-button type="success" :disabled="selectIdList.length == 0" @click="revertBatch">
        <span class="iconfont icon-revert"></span>復元
      </el-button>
      <el-button type="danger" :disabled="selectIdList.length == 0" @click="delBatch">
        <span class="iconfont icon-del"></span>完全に削除
      </el-button>
    </div>
    <div class="file-list">
      <Table ref="dataTableRef" :columns="columns" :dataSource="tableData" :fetch="loadDataList" :initFetch="true"
        :options="tableOptions" @rowSelected="rowSelected">
        <template #fileName="{ index, row }">
          <div class="file-item" @mouseenter="showOp(row)" @mouseleave="cancelShowOp(row)">
            <template v-if="(row.fileType == 3 || row.fileType == 1) && row.status !== 0">
              <Icon :cover="row.fileCover"></Icon>
            </template>
            <template v-else>
              <Icon v-if="row.folderType == 0" :fileType="row.fileType"></Icon>
              <Icon v-if="row.folderType == 1" :fileType="0"></Icon>
            </template>
            <span class="file-name" :title="row.fileName" @click="preview(row)">{{ row.fileName }}</span>

            <span class="op">
              <template v-if="row.showOp">
                <span class="iconfont icon-link" @click="revert(row)">復元</span>
                <span class="iconfont icon-cancel" @click="delFile(row)">完全に削除
                </span>
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
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted, onUnmounted } from "vue"
const { proxy } = getCurrentInstance()

const api = {
  loadDataList: "/recycle/loadRecycleList",
  delFile: "/recycle/delFile",
  recoverFile: "/recycle/recoverFile",
}

const columns = [
  {
    label: "ファイル名",
    prop: "fileName",
    scopedSlots: "fileName",
  },
  {
    label: "削除時間",
    prop: "recoveryTime",
    width: 200,
  },
  {
    label: "サイズ",
    prop: "fileSize",
    scopedSlots: "fileSize",
    width: 200,
  },
]

const selectIdList = ref([])
const tableData = ref({})
const tableOptions = {
  extHeight: 20,
  selectType: "checkbox",
}
const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo,
    pageSize: tableData.value.pageSize,
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
}
</script>

<style lang="scss" scoped>
@import "@/assets/file.list.scss";

.file-list {
  margin-top: 10px;

  .file-item {
    .op {
      width: 120px;
    }
  }
}
</style>
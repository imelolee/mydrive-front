<template>
  <div>
    <div class="top">
      <el-button type="primary" :disabled="selectIdList.length == 0" @click="cancelShareBatch">
        <span class="iconfont icon-cancel"></span>
        共有取消</el-button>
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
                <span class="iconfont icon-link" @click="copy(row)">共有リンクをコピー</span>
                <span class="iconfont icon-cancel" @click="cancelShare(row)">共有取消
                </span>
              </template>
            </span>
          </div>
        </template>
      </Table>
    </div>
    <Preview ref="previewRef"></Preview>
  </div>
</template>

<script setup>
import useClipboard from "vue-clipboard3"
import { ref, reactive, getCurrentInstance, nextTick, onMounted, onUnmounted } from "vue"
const { proxy } = getCurrentInstance()
const { toClipboard } = useClipboard()

const api = {
  loadDataList: "/share/loadShareList",
  cancelShare: "/share/cancelShare"
}

const columns = [
  {
    label: "ファイル名",
    prop: "fileName",
    scopedSlots: "fileName",
  },
  {
    label: "共有時間",
    prop: "shareTime",
    width: 200,
  },
  {
    label: "無効時間",
    prop: "expireTime",
    width: 200,
  },

  {
    label: "閲覧回数",
    prop: "showCount",
    width: 200
  }
]

const search = () => {
  showLoading.value = true
  loadDataList()
}

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


const selectIdList = ref([])
const rowSelected = (rows) => {
  selectIdList.value = []
  rows.forEach((item) => {
    selectIdList.value.push(item.shareId)
  })
}

const showOp = (row) => {
  tableData.value.list.forEach(item => {
    item.showOp = false
  })
  row.showOp = true
}

const cancelShowOp = (row) => {
  row.showOp = false
}

// copy share link
const shareUrl = ref(document.location.origin + "/share/")

const copy = async (data) => {
  await toClipboard(`リンク: ${shareUrl.value}${data.shareId} コード: ${data.code}`)
  proxy.Message.success("コピーに成功しました")
}

// cancel share
const cancelShareIdList = ref([])
const cancelShareBatch = () => {
  if (selectIdList.value.length == 0) {
    return
  }
  cancelShareIdList.value = selectIdList.value
  cancelShareDone()
}

const cancelShare = (row) => {
  cancelShareIdList.value = [row.shareId]
  cancelShareDone()
}

const cancelShareDone = () => {
  proxy.Confirm(`共有を取消しますか？`, async () => {
    let result = await proxy.Request({
      url: api.cancelShare,
      params: {
        shareIds: cancelShareIdList.value.join(",")
      }
    })
    if (!result) {
      return
    }
    proxy.Message.success("共有取消に成功しました")
    loadDataList()
  })
}

// preview
const navigationRef = ref()
const previewRef = ref()

const preview = (data) => {
  // folder
  debugger
  if (data.folderType == 1) {
    navigationRef.value.openFolder(data)
    return
  }
  previewRef.value.showPreview(data, 0)
}
</script>

<style lang="scss" scoped>
@import "@/assets/file.list.scss";

.file-list {
  margin-top: 10px;

  .file-item {
    .file-name {
      span {
        &:hover {
          color: #494944;
        }
      }
    }

    .op {
      width: 250px;
    }
  }
}
</style>
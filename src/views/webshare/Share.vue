<template>
  <div class="share">
    <div class="header">
      <div class="header-content">
        <div class="logo" @click="jump">
          <span class="iconfont icon-pan"></span>
          <span class="name">MyDrive</span>
        </div>
      </div>
    </div>
  </div>
  <div class="share-body">
    <template v-if="Object.keys(shareInfo).length == 0">
      <div class="loading" v-loading="Object.keys(shareInfo).length == 0"></div>
    </template>
    <template v-else>
      <div class="share-panel">
        <div class="share-user-info">
          <div class="avatar">
            <Avatar :userId="shareInfo.userId" :avatar="shareInfo.avatar" :width="50"></Avatar>
          </div>
          <div class="share-info">
            <div class="user-info">
              <span class="nick-name">{{ shareInfo.nickName }}</span>
              <span class="share-time">{{ shareInfo.shareTime }} 共有</span>
            </div>
            <div class="file-name">共有ファイル： {{ shareInfo.fileName }}</div>
          </div>
        </div>
        <div class="share-op-btn">
          <el-button v-if="shareInfo.currentUser" type="primary" @click="cancelShare">
            <span class="iconfont icon-cancel"></span>
            共有解除
          </el-button>
          <el-button v-else type="primary" @click="save2MyDrive" :disabled="selectFileIdList.length == 0">
            <span class="iconfont icon-import"></span>
            保存
          </el-button>
        </div>
      </div>
      <Navigation ref="navigationRef" @navChange="navChange" :shareId="shareId"></Navigation>
      <div class="file-list">
        <Table ref="dataTableRef" :columns="columns" :dataSource="tableData" :fetch="loadDataList" :initFetch="false"
          :options="tableOptions" @rowSelected="rowSelected">
          <template #fileName="{ index, row }">
            <div class="file-item" @mouseenter="showOp(row)" @mouseleave="cancelShowOp(row)">
              <template v-if="(row.fileType == 3 || row.fileType == 1) && row.status !== 0
                ">
                <icon :cover="row.fileCover"></icon>
              </template>
              <template v-else>
                <icon v-if="row.folderType == 0" :fileType="row.fileType"></icon>
                <icon v-if="row.folderType == 1" :fileType="0"></icon>
              </template>
              <span class="file-name" :title="row.fileName">
                <span @click="preview(row)">{{ row.fileName }}</span>
              </span>
              <span class="op">
                <span v-if="row.folderType == 0" class="iconfont icon-download" @click="download(row)">ダウンロード</span>
                <template v-if="row.showOp && !shareInfo.currentUser">
                  <span class="iconfont icon-import" @click="save2MyDriveSingle(row)">保存</span>
                </template>
              </span>
            </div>
          </template>
          <template #fileSize="{ index, row }">
            <span v-if="row.fileSize">
              {{ proxy.Utils.size2Str(row.fileSize) }}</span>
          </template>
        </Table>
      </div>
    </template>
    <!-- select move folder -->
    <FolderSelect ref="folderSelectRef" @folderSelect="save2MyDriveDone"></FolderSelect>
    <Preview ref="previewRef"></Preview>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue"
const { proxy } = getCurrentInstance()
import { useRouter, useRoute } from "vue-router"
const router = useRouter()
const route = useRoute()

const api = {
  getShareLoginInfo: "/showShare/getShareLoginInfo",
  loadFileList: "/showShare/loadFileList",
  createDownloadUrl: "/showShare/createDownloadUrl",
  download: "/api/showShare/download",
  cancelShare: "/share/cancelShare",
  saveShare: "/showShare/saveShare",
}

const shareId = route.params.shareId
const shareInfo = ref({})
const getShareInfo = async () => {
  let result = await proxy.Request({
    url: api.getShareLoginInfo,
    showLoading: false,
    params: {
      shareId
    },
  })
  if (!result) {
    return
  }
  if (result.data == null) {
    router.push(`/shareCheck/${shareId}`)
    return
  }
  shareInfo.value = result.data
}
getShareInfo()



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
const tableData = ref({})
const tableOptions = {
  extHeight: 80,
  selectType: "checkbox",
}

const currentFolder = ref({ fileId: "0" })

const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo,
    pageSize: tableData.value.pageSize,
    shareId: shareId,
    filePid: currentFolder.value.fileId,
  }
  let result = await proxy.Request({
    url: api.loadFileList,
    params: params,
  })
  if (!result) {
    return;
  }
  tableData.value = result.data
}

const selectFileIdList = ref([])
const rowSelected = (rows) => {
  selectFileIdList.value = []
  rows.forEach((item) => {
    selectFileIdList.value.push(item.fileId)
  })
}

const navChange = (data) => {
  const { curFolder } = data
  currentFolder.value = curFolder
  loadDataList()
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

const previewRef = ref()
const navigationRef = ref()

const preview = (data) => {
  if (data.folderType == 1) {
    navigationRef.value.openFolder(data)
    return
  }
  data.shareId = shareId
  previewRef.value.showPreview(data, 1)
}
// download file
const download = async (row) => {
  let result = await proxy.Request({
    url: api.createDownloadUrl + "/" + shareId + "/" + row.fileId
  })
  if (!result) {
    return
  }
  window.location.href = api.download + "/" + result.data
}

// save to my drive
const folderSelectRef = ref()
const save2MyDriveFileIdArray = []
const save2MyDrive = () => {
  if (selectFileIdList.value.length == 0) {
    return
  }
  if (!proxy.VueCookies.get("userInfo")) {
    router.push("/login?redirectUrl=" + route.path)
    return
  }
  save2MyDriveFileIdArray.value = selectFileIdList.value
  folderSelectRef.value.showFolderDialog()
}

const save2MyDriveSingle = (row) => {
  if (!proxy.VueCookies.get("userInfo")) {
    router.push("/login?redirectUrl=" + route.path)
    return
  }
  save2MyDriveFileIdArray.value = [row.fileId]
  folderSelectRef.value.showFolderDialog()
}

const save2MyDriveDone = async (folderId) => {
  let result = await proxy.Request({
    url: api.saveShare,
    params: {
      shareId: shareId,
      shareFileIds: save2MyDriveFileIdArray.value.join(","),
      myFolderId: folderId,
    }
  })
  if (!result) {
    return
  }
  loadDataList()
  proxy.Message.success("保存に成功しました")
  folderSelectRef.value.close()
}

const cancelShare = () => {
  proxy.Confirm("共有を解除しますか？", async () => {
    let result = await proxy.Request({
      url: api.cancelShare,
      params: {
        shareIds: shareId,
      }
    })
    if (!result) {
      return
    }
    proxy.Message.success("共有が解除しました")
    router.push("/")
  })
}
const jump = () => {
  router.push("/")
}
</script>

<style lang="scss" scoped>
@import "@/assets/file.list.scss";

.header {
  width: 100%;
  position: fixed;
  box-shadow: 0 3px 10px 0 rgb(0 0 0 / 6%);
  height: 56px;
  padding-left: 24px;
  padding-right: 24px;
  position: relative;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-content {
    width: 70%;
    margin: 0px auto;
    color: #05a1f5;
    line-height: 50px;

    .logo {
      display: flex;
      align-items: center;
      cursor: pointer;

      .icon-pan {
        font-size: 40px;
      }

      .name {
        font-weight: bold;
        font-family: "Kanit";
        margin-left: 5px;
        font-size: 30px;
      }
    }
  }
}

.share-body {
  width: 70%;
  margin: 0px auto;
  padding-top: 50px;

  .loading {
    height: calc(100vh / 2);
    width: 100%;
  }

  .share-panel {
    margin-top: 20px;
    display: flex;
    justify-content: space-around;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;

    .share-user-info {
      flex: 1;
      display: flex;
      align-items: center;

      .avatar {
        margin-right: 5px;
      }

      .share-info {
        .user-info {
          display: flex;
          align-items: center;

          .nick-name {
            font-size: 15px;
          }

          .share-time {
            margin-left: 20px;
            font-size: 12px;
          }
        }

        .file-name {
          margin-top: 10px;
          font-size: 12px;
        }
      }
    }
  }
}

.file-list {
  margin-top: 10px;

  .file-item {
    .op {
      width: 170px;
    }
  }
}
</style>

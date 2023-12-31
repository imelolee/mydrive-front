<template>
  <div class="uploader-panel">
    <div class="uploader-title">
      <span>アップロードタスク</span>
      <span class="tips">(このアップロードタスクのみを表示)</span>
    </div>
    <div class="file-list">
      <div v-for="(item, index) in fileList" class="file-item">
        <div class="upload-panel">
          <div class="file-name">{{ item.fileName }}</div>
          <div class="progress">
            <el-progress :percentage="item.uploadProgress" v-if="item.status == STATUS.uploading.value
              || item.status == STATUS.upload_seconds.value
              || item.status == STATUS.upload_finish.value">
            </el-progress>
          </div>
          <div class="upload-status">
            <!-- icon -->
            <span :class="['iconfont', 'icon-' + STATUS[item.status].icon]"
              :style="{ color: STATUS[item.status].color }"></span>
            <!-- status -->
            <span class="status" :style="{ color: STATUS[item.status].color }">
              {{ item.status == "fail" ? item.errorMsg : STATUS[item.status].desc }}
            </span>
            <!-- uploading -->
            <span class="upload-info" v-if="item.status == STATUS.uploading.value">
              {{ proxy.Utils.size2Str(item.uploadSize) }}/{{ proxy.Utils.size2Str(item.totalSize) }}
            </span>
          </div>
        </div>
        <div class="op">
          <!-- MD5 -->
          <el-progress type="circle" :width="50" :percentage="item.md5Progress" v-if="item.status == STATUS.init.value">
          </el-progress>
          <div class="op-btn">
            <span v-if="item.status === STATUS.uploading.value">
              <Icon :width="28" class="btn-item" iconName="upload" v-if="item.pause" title="アップロード"
                @click="startUpload(item.uid)"></Icon>
              <Icon v-else :width="28" class="btn-item" iconName="pause" title="一時停止" @click="pauseUpload(item.uid)">
              </Icon>
            </span>
            <Icon :width="28" class="del btn-item" iconName="del"
              v-if="item.status != STATUS.init.value && item.status != STATUS.upload_finish.value && item.status != STATUS.upload_seconds.value"
              title="削除" @click="delUpload(item.uid, index)"></Icon>
            <Icon :width="28" class="del btn-item" iconName="del"
              v-if="item.status == STATUS.upload_finish.value || item.status == STATUS.upload_seconds.value" title="削除"
              @click="delUpload(item.uid, index)"></Icon>
          </div>
        </div>
      </div>
      <div v-if="fileList.length == 0">
        <NoData msg="アップロードタスクはまだありません"></NoData>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted, watch } from "vue";
import SparkMD5 from "spark-md5"

const api = {
  upload: "/file/uploadFile"
}

const { proxy } = getCurrentInstance();
const STATUS = {
  emptyfile: {
    value: "emptyfile",
    desc: "空のファイル",
    color: "#F75000",
    icon: "close",
  },
  fail: {
    value: "fail",
    desc: "アップロード失敗",
    color: "#F75000",
    icon: "close",
  },
  init: {
    value: "init",
    desc: "解析中",
    color: "#e6a23c",
    icon: "clock",
  },
  uploading: {
    value: "uploading",
    desc: "アップロード中",
    color: "#409eff",
    icon: "upload",
  },
  upload_finish: {
    value: "upload_finish",
    desc: "アップロード完了",
    color: "#67c23a",
    icon: "ok",
  },
  upload_seconds: {
    value: "upload_seconds",
    desc: "快速アップロード",
    color: "#67c23a",
    icon: "ok",
  },
};

const chunkSize = 1024 * 1024 * 5;

const fileList = ref([]);

const delList = ref([]);

const addFile = async (file, filePid) => {
  // console.log(file);
  // console.log(filePid);
  const fileItem = {
    file: file,
    uid: file.uid,
    md5Progress: 0,
    md5: null,
    fileName: file.name,
    status: STATUS.init.value,
    uploadSize: 0,
    totalSize: file.size,
    uploadProgress: 0,
    pause: false,
    chunkIndex: 0,
    filePid: filePid,
    errorMsg: null,
  }
  fileList.value.unshift(fileItem);
  if (fileItem.totalSize == 0) {
    fileItem.status = STATUS.emptyfile.value;
    return;
  }

  let md5FileUid = await computeMd5(fileItem);
  if (md5FileUid == null) {
    return;
  }
  uploadFile(md5FileUid);

}

defineExpose({ addFile })
// start uploading
const startUpload = (uid) => {
  let currentFile = getFileByUid(uid)
  currentFile.pause = false
  uploadFile(uid, currentFile.chunkIndex)
}
// pause uploading
const pauseUpload = (uid) => {
  let currentFile = getFileByUid(uid)
  currentFile.pause = true
}
// delete uploading
const delUpload = (uid, index) => {
  delList.value.push(uid)
  fileList.value.splice(index, 1)
}

const emit = defineEmits(["uploadCallback"]);

// compute md5
const computeMd5 = (fileItem) => {

  let file = fileItem.file;
  let blogSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
  let chunks = Math.ceil(file.size / chunkSize);
  let currentChunk = 0;
  let spark = new SparkMD5.ArrayBuffer();
  let fileReader = new FileReader();

  let loadNext = () => {
    let start = currentChunk * chunkSize;
    let end = start + chunkSize >= file.size ? file.size : start + chunkSize;
    fileReader.readAsArrayBuffer(blogSlice.call(file, start, end));
  }

  loadNext();
  return new Promise((resolve, reject) => {
    let resultFile = getFileByUid(file.uid);
    fileReader.onload = (e) => {
      spark.append(e.target.result);
      currentChunk++;
      if (currentChunk < chunks) {
        let percent = Math.floor((currentChunk / chunks) * 100);
        resultFile.md5Progress = percent;
        loadNext();
      } else {
        let md5 = spark.end();
        spark.destroy();
        resultFile.md5Progress = 100;
        resultFile.status = STATUS.uploading.value;
        resultFile.md5 = md5;
        resolve(fileItem.uid);
      }
    };
    fileReader.onerror = () => {
      resultFile.md5Progress = -1;
      resultFile.status = STATUS.fail.value;
      resolve(fileItem.uid);
    }
  }).catch(error => {
    return null;
  });
}

const getFileByUid = (uid) => {
  let file = fileList.value.find(item => {
    return item.file.uid === uid;
  })
  return file;
}

const uploadFile = async (uid, chunkIndex) => {
  chunkIndex = chunkIndex ? chunkIndex : 0;
  let currentFile = getFileByUid(uid);
  const file = currentFile.file;
  const fileSize = currentFile.totalSize;
  const chunks = Math.ceil(fileSize / chunkSize);
  for (let i = chunkIndex; i < chunks; i++) {
    let delIndex = delList.value.indexOf(uid);
    if (delIndex != -1) {
      delList.value.splice(delIndex, 1);
      break;
    }
    currentFile = getFileByUid(uid);
    if (currentFile.pause) {
      break;
    }
    let start = i * chunkSize;
    let end = start + chunkSize >= fileSize ? fileSize : start + chunkSize;
    let chunkFile = file.slice(start, end);
    let updateResult = await proxy.Request({
      url: api.upload,
      showLoading: false,
      dataType: "file",
      params: {
        file: chunkFile,
        fileName: file.name,
        fileMd5: currentFile.md5,
        chunkIndex: i,
        chunks: chunks,
        fileId: currentFile.fileId,
        filePid: currentFile.filePid,
      },
      showError: false,
      errorCallback: (errorMsg) => {
        currentFile.status = STATUS.fail.value;
        currentFile.errorMsg = errorMsg;
      },
      uploadProgressCallback: (event) => {
        let loaded = event.loaded;
        if (loaded > fileSize) {
          loaded = fileSize;
        }
        currentFile.uploadSize = i * chunkSize + loaded;
        currentFile.uploadProgress = Math.floor((currentFile.uploadSize / fileSize) * 100)
      },
    })

    if (updateResult == null) {
      break;
    }
    currentFile.fileId = updateResult.data.fileId;
    currentFile.status = STATUS[updateResult.data.status].value;
    currentFile.chunkIndex = i;
    if (updateResult.data.status == STATUS.upload_seconds.value || updateResult.data.status == STATUS.upload_finish.value) {
      currentFile.uploadProgress = 100;
      emit("uploadCallback")
      break;
    }
  }
}

</script>


<style lang="scss" scoped>
.uploader-panel {
  .uploader-title {
    border-bottom: 1px solid #ddd;
    line-height: 40px;
    padding: 0px 10px;
    font-size: 15px;

    .tips {
      font-size: 13px;
      color: rgb(169, 169, 169);
    }
  }

  .file-list {
    overflow: auto;
    padding: 10px 0px;
    min-height: calc(100vh / 2);
    max-height: calc(100vh - 120px);

    .file-item {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3px 10px;
      background-color: #fff;
      border-bottom: 1px solid #ddd;
    }

    .file-item:nth-child(even) {
      background-color: #fcf8f4;
    }

    .upload-panel {
      flex: 1;

      .file-name {
        color: rgb(64, 62, 62);
      }

      .upload-status {
        display: flex;
        align-items: center;
        margin-top: 5px;

        .iconfont {
          margin-right: 3px;
        }

        .status {
          color: red;
          font-size: 13px;
        }

        .upload-info {
          margin-left: 5px;
          font-size: 12px;
          color: rgb(112, 111, 111);
        }
      }

      .progress {
        height: 10px;
      }
    }

    .op {
      width: 100px;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      .op-btn {
        .btn-item {
          cursor: pointer;
        }

        .del,
        .clean {
          margin-left: 5px;
        }
      }
    }
  }
}
</style>

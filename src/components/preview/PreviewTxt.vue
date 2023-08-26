<template>
  <div class="code">
    <div class="top-op">
      <div class="encode-select">
        <el-select clearable placeholder="エンコードタイプを選択してください" v-model="encode" @change="changeEncode">
          <el-option value="utf8" label="utf8"></el-option>
          <el-option value="gbk" label="gbk"></el-option>
        </el-select>
        <div class="tips">オプションのエンコーディング</div>
      </div>
      <div class="copy-btn">
        <el-button type="primary" @click="copy">コピー </el-button>
      </div>
    </div>
    <highlightjs autodetect :code="txtContent"></highlightjs>
  </div>
</template>

<script setup>
import useClipboard from "vue-clipboard3"
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from "vue"
const { proxy } = getCurrentInstance()

const { toClipboard } = useClipboard()

const props = defineProps({
  url: {
    type: String,
  }
})

const codeRef = ref()
const txtContent = ref("")
const blobResult = ref()
const encode = ref("utf8")

const readTxt = async () => {
  let result = await proxy.Request({
    url: props.url,
    responseType: "blob"
  })
  if (!result) {
    return
  }
  blobResult.value = result
  showTxt()
}

const changeEncode = (e) => {
  encode.value = e
  showTxt()
}

const showTxt = () => {
  const reader = new FileReader()
  reader.onload = () => {
    let txt = reader.result
    txtContent.value = txt
  }
  reader.readAsText(blobResult.value, encode.value)
}

onMounted(() => {
  readTxt()
})

const copy = async () => {
  await toClipboard(txtContent.value)
  proxy.Message.success("コピーに成功しました")
}
</script>

<style lang="scss" scoped>
.code {
  width: 100%;

  .top-op {
    display: flex;
    align-items: center;
    justify-content: space-around;
  }

  .encode-select {
    flex: 1;
    display: flex;
    align-items: center;
    margin: 5px 10px;

    .tips {
      margin-left: 10px;
      color: #828282;
    }
  }

  .copy-btn {
    margin-right: 10px;
  }

  pre {
    margin: 0px;
  }
}</style>
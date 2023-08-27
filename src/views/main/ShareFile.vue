<template>
  <div>
    <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons" width="600px"
      :showCancel="showCancel" @close="dialogConfig.show = false">
      <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="100px" @submit.prevent>
        <el-form-item label="ファイル名"> {{ formData.fileName }} </el-form-item>
        <template v-if="showType == 0">
          <el-form-item label="有効期間" prop="validType">
            <el-radio-group v-model="formData.validType">
              <el-radio :label="0">1日</el-radio>
              <el-radio :label="1">7日</el-radio>
              <el-radio :label="2">30日</el-radio>
              <el-radio :label="3">永久に有効</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="コード" prop="codeType">
            <el-radio-group v-model="formData.codeType">
              <el-radio :label="0">カスタマイズ</el-radio>
              <el-radio :label="1">システム生成</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item prop="code" v-if="formData.codeType == 0">
            <el-input clearable placeholder="5桁のコードを入力してください" v-model.trim="formData.code" maxLength="5"
              :style="{ width: '130px' }"></el-input>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="共有">
            {{ shareUrl }}{{ resultInfo.shareId }}
          </el-form-item>
          <el-form-item label="コード">
            {{ resultInfo.code }}
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="copy">コピー</el-button>
          </el-form-item>
        </template>
      </el-form>
    </Dialog>
  </div>
</template>

<script setup>
import useClipboard from "vue-clipboard3"
import { ref, reactive, getCurrentInstance, nextTick, onMounted, onUnmounted } from "vue"
const { proxy } = getCurrentInstance()
const { toClipboard } = useClipboard()

const shareUrl = ref(document.location.origin + "/share/")
const api = {
  shareFile: "/share/shareFile",
}

const showType = ref(0)

const formData = ref({})
const formDataRef = ref()
const rules = {
  validType: [{ required: true, message: "有効期限を設定してください" }],
  codeType: [{ required: true, message: "コードの種類を選択してください" }],
  code: [
    { required: true, message: "コードを入力してください" },
    { validator: proxy.Verify.shareCode, message: "コードを入力してください" },
    { min: 5, message: "最低5桁のコード" },
    { max: 5, message: "最大5桁のコード" },
  ],
}

const showCancel = ref(true)

const dialogConfig = ref({
  show: false,
  title: "共有",
  buttons: [
    {
      type: "primary",
      text: "確認",
      click: (e) => {
        share()
      }
    }
  ]
})

const resultInfo = ref({})
const share = async () => {
  dialogConfig.value.buttons[0].text = "確認"
  if (Object.keys(resultInfo.value).length > 0) {
    dialogConfig.value.show = false
    return
  }
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let params = {}
    Object.assign(params, formData.value)
    let result = await proxy.Request({
      url: api.shareFile,
      params: params
    })

    if (!result) {
      return
    }

    showType.value = 1
    resultInfo.value = result.data
    dialogConfig.value.buttons[0].text = "閉める"
    showCancel.value = false
  })
}

const show = (data) => {
  showType.value = 0
  dialogConfig.value.show = true
  showCancel.value = true
  resultInfo.value = {}

  nextTick(() => {
    formDataRef.value.resetFields()
    formData.value = Object.assign({}, data)
  })
}

defineExpose({ show })

const copy = async () => {
  await toClipboard(`リンク: ${shareUrl.value}${resultInfo.value.shareId} コード: ${resultInfo.value.code}`)
  proxy.Message.success("コピーに成功しました")
}
</script>

<style lang="scss" scoped></style>
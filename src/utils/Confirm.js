import { ElMessageBox } from "element-plus";

const confirm = (message, okfun) => {
  ElMessageBox.confirm(message, "ヒント", {
    confirmButtonText: "確認",
    cancelButtonText: "キャンセル",
    type: "info",
  })
    .then(() => {
      okfun();
    })
    .catch(() => {});
};

export default confirm;

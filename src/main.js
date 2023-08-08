import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

import "@/assets/icon/iconfont.css";
import "@/assets/base.scss";

import { VueCookies } from "vue-cookies";
import Dialog from "@/components/Dialog.vue";
import Verify from "@/utils/Verify";
import Message from "@/utils/Message";
import Request from "@/utils/Request";

const app = createApp(App);

app.use(ElementPlus);

app.use(router);

app.component("Dialog", Dialog);
app.config.globalProperties.Message = Message;
app.config.globalProperties.Verify = Verify;
app.config.globalProperties.Request = Request;
app.config.globalProperties.VueCookies = VueCookies;

app.mount("#app");

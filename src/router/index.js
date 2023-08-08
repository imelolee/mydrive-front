import { createRouter, createWebHistory } from "vue-router";
import VueCookies from "vue-cookies";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "ログイン",
      component: () => import("@/views/Login.vue"),
    },
  ],
});

export default router;

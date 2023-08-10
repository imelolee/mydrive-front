import { createRouter, createWebHistory } from "vue-router";
import VueCookies from "vue-cookies";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: () => import("@/views/Login.vue"),
    },
    {
      path: "/",
      name: "Framework",
      component: () => import("@/views/Framework.vue"),
      children: [
        {
          path: "/",
          redirect: "/main/all",
        },
        {
          path: "/main/:category",
          name: "Home",
          meta: {
            needLogin: true,
            menuCode: "main",
          },
          component: () => import("@/views/main/Main.vue"),
        },
        {
          path: "/myshare",
          name: "Myshare",
          meta: {
            needLogin: true,
            menuCode: "share",
          },
          component: () => import("@/views/share/Share.vue"),
        },
        {
          path: "/recycle",
          name: "Recycle",
          meta: {
            needLogin: true,
            menuCode: "recycle",
          },
          component: () => import("@/views/recycle/Recycle.vue"),
        },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  const userInfo = VueCookies.get("userInfo");
  if (to.meta.needLogin != null && to.meta.needLogin && userInfo == null) {
    router.push("/login");
  }
  next();
});
export default router;

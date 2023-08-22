<template>
  <div class="framework">
    <div class="header">
      <div class="logo">
        <span class="iconfont icon-pan"></span>
        <div class="name">MyDrive </div>
      </div>
      <div class="right-panel">
        <el-popover :width="800" trigger="click" v-model:visible="showUploader" :offset="20" transition="none"
          :hide-after="0" :popper-style="{ padding: '0px' }">
          <template #reference>
            <span class="iconfont icon-transfer"></span>
          </template>
          <template #default>
            <Uploader ref="uploaderRef" @uploadCallback="uploadCallbackHandler"></Uploader>
          </template>
        </el-popover>
        <el-dropdown>
          <div class="user-info">
            <div class="avatar">
              <Avatar :userId="userInfo.userId" :avatar="userInfo.avatar" :timestamp="timestamp" :width="40"></Avatar>
            </div>
            <span class="nick-name">{{ userInfo.nickName }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="updateAvatar">プロフィール写真変更</el-dropdown-item>
              <el-dropdown-item @click="updatePassword">パスワード変更</el-dropdown-item>
              <el-dropdown-item @click="logout">ログアウト</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="body">
      <div class="left-sider">
        <div class="menu-list">
          <template v-for="item in menus">
            <div @click="jump(item)" :class="['menu-item', item.menuCode == currentMenu.menuCode ? 'active' : '',]">
              <div :class="['iconfont', 'icon-' + item.icon]"></div>
              <div class="text">
                {{ item.name }}
              </div>
            </div>
          </template>
        </div>
        <div class="menu-sub-list">
          <div @click="jump(sub)" :class="['menu-item-sub', currentPath == sub.path ? 'active' : '']"
            v-for="sub in currentMenu.children">
            <span :class="['iconfont', 'icon-' + sub.icon]" v-if="sub.icon"></span>
            <span class="text">{{ sub.name }}</span>
          </div>
          <div class="tips" v-if="currentMenu && currentMenu.tips">{{ currentMenu.tips }}</div>
          <div class="space-info">
            <div>保存容量</div>
            <div class="percent">

            </div>
          </div>
        </div>
      </div>
      <div class="body-content">
        <router-view v-slot="{ Component }">
          <component ref="routerViewRef" :is="Component" @addFile="addFile">
          </component>
        </router-view>
      </div>
    </div>
    <UpdateAvatar ref="updateAvatarRef" @updateAvatar="reloadAvatar"></UpdateAvatar>
    <UpdatePassword ref="updatePasswordRef"></UpdatePassword>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import UpdateAvatar from "./UpdateAvatar.vue";
import UpdatePassword from "./UpdatePassword.vue";
import Uploader from "@/views/main/Uploader.vue";


const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();

const api = {
  logout: "/logout",

}

const showUploader = ref(false);
const uploaderRef = ref();
const addFile = (data) => {
  const { file, filePid } = data;

  showUploader.value = true;
  uploaderRef.value.addFile(file, filePid);
}

// upload callback
const routerViewRef = ref()
const uploadCallbackHandler = () => {
  nextTick(() => {
    routerViewRef.value.reload()
    // TODO update user space
  })
}

const timestamp = ref(0);

const userInfo = ref(proxy.VueCookies.get("userInfo"));

const menus = [
  {
    icon: "cloude",
    name: "ファイル",
    menuCode: "main",
    path: "/main/all",
    allShow: true,
    children: [
      {
        icon: "all",
        name: "全部",
        category: "all",
        path: "/main/all",
      },
      {
        icon: "video",
        name: "ビデオ",
        category: "video",
        path: "/main/video",
      },
      {
        icon: "music",
        name: "オーディオ",
        category: "music",
        path: "/main/music",
      },
      {
        icon: "image",
        name: "写真",
        category: "image",
        path: "/main/image",
      },
      {
        icon: "doc",
        name: "書類",
        category: "doc",
        path: "/main/doc",
      },
      {
        icon: "more",
        name: "その他",
        category: "others",
        path: "/main/others",
      },
    ],
  },
  {
    path: "/myshare",
    icon: "share",
    name: "共有",
    menuCode: "share",
    allShow: true,
    children: [
      {
        name: "共有記録",
        path: "/myshare",
      },
    ],
  },
  {
    path: "/recycle",
    icon: "del",
    name: "ごみ箱",
    menuCode: "recycle",
    tips: "ごみ箱には、10 日以内に削除されたファイルが保存されます",
    allShow: true,
    children: [
      {
        name: "削除されたファイル",
        path: "/recycle",
      },
    ],
  },
];

const currentMenu = ref({});
const currentPath = ref();

const jump = (data) => {
  if (!data.path || data.menuCode == currentMenu.value.menuCode) {
    return;
  }
  router.push(data.path);
}

const setMenu = (menuCode, path) => {
  const menu = menus.find(item => {
    return item.menuCode == menuCode;
  })
  currentMenu.value = menu;
  currentPath.value = path;
};

watch(() => route, (newVal, oldVal) => {
  if (newVal.meta.menuCode) {
    setMenu(newVal.meta.menuCode, newVal.path);
  }
}, { immediate: true, deep: true });

// change avatar
const updateAvatarRef = ref();
const updateAvatar = () => {
  updateAvatarRef.value.show(userInfo.value);
}

const reloadAvatar = () => {
  userInfo.value = proxy.VueCookies.get("userInfo");
  timestamp.value = new Date().getTime();
}

// update password
const updatePasswordRef = ref();
const updatePassword = () => {
  updatePasswordRef.value.show();
}

// log out
const logout = async () => {
  proxy.Confirm(`ログアウト?`, async () => {
    let result = await proxy.Request({
      url: api.logout,
    })
    if (!result) {
      return;
    }
    proxy.VueCookies.remove("userInfo");
    router.push("/login");
  });

}

</script>

<style lang="scss" scoped>
.header {
  box-shadow: 0 3px 10px 0 rgb(0 0 0 / 6%);
  height: 56px;
  padding-left: 24px;
  padding-right: 24px;
  position: relative;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .logo {
    display: flex;
    align-items: center;

    .icon-pan {
      font-size: 40px;
      color: #1296db;
    }

    .name {
      font-weight: bold;
      margin-left: 5px;
      font-size: 25px;
      color: #05a1f5;
    }
  }

  .right-panel {
    display: flex;
    align-items: center;

    .icon-transfer {
      cursor: pointer;
    }

    .user-info {
      margin-right: 10px;
      display: flex;
      align-items: center;
      cursor: pointer;

      .avatar {
        margin: 0px 5px 0px 15px;
      }

      .nick-name {
        color: #05a1f5;
      }
    }
  }
}

.body {
  display: flex;

  .left-sider {
    border-right: 1px solid #f1f2f4;
    display: flex;

    .menu-list {
      height: calc(100vh - 56px);
      width: 80px;
      box-shadow: 0 3px 10px 0 rgb(0 0 0 / 6%);
      border-right: 1px solid #f1f2f4;

      .menu-item {
        text-align: center;
        font-size: 14px;
        font-weight: bold;
        padding: 20px 0px;
        cursor: pointer;

        &:hover {
          background: #f3f3f3;
        }

        .iconfont {
          font-weight: normal;
          font-size: 28px;
        }
      }

      .active {
        .iconfont {
          color: #06a7ff;
        }

        .text {
          color: #06a7ff;
        }
      }
    }

    .menu-sub-list {
      width: 200px;
      padding: 20px 10px 0px;
      position: relative;

      .menu-item-sub {
        text-align: center;
        line-height: 40px;
        border-radius: 5px;
        cursor: pointer;

        &:hover {
          background: #f3f3f3;
        }

        .iconfont {
          font-size: 14px;
          margin-right: 20px;
        }

        .text {
          font-size: 13px;
        }
      }

      .active {
        background: #eef9fe;

        .iconfont {
          color: #05a1f5;
        }

        .text {
          color: #05a1f5;
        }
      }

      .tips {
        margin-top: 10px;
        color: #888888;
        font-size: 13px;
      }

      .space-info {
        position: absolute;
        bottom: 10px;
        width: 100%;
        padding: 0px 5px;

        .percent {
          padding-right: 10px;
        }

        .space-use {
          margin-top: 5px;
          color: #7e7e7e;
          display: flex;
          justify-content: space-around;

          .use {
            flex: 1;
          }

          .iconfont {
            cursor: pointer;
            margin-right: 20px;
            color: #05a1f5;
          }
        }
      }
    }
  }

  .body-content {
    flex: 1;
    width: 0;
    padding-left: 20px;
  }
}
</style>
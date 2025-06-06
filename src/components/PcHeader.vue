<script lang="ts" setup>
import { useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'

defineProps<{
  unreadNoticeNum: number
  unreadChatNum: number
}>()

const router = useRouter()
const sinfo = useTemplateRef('sinfo')
const { userInfo } = useUserStore()
function search() {
  const el = sinfo.value as HTMLInputElement
  if (!el || !el.value)
    return
  router.push(`/search?sinfo=${encodeURIComponent(el.value)}`)
  el.value = ''
}
</script>

<template>
  <div class="site-header">
    <div
      class="links"
    >
      <router-link to="/post">
        <div
          class="icon"
          style="
								background-image: url(https://img.icons8.com/?size=100&id=89802&format=png&color=000000);
								background-size: 90% 90%;
							"
        />
        发帖
      </router-link>
      <router-link to="/partitions">
        <div
          class="icon"
          style="
								background-image: url(https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1729566876258317319_icons8-top-wide-sidebar-followed-by-partition-at-bottom-24.png);
								background-size: 80% 80%;
								background-position: 0px 4px;
							"
        />
        分区
      </router-link>
      <router-link
        to="/course"
      >
        <div
          class="icon"
          style="
								background-image: url(https://img.icons8.com/?size=100&id=85872&format=png&color=000000);
								background-size: 95% 95%;
								background-position: 0px 3px;
							"
        />
        课程专区
      </router-link>
      <router-link to="/feedback">
        <div
          class="icon"
          style="
								background-image: url(https://img.icons8.com/?size=100&id=85500&format=png&color=000000);
								background-position: 0px 3px;
							"
        />
        反馈
      </router-link>
    </div>
    <form class="search" @submit.prevent="search">
      <input
        id="sinfo"
        ref="sinfo"
        name="sinfo"
        placeholder="搜索..."
      >
      <button type="submit">
        <div
          class="icon"
          style="
								background-image: url(https://img.icons8.com/?size=100&id=131&format=png&color=000000);
								background-size: 75% 75%;
								background-position: 0px 0px;
							"
        />
      </button>
    </form>
    <div
      class="account links"
    >
      <RouterLink
        to="/save"
      >
        <div
          class="icon"
          style="
								background-image: url(https://img.icons8.com/?size=100&id=85185&format=png&color=000000);
							"
        />
        收藏
      </RouterLink>
      <RouterLink
        to="/history"
      >
        <div
          class="icon"
          style="
								background-image: url(https://img.icons8.com/?size=100&id=83976&format=png&color=000000);
								background-size: 90% 90%;
							"
        />
        发帖历史
      </RouterLink>
      <router-link to="/notice">
        <div
          class="icon"
          style="
								background-image: url(https://img.icons8.com/?size=100&id=32058&format=png&color=000000);
							"
        />
        通知
        <div
          v-if="unreadNoticeNum"
          class="notice-num"
        >
          {{ unreadNoticeNum }}
        </div>
      </router-link>
      <router-link to="/chat">
        私信
        <div
          v-if="unreadChatNum"
          class="notice-num"
        >
          {{ unreadChatNum }}
        </div>
      </router-link>
      <router-link to="/options">
        {{ userInfo.name }}
      </router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.site-header {
  display: flex;
  background: #ffffffa0;
  backdrop-filter: blur(2px);
  height: 3em;
  color: #444;
  align-items: center;
  padding: 0 1em;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.2);
  transition: box-shadow 0.3s ease;
  margin-bottom: 0px;
  overflow: hidden;
  transition: height 0.3s ease;

  .links {
    a {
      position: relative;
      display: inline-block;
      padding: 0.25em 0.5em;
      border-radius: 4px;
      margin-right: 0.2em;
      text-decoration: none;
      transition: all 0.2s;
    }

    a:hover,
    .router-link-active {
      background: #444;
      color: #fff !important;
    }

    a:link,
    a:visited {
      color: #444;
    }

    .notice-num {
      position: absolute;
      top: -4px;
      right: -3px;
      border-radius: 9px;
      background: #ff5050;
      color: #eee;
      height: 1rem;
      text-align: center;
      line-height: 1;
      font-size: 13px;
      padding: 2px 4px;
    }
  }

  .search {
    flex: 1;
    margin: 0 1em;
    text-align: center;

    input {
      width: 100%;
      max-width: 48em;
      height: 2em;
      padding: 0 2em 0 0.75em;
      border: 1px solid #ccc;
      border-radius: 5px;
      line-height: 0.8;
      vertical-align: middle;
    }

    button {
      background: unset;
      height: 1em;
      width: 1em;
      padding: 0;
      margin: 0 0 0 -1.5em;
      vertical-align: middle;
    }
  }
}
.dark-mode .site-header {
  background: #000000a0;
  color: #ddd;

  .links {
    a:hover,
    .router-link-active {
      background: #66666680;
    }

    a:link,
    a:visited {
      color: #ddd;
    }

    .notice-num {
      background: #ff5050;
    }
  }

  .search {
    height: 30px;

    input {
      background: #88888880;
      border: 1px solid #ccc;
      color: #ccc;
    }

    input::placeholder {
      color: #aaa;
    }
    button {
      overflow: hidden;
    }
  }
}

.icon {
  width: 20px;
  height: 20px;
  background-size: cover;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: 0px 3px;
  display: inline-block;
}

body.dark-mode .icon {
  filter: invert(1);
}
</style>

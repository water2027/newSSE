<script lang="ts" setup>
import { computed, useTemplateRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const sinfo = useTemplateRef('sinfo')
function search() {
  const el = sinfo.value as HTMLInputElement
  if (!el || !el.value)
    return
  const currentRoute = router.currentRoute.value
  if (currentRoute.path === '/partition/课程交流'
    // 如果先搜索一次然后返回，再次搜索时path会被URI编码，参见PartitionListView的sendPartition函数
    || currentRoute.path === `/partition/${encodeURIComponent('课程交流')}`
    || currentRoute?.query?.partition === '课程交流'
    || currentRoute?.query?.partition === encodeURIComponent('课程交流')) {
    router.push(`/search?sinfo=${encodeURIComponent(el.value)}&partition=课程交流`)
  }
  else {
    router.push(`/search?sinfo=${encodeURIComponent(el.value)}`)
  }
  el.value = ''
}
const shopSidebarIsShow = computed(() => {
  return /^\/(?:myproducts|shop)/.test(route.fullPath)
})
</script>

<template>
  <div v-if="!shopSidebarIsShow" class="site-header">
    <RouterLink
      to="/course"
      class="lesson"
      style="
              background-image: url(https://img.icons8.com/?size=100&id=kmUrp7YjifpP&format=png&color=000000);
            "
    />
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
    <router-link
      to="/post"
      class="icon bright-icon post-button"
      style="
              width: 30px;
              height: 30px;
              background-position: 1px -1px;
              background-image: url(https://ssemarket.cn/new/webp/sendPostButton.webp)
            "
    />
  </div>
</template>

<style lang="scss" scoped>
.site-header {
  display: flex;
  background: #ffffffa0;
  backdrop-filter: blur(2px);
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

/* 课程专区（暂时） */
.lesson {
  width: 30px;
  height: 30px;
  background-size: cover;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: 0px 3px;
  display: inline-block;
}

body.dark-mode .lesson {
  filter: brightness(1.1) saturate(1.2) drop-shadow(0 0 6px rgba(150, 200, 255, 0.4))
    drop-shadow(0 0 10px rgba(150, 200, 255, 0.2));
}

.bright-icon {
  display: block;
  width: 100%;
  height: 30px;
  width: 30px;
  text-align: center;
  margin: 5px;
  background-size: 100%;
  background-repeat: no-repeat;
}
body.dark-mode .bright-icon {
  filter: invert(1) brightness(1.4) saturate(1.2) drop-shadow(0 0 6px rgba(150, 200, 255, 0.4))
    drop-shadow(0 0 10px rgba(150, 200, 255, 0.2));
}
.post-button {
  color: #444;
  font-weight: bold;
}
</style>

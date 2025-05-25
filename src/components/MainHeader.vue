<script setup>

</script>

<template>
  <header>
    <div class="site-top">
      <div class="top-left" />
      <div
        class="title"
        @click="
          $router.push('/');
          changeTo.main();
        "
      >
        SSE MARKET
      </div>
      <div class="top-right">
        <div
          class="mode-select"
          @click="changeMode"
        >
          <Icon
            v-if="mode === 'dark-mode'"
            icon="material-symbols:dark-mode"
          />
          <Icon
            v-else
            icon="material-symbols:light-mode"
          />
        </div>
      </div>
    </div>
    <div class="site-header">
      <div
        v-if="isPC"
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
          @click="changeTo.course()"
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
      <div
        v-if="!isPC && isHomePage"
        class="lesson"
        style="
						background-image: url(https://img.icons8.com/?size=100&id=kmUrp7YjifpP&format=png&color=000000);
					"
        @click="changeTo.course()"
      />
      <div class="search">
        <input
          ref="sinfo"
          placeholder="在 当前分区 搜索..."
          @keydown.enter="search"
        >
        <button @click="search">
          <div
            class="icon"
            style="
								background-image: url(https://img.icons8.com/?size=100&id=131&format=png&color=000000);
								background-size: 75% 75%;
								background-position: 0px 0px;
							"
          />
        </button>
        <!-- 改成图标 -->
      </div>
      <div
        v-if="isPC"
        class="account links"
      >
        <router-link
          to="/save"
          @click="changeTo.save()"
        >
          <div
            class="icon"
            style="
								background-image: url(https://img.icons8.com/?size=100&id=85185&format=png&color=000000);
							"
          />
          收藏
        </router-link>
        <router-link
          to="/history"
          @click="changeTo.history()"
        >
          <div
            class="icon"
            style="
								background-image: url(https://img.icons8.com/?size=100&id=83976&format=png&color=000000);
								background-size: 90% 90%;
							"
          />
          发帖历史
        </router-link>
        <router-link to="/notice">
          <div
            class="icon"
            style="
								background-image: url(https://img.icons8.com/?size=100&id=32058&format=png&color=000000);
							"
          />
          通知
          <div
            v-if="noticeNum"
            class="notice-num"
          >
            {{ noticeNum }}
          </div>
        </router-link>
        <router-link to="/chat">
          私信
          <div
            v-if="chatNum"
            class="notice-num"
          >
            {{ chatNum }}
          </div>
        </router-link>
        <router-link to="/options">
          {{ userInfo.name }}
        </router-link>
      </div>
      <router-link
        v-if="!isPC"
        to="/post"
        class="post-button icon bright-icon"
        style="
						width: 30px;
						height: 30px;
						background-position: 1px -1px;
					"
        :style="{
          backgroundImage: `url(${imgs.sendPostButtonIcon})`,
        }"
      />
    </div>
  </header>
</template>

<style scoped lang="scss">
header {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1999;
}

.site-header {
  display: flex;
  background: #ffffffa0;
  backdrop-filter: blur(2px);
  height: v-bind(headerHeight);
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
    input {
      background: #88888880;
      border: 1px solid #ccc;
      color: #ccc;
    }

    input::placeholder {
      color: #aaa;
    }

    button {
    }
  }
}

.search {
  height: 30px;
}

.search button {
  overflow: hidden;
}

.partitions {
  display: flex;
  width: 100%;
  margin-bottom: 20px;
  justify-content: space-between;
}

.partition {
  flex: 1 1 16%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8), rgba(240, 240, 240, 0.8));
  transition:
    box-shadow 0.3s ease,
    transform 0.3s ease;
  padding: 10px;
  cursor: pointer;
}

body.dark-mode .partition {
  background: linear-gradient(to bottom, rgba(40, 40, 40, 0.9), rgba(30, 30, 30, 0.9));
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  transition:
    background 0.3s ease,
    box-shadow 0.3s ease;
}

.partition:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
  background: linear-gradient(to bottom, rgba(255, 255, 200, 0.8), rgba(240, 240, 160, 0.8));
}

body.dark-mode .partition:hover {
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

body.dark-mode .bright-icon {
  filter: invert(1) brightness(1.4) saturate(1.2) drop-shadow(0 0 6px rgba(150, 200, 255, 0.4))
    drop-shadow(0 0 10px rgba(150, 200, 255, 0.2));
}

.partition:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.partition:last-child {
  margin-right: 0;
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

.partition-info {
  user-select: none;
  width: 100%;
  text-align: center;
  font-size: 10px;
  font-weight: 800;
}

@media screen and (max-width: 768px) {
  main {
    padding: 0;
  }

  .content {
    width: 100%;
    margin: 0;
    border: none;
  }

  .search {
    width: 90%;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    margin-top: 15%;
  }

  .search button {
    padding-top: 0;
    padding-bottom: 0;
    height: 150%;
    width: 25%;
  }

  .post-button {
    color: #444;
    font-weight: bold;
  }
}
</style>

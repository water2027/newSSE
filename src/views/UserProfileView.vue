<template>
  <div class="user-profile-wrapper" v-if="user">
    <div class="profile-card profile-header-wrapper">
      <div class="profile-header">
        <UserAvatar :src="user.avatarURL" />
        <div class="profile-header-info">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-bio">{{ user.intro }}</div>
        </div>
        <div @click="navigateChat" class="btn-chat" v-if="userInfo.userID != user.userID">
          <Icon icon="tabler:send" />
          私信
        </div>
      </div>
    </div>
    <div class="profile-main">
      <div class="main-left">
        <div class="profile-card profile-dynamic"></div>
      </div>
      <div class="main-right">
        <div class="profile-card profile-info"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import UserAvatar from '@/components/UserAvatar.vue';
import { Icon } from '@iconify/vue';
import { ref, inject, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getInfoById } from '@/api/info/getInfo';

const router = useRouter();

const user = ref();
const userInfo = inject('userInfo');

onBeforeMount(() => {
  const { id } = useRoute().params;
  getInfoById(Number(id))
    .then((res) => {
      if (!res.code) {
        user.value = res;
        user.value.title = getUserTitle(res.score);
      } else {
        console.log(`请求无效：${res.msg} (${res.code})`);
      }
    })
    .catch((error) => {
      if (error.response) {
        const res = error.response;
        console.log(`请求无效：${res.msg} (${res.code})`);
        // this.$bvToast.toast(`请求无效：${res.data.msg} (${res.data.code})`, {
        //   title: '内部错误',
        //   variant: 'danger',
        //   solid: true,
        // });
      } else {
        console.log('请求无效');
        // this.$bvToast.toast('请求无效：', {
        //   title: '内部错误',
        //   variant: 'danger',
        //   solid: true,
        // });
      }
    });
});

function navigateChat() {
  if (user.value.userID > 0) {
    router.push({ name: "Chat", query: { user: user.value.userID } });
    stopPropagation();
  }
}

function getUserTitle(userScore) {
  if (userScore < 100) {
    return '菜鸟';
  }
  if (userScore >= 100 && userScore < 300) {
    return '大虾';
  }
  if (userScore >= 300 && userScore < 600) {
    return '码农';
  }
  if (userScore >= 600 && userScore < 1000) {
    return '程序猿';
  }
  if (userScore >= 1000 && userScore < 2000) {
    return '工程师';
  }
  if (userScore >= 2000 && userScore < 3000) {
    return '大牛';
  }
  if (userScore >= 3000 && userScore < 4000) {
    return '专家';
  }
  if (userScore >= 4000 && userScore < 5000) {
    return '大神';
  }
  return '祖师爷';
}
</script>

<style lang="scss">
.user-profile-wrapper {
  width: 100%;
  padding: 0 1em;
}

.profile-header-wrapper {
  display: grid;
  width: 100%;
  height: 160px;
  align-items: end;
  padding: 1rem;

  .profile-header {
    display: flex;
    align-items: center;

    .user-avatar {
      width: 4.2rem;
      height: 4.2rem;

      .user-avatar-img {
        border: 2px solid #eee;
      }
    }

    .profile-header-info {
      margin-left: 1rem;
      display: grid;
      align-items: center;
      flex: 1;

      .user-name {
        font-size: 20px;
        font-weight: bold;
        line-height: 1.8;
      }

      .user-bio {
        font-size: 14px;
        color: #555;
      }
    }

    .btn-chat {
      color: #909eb4;
      padding: 0.3em 1em;
      border: 1px solid #909eb4;
      border-radius: 3px;
      cursor: pointer;
      align-self: flex-end;

      svg {
        vertical-align: middle;
        margin-right: 0.2em;
      }

      &:hover {
        color: #666f7e;
        border-color: #666f7e;
        background: #666f7e10;
      }
    }
  }
}

.profile-main {
  display: flex;
  flex-wrap: wrap-reverse;
  gap: 0 1em;

  .main-left {
    flex: 1;
  }

  .main-right {
    width: 25%;
  }
}

@media screen and (max-width: 768px) {
  .profile-main {

    .main-left,
    .main-right {
      width: 100%;
    }
  }
}

.profile-card {
  background: var(--chat-bg-main);
  border: 1px solid #ddd;
  margin: 0.5em 0;
  padding: 1em;
  border-radius: 5px;
}
</style>

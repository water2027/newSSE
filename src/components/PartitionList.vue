<script lang="ts" setup>
const partitions = [
  {
    name: '日常吐槽',
    src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1729865147020011731_icons8-chat-message-48.png',
  },
  {
    name: '打听求助',
    src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1729865259021372927_icons8-unverified-account-48.png',
  },
  {
    name: '学习交流',
    src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1729865462046077601_icons8-open-book-48.png',
  },
  {
    name: '院务',
    src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1729865305634358796_icons8-graduation-cap-48.png',
  },
  {
    name: '求职招募',
    src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1729865327380329691_icons8-commercial-48.png',
  },
  {
    name: '其他',
    src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1729865345159097327_icons8-link-48.png',
  },
]
</script>

<template>
  <div
    class="partitions"
  >
    <RouterLink
      v-for="(p, index) in partitions"
      :key="index"
      :to="`/partition/${p.name}`"
      class="partition block"
    >
      <div
        class="bright-icon"
        :style="{
          backgroundImage: `url(${p.src})`,
        }"
      />
      <div class="partition-info">
        {{ p.name }}
      </div>
    </RouterLink>
  </div>
</template>

<style lang="scss">
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

.partition:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.partition:last-child {
  margin-right: 0;
}

.partition-info {
  user-select: none;
  width: 100%;
  text-align: center;
  font-size: 10px;
  font-weight: 800;
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
</style>

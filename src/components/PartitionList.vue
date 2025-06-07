<script lang="ts" setup>
const partitions = [
  {
    name: '日常吐槽',
    src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1729865147020011731_icons8-chat-message-48.png',
  },
  {
    name: '优质贴',
    src: 'https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/resized/1749269586856504079_star.png',
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
    class="mb-5 w-full flex overflow-x-scroll overflow-y-hidden"
  >
    <RouterLink to="/partitions" class="partition w-1/5 flex flex-shrink-0 flex-col cursor-pointer items-center overflow-hidden p-2">
      <div class="bright-icon m-1 h-7.5 w-7.5 bg-contain bg-no-repeat" style="background-image: url(https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/resized/1749271506345913319_more.png);" />
      <div class="whitespace-nowrap text-center text-2.5 font-800">
        全部分区
      </div>
    </RouterLink>
    <RouterLink
      v-for="p in partitions"
      :key="p.name"
      :to="`/partition/${p.name}`"
      class="partition w-1/5 flex flex-shrink-0 flex-col items-center overflow-hidden p-2"
    >
      <div
        class="bright-icon m-1 h-7.5 w-7.5 bg-contain bg-no-repeat"
        :style="{
          backgroundImage: `url(${p.src})`,
        }"
      />
      <div class="whitespace-nowrap text-center text-2.5 font-800">
        {{ p.name }}
      </div>
    </RouterLink>
  </div>
</template>

<style lang="scss">
.partition {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8), rgba(240, 240, 240, 0.8));
  transition:
    box-shadow 0.3s ease,
    transform 0.3s ease;
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

body.dark-mode .bright-icon {
  filter: invert(1) brightness(1.4) saturate(1.2) drop-shadow(0 0 6px rgba(150, 200, 255, 0.4))
    drop-shadow(0 0 10px rgba(150, 200, 255, 0.2));
}
</style>

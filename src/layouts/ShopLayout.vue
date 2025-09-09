<script lang="ts" setup>
import type { Ref } from 'vue'
import { computed, defineAsyncComponent, inject } from 'vue'
import { useRoute } from 'vue-router'

const ShopSidebar = defineAsyncComponent(
  () => import('@/components/ShopSidebar.vue'),
)

const route = useRoute()

const shopSidebarIsShow = computed(() => {
  return /^\/(?:myproducts|shop)/.test(route.fullPath)
})

const isPC = inject('isPC') as Ref<boolean>
</script>

<template>
  <div class="w-full flex flex-row">
    <RouterView />
    <ShopSidebar v-if="isPC && shopSidebarIsShow" class="ml-10 w-fit" />
  </div>
</template>

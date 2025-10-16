<template>
  <div class="root card-root mx-a flex flex-col p-3">
    <slot />
  </div>
</template>

<style lang="scss">
.card-root {
  position: relative;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: var(--color-post-card-box-shadow) 0px 3px 8px;
  transition: all 0.5s;
}

p {
  text-indent: 2rem;
}
</style>

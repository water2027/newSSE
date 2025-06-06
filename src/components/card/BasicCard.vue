<template>
  <div class="card-root root min-h-37 w-full flex flex-col">
    <slot />
  </div>
</template>

<style lang="scss">
.card-root {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin: 10px 0;
  padding: 15px;
  box-shadow: var(--color-post-card-box-shadow) 0px 3px 8px;
  transition: all 0.5s;
}

@media screen and (min-width: 768px) {
  p {
    text-indent: 2rem;
  }
}
</style>

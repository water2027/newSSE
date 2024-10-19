<template>
	<div
		class="root"
		ref="root"
	>
		<div class="postDetail">
			<MarkdownContainer :markdown-content="markdown||'loading'" />
		</div>
	</div>
</template>

<script setup>
import markdown from '../docs/doc.md?raw';

import MarkdownContainer from '@/components/MarkdownContainer.vue';
</script>

<style scoped>
.root {
	display: flex;
	flex-direction: column;
	width: 100%;
	text-align: start;
	color: var(--color-text);
}

.postDetail {
	width: 100%;
	margin-left: 0;
	margin-right: auto;
	padding: 1%;
	border-radius: 5px;
	box-sizing: border-box;
}

</style>

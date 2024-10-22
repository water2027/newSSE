<!-- eslint-disable vue/html-indent -->
<template>
  <div class="root">
    <h1>反馈</h1>
    <p>请在下方输入您的反馈信息</p>
    <textarea ref="feedbackContent" class="feedback-textarea" placeholder="请在此输入反馈..."></textarea>
	  <button type="button" class="btn btn-primary"  @click="submitFeedback">提交</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { showMsg } from '@/components/MessageBox';
import { feedback } from '@/api/feedback/feedback';

const feedbackContent = ref(null);
const submitFeedback = async () => {
    //去除空格
    feedbackContent.value.value = feedbackContent.value.value.trim();
	if (feedbackContent.value.value) {
		const res = await feedback(feedbackContent.value.value, '');
		showMsg(res.msg);
	} else {
		showMsg('请输入反馈内容');
	}
};
</script>
<style scoped>
.root{
	color: var(--color-text);
}
.feedback-textarea {
	min-width: 300px;
	max-width: 700px;
	width: 40vw;
	display: block;
}
button {
	margin-top: 20px;
}
</style>
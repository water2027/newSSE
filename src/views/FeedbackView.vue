<!-- eslint-disable vue/html-indent -->
<template>
    <div class="root">
        <h1>反馈</h1>
        <p>请在下方输入您的反馈信息</p>
        <textarea ref="feedbackContent"></textarea>
        <button @click="submitFeedback">提交</button>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { showMsg } from '@/components/msgbox';
import { feedback } from '@/api/feedback';

const feedbackContent = ref(null)
const submitFeedback = async () => {
    if(feedbackContent.value.value) {
        const res = await feedback(feedbackContent.value.value,'')
        showMsg(res.msg)
    }else{
        showMsg('请输入反馈内容')
    }
}
</script>

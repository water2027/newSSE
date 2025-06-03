<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { feedback } from '@/api/feedback/feedback'
import { showMsg } from '@/components/MessageBox'

const feedbackContent = useTemplateRef<HTMLTextAreaElement>('feedbackContent')
async function submitFeedback() {
  const el = feedbackContent.value
  if (!el) return
  // 去除空格
  el.value = el.value.trim()
  if (el.value) {
    const res = await feedback(el.value, '')
    showMsg(res.msg)
  }
  else {
    showMsg('请输入反馈内容')
  }
}
</script>

<template>
  <div class="root">
    <h1>反馈</h1>
    <p>请在下方输入您的反馈信息</p>
    <textarea
      ref="feedbackContent"
      class="feedback-textarea"
      placeholder="请在此输入反馈..."
    />
    <button
      type="button"
      class="btn btn-primary"
      @click="submitFeedback"
    >
      提交
    </button>
  </div>
</template>

<style scoped>
.root {
  color: var(--color-text);
}

.feedback-textarea {
  min-width: 300px;
  max-width: 700px;
  width: 40vw;
  display: block;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc; /* 日间模式的边框颜色 */
  border-radius: 5px;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}
button {
  margin-top: 20px;
}
.btn-primary {
  display: inline-block;
  font-weight: 400;
  color: #fff;
  text-align: center;
  vertical-align: middle;
  user-select: none;
  background-color: #007bff;
  border: 1px solid #007bff;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  text-decoration: none;
  cursor: pointer;
}

.btn {
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  transition:
    color 0.15s ease-in-out,
    background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.btn-primary:hover {
  color: #fff;
  background-color: #0056b3;
  border-color: #004085;
}

/* 夜间模式 */
body.dark-mode .feedback-textarea {
  background-color: #2a2a2a;
  color: #f9f9f9;
  border: 1px solid #444;
}
body.dark-mode .feedback-textarea:focus {
  border-color: #00eeff;
  outline: none;
}
body.dark-mode button {
  filter: invert(1);
}
</style>

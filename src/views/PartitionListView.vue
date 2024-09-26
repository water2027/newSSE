<template>
    <div class="root">
        <h2>选择分区</h2>
        <div class="partitions">
            <div v-for="p, index in partitions" :key="index" class="partition" @click="sendPartition(p)">
                {{ p }}
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, defineEmits } from 'vue'
import { useRouter } from 'vue-router';
const router = useRouter()
const emit = defineEmits(['send-partition'])
const partitions = ref(['日常吐槽', '打听求助', '恋爱交友', '学习交流', '二手闲置', '求职招募', '其他'])
const sendPartition = (p) => {
    console.log(p)
    emit('send-partition', p)
    router.push('/')
}
</script>
<style scoped>
.root {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    position: relative;
}

.root h2 {
    font-size: 25px;
    position: absolute;
    top: 0;
    left: 0;
}

.partitions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 50px;
    width: 100%;

    max-width: 600px;
    padding: 10px;
    border: 1px solid #000;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;

}

.partition {
    padding: 10px;
    border: 1px solid #000;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;
}

.partition:hover {
    background-color: #000;
    color: #fff;
}
</style>
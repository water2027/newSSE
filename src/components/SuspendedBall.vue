<template>
  <div
    class="ball"
  >
    <div
      class="first"
      @click="OpenAndCloseBall"
    >
      {{ ballIsOpen ? 'X' : 'O' }}
    </div>
    <div
      ref="second"
      class="second"
      @click="changeMode"
    >
      {{ props.mode == 'light-mode' ? 'L' : 'D' }}
    </div>
    <div
      ref="third"
      class="third"
      @click="returnToTop"
    >
      &uarr;
    </div>
  </div>
</template>
<script setup>
import { inject, ref } from 'vue'

const props = defineProps({
    mode:{
        type: String,
		required: true,
    },
    changeMode:{
        type:Function,
        required:true,
    }
})

const second = ref(null);
const third = ref(null);

const ballIsOpen = ref(false);
const OpenAndCloseBall = () => {
	if (ballIsOpen.value) {
		ballIsOpen.value = false;
		second.value.animate(
			[{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }],
			{
				duration: 500,
				easing: 'ease-in-out',
				fill: 'forwards',
			}
		);
		third.value.animate(
			[
				{ transform: 'translateY(-100%)' },
				{ transform: 'translateY(0)' },
			],
			{
				duration: 500,
				easing: 'ease-in-out',
				fill: 'forwards',
			}
		);
	} else {
		ballIsOpen.value = true;
		second.value.animate(
			[{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }],
			{
				duration: 500,
				easing: 'ease-in-out',
				fill: 'forwards',
			}
		);
		third.value.animate(
			[
				{ transform: 'translateY(0)' },
				{ transform: 'translateY(-100%)' },
			],
			{
				duration: 500,
				easing: 'ease-in-out',
				fill: 'forwards',
			}
		);
	}
};

const returnToTop = () => {
	document.body.scrollTop = 0;
};


</script>
<style scoped>
.ball {
	position: fixed;
	bottom: 45px;
	left: 10px;
	width: 50px;
	height: 50px;
	border-radius: 50%;
	display: flex;
	flex-direction: column;
	background-color: var(--color-ball-bg);
	color: var(--color-ball-text);
	display: flex;
	justify-content: center;
	align-items: center;
	box-shadow: var(--color-ball-box-shadow) 0px 1px 4px;
	z-index: 4;
}

.ball > * {
	position: absolute;
	width: 100%;
	height: 100%;
	border-radius: 100%;
	background-color: var(--color-ball-bg);
	color: var(--color-ball-text);
	display: flex;
	justify-content: center;
	align-items: center;
	box-shadow: var(--color-ball-box-shadow) 0px 1px 4px;
}

.ball .first {
	z-index: 3;
}
</style>

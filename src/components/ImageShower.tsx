import { createApp, defineComponent } from 'vue';

// import '@/assets/ImageShower.css';

interface ImageShowerProps {
	img: string;
	close: () => void;
}

const imageShower = defineComponent({
	props: {
		img: {
			type: String,
			required: true,
		},
		close: {
			type: Function,
			required: true,
		},
	},
	setup(props: ImageShowerProps) {
		return () => (
			<div
				id='imgShower-root'
				class='w-full h-full overflow-auto absolute top-0 left-0 translate-y-20 z-10 flex flex-col backdrop-blur-md bg-[rgba(0,0,0,0.3)] justify-center items-center'
			>
				<img
					class='w-full h-full object-contain'
					src={props.img}
					alt='img'
				/>
				<button onClick={props.close}>X</button>
			</div>
		);
	},
});

function showImg(img: string) {
	const div = document.createElement('div');
	document.body.appendChild(div);
	const app = createApp(imageShower, {
		img,
		close: () => {
			app.unmount();
			document.body.removeChild(div);
			window.removeEventListener('popstate', handlePopState);
			history.back();
		},
	});
	app.mount(div);

	function handlePopState() {
		app.unmount();
		document.body.removeChild(div);
		window.removeEventListener('popstate', handlePopState);
	}

	window.addEventListener('popstate', handlePopState);
	history.pushState(null, '', window.location.href);
}

export { showImg };

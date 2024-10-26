import { createApp } from 'vue';

import '@/assets/ImageShower.css'

const imageShower = {
	props: {
		img: {
			type: String,
			required: true,
		},
        close: {
            type: Function,
            required: true,
        }
	},
	setup(props) {
		return () => (
			<div id='imgShower-root'>
				<img
					src={props.img}
					alt='img'
				/>
				<button onClick={props.close}>X</button>
			</div>
		);
	},
};

function showImg(img) {
	const div = document.createElement('div');
	document.body.appendChild(div);
	const app = createApp(imageShower, {
		img,
		close: () => {
			app.unmount(div);
			document.body.removeChild(div);
		},
	});
	app.mount(div);
}

export { showImg };

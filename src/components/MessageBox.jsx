import { createApp } from "vue";

import '@/assets/MessageBox.css'

const messageBox = {
    props: {
        msg: {
            type: String,
            required: true
        }
    },
    setup(props) {
        return () => (
            <div id="msgbox-root">
                <p>{props.msg}</p>
            </div>
        )
    }
}

function showMsg(msg) {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const app = createApp(messageBox,{
        msg
    })
    setTimeout(()=>{
        app.unmount(div)
        document.body.removeChild(div)
    },6000)
    app.mount(div)
}

export { showMsg };
/* eslint-disable vue/multi-word-component-names */
import { createApp, render } from "vue";

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
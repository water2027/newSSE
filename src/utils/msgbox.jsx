import { createApp, render } from "vue";

const msgBox = {
    props:{
        msg:{
            type:String,
            require:true
        }
    },
    render(ctx){
        const {$props} = ctx;
        return (
        <div id="msgbox-root">
            <p>{$props.msg}</p>
        </div>
        )
    }
}

function showMsg(msg) {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const app = createApp(msgBox,{
        msg
    })
    setTimeout(()=>{
        app.unmount(div)
        document.body.removeChild(div)
    },6000)
    app.mount(div)
}

export { showMsg };
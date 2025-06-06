import { createApp, defineComponent } from 'vue'

import '@/assets/MessageBox.css'

interface MessageBoxProps {
  msg: string
}

const MessageBox = defineComponent({
  props: {
    msg: {
      type: String,
      required: true,
    },
  },
  setup(props: MessageBoxProps) {
    return () => (
      <div id="msgbox-root">
        <p>{props.msg}</p>
      </div>
    )
  },
})

function showMsg(msg: string) {
  const div = document.createElement('div')
  document.body.appendChild(div)
  const app = createApp(MessageBox, {
    msg,
  })
  setTimeout(() => {
    app.unmount()
    document.body.removeChild(div)
  }, 6000)
  app.mount(div)
}

export { showMsg }

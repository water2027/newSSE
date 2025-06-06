import { createApp, defineComponent } from 'vue'

import '@/assets/ImageShower.css'

interface ImageShowerProps {
  img: string
  close: () => void
}

const ImageShower = defineComponent({
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
      <div id="imgShower-root">
        <img
          src={props.img}
          alt="img"
        />
        <button onClick={props.close}>X</button>
      </div>
    )
  },
})

function showImg(img: string) {
  const div = document.createElement('div')
  document.body.appendChild(div)
  const app = createApp(ImageShower, {
    img,
    close: () => {
      app.unmount()
      document.body.removeChild(div)
      window.removeEventListener('popstate', handlePopState)
      history.back()
    },
  })
  app.mount(div)

  function handlePopState() {
    app.unmount()
    document.body.removeChild(div)
    window.removeEventListener('popstate', handlePopState)
  }

  window.addEventListener('popstate', handlePopState)
  history.pushState(null, '', window.location.href)
}

export { showImg }

import { createApp, defineComponent, onMounted, onUnmounted, ref } from 'vue'

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
    const imageLoaded = ref(false)
    const imageDimensions = ref({ width: 0, height: 0 })
    const imageRef = ref<HTMLImageElement>()

    const getScrollbarWidth = () => {
      const scrollDiv = document.createElement('div')
      scrollDiv.style.cssText = 'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;'
      document.body.appendChild(scrollDiv)
      const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
      document.body.removeChild(scrollDiv)
      return scrollbarWidth
    }

    const disableScroll = () => {
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${getScrollbarWidth()}px`
    }

    const enableScroll = () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }

    const handleImageLoad = () => {
      if (imageRef.value) {
        const { naturalWidth, naturalHeight } = imageRef.value
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        const maxWidth = viewportWidth * 0.9
        const maxHeight = viewportHeight * 0.9

        const aspectRatio = naturalWidth / naturalHeight
        let displayWidth = naturalWidth
        let displayHeight = naturalHeight

        if (displayWidth > maxWidth) {
          displayWidth = maxWidth
          displayHeight = displayWidth / aspectRatio
        }

        if (displayHeight > maxHeight) {
          displayHeight = maxHeight
          displayWidth = displayHeight * aspectRatio
        }

        imageDimensions.value = { width: displayWidth, height: displayHeight }
        imageLoaded.value = true
      }
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        props.close()
      }
    }

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === event.currentTarget) {
        props.close()
      }
    }

    onMounted(() => {
      disableScroll()
      document.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(() => {
      enableScroll()
      document.removeEventListener('keydown', handleKeydown)
    })

    return () => (
      <div
        class="fixed inset-0 top-5% z-9999 flex items-center justify-center bg-black bg-opacity-80"
        onClick={handleBackdropClick}
      >
        <div class="relative max-h-90vh max-w-90vw flex items-center justify-center">
          <button
            class="absolute right-0 z-10000 h-40px w-40px flex cursor-pointer items-center justify-center rounded-full border-none bg-white bg-opacity-90 text-gray-800 transition-all duration-100 -top-50px hover:scale-110 hover:bg-opacity-100"
            onClick={props.close}
          >
            <svg class="h-8 w-8" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <div class="relative flex items-center justify-center">
            {!imageLoaded.value && (
              <div class="absolute h-200px w-200px flex items-center justify-center">
                <div class="h-10 w-10 animate-spin border-3 border-white border-t-white border-opacity-30 rounded-full"></div>
              </div>
            )}

            <img
              ref={imageRef}
              src={props.img}
              alt="preview"
              class={`max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${imageLoaded.value ? 'opacity-100' : 'opacity-0'}`}
              style={{
                width: imageDimensions.value.width ? `${imageDimensions.value.width}px` : 'auto',
                height: imageDimensions.value.height ? `${imageDimensions.value.height}px` : 'auto',
              }}
              onLoad={handleImageLoad}
              onError={() => imageLoaded.value = true}
            />
          </div>
        </div>
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
      if (window.history.length > 1) {
        history.back()
      }
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

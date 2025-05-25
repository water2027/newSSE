import { registerSW } from 'virtual:pwa-register'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import './assets/main.css'
import './assets/mode.css'

if ('serviceWorker' in navigator) {
  registerSW()
}

const app = createApp(App)
app.use(router)

app.mount('#app')

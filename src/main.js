import './assets/main.css'
import './assets/jsxComponents.css'
import './assets/global.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { registerSW } from 'virtual:pwa-register'

if ('serviceWorker' in navigator) {
  registerSW()
}

const app = createApp(App)
app.use(router)

app.mount('#app')

import './assets/main.css'
import './assets/msgbox.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { registerSW } from 'virtual:pwa-register'

if ('serviceWorker' in navigator) {
  registerSW()
}

const app = createApp(App)
console.log(App)
app.use(router)

app.mount('#app')

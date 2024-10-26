import './assets/main.css'
import './assets/jsxComponents.css'
import './assets/mode.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { registerSW } from 'virtual:pwa-register'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'
import BootstrapVue3 from 'bootstrap-vue-3'

if ('serviceWorker' in navigator) {
  registerSW()
}

const app = createApp(App)
app.use(router)
app.use(BootstrapVue3)

app.mount('#app')

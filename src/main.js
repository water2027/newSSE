import './assets/main.css'
import './assets/msgbox.css'
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

// router.isReady().then(() => {
//   console.log("start")
//   app.mount('#app');
//   console.log('Router is ready, app mounted');
// }).catch(error => {
//   console.error('Router failed to get ready:', error);
// });

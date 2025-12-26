import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { registerPermissionDirective } from './directives/permission'
import './style.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

// 注册权限指令
registerPermissionDirective(app)

app.use(pinia)
app.use(router)
app.mount('#app')

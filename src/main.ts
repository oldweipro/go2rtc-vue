import { createApp } from 'vue'
import router from './router'
import { useAuth } from './composables/useAuth'
import './style.css'
import App from './App.vue'

const { checkAuthStatus } = useAuth()
checkAuthStatus()

const app = createApp(App)
app.use(router)
app.mount('#app')

import { loadSession } from '@/stores/auth';
loadSession();
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css' // seu arquivo do Tailwind

createApp(App).use(router).mount('#app')

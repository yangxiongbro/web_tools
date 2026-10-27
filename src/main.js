import { createApp } from 'vue'
import {
  ElButton,
  ElInput,
  ElTooltip,
} from 'element-plus'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/input/style/css'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/radio-button/style/css'
import 'element-plus/es/components/radio-group/style/css'
import 'element-plus/es/components/tooltip/style/css'
import './styles/base.css'
import App from './App.vue'

const app = createApp(App)

;[ElButton, ElInput, ElTooltip].forEach((component) => {
  app.use(component)
})

app.mount('#app')

import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

const render = () => {
  new Vue({
    render: h => h(App)
  }).$mount('#app')
}

// 入口逻辑立即执行 new Vue 改为非微前端环境下 执行
if (!window.__MICRO_WEB__) {
  render()
}

export const beforeLoad = () => console.log('vue2demo 生命周期 beforeLoad')
export const mounted = () => {
  console.log('vue2demo 生命周期 mounted')
  render() // 微前端环境下 由生命周期执行 new Vue
}
export const destoryed = () => console.log('vue2demo 生命周期 destoryed')

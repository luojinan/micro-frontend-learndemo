import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

const render = () => {
  new Vue({
    render: h => h(App)
  }).$mount('#app')
}

render()

export const beforeLoad = () => console.log('vue2demo 生命周期 beforeLoad')
export const mounted = () => console.log('vue2demo 生命周期 mounted')
export const destoryed = () => console.log('vue2demo 生命周期 destoryed')

import { registerMicroApps, start } from '../../microCore/index';
import './style.css'

document.querySelector<HTMLDivElement>('#mainapp')!.innerHTML = `
  <div>
    <img src="/vite.svg" class="logo" alt="Vite logo" />
    <h1>Vite + TypeScript</h1>
    <ul>
      <li>/vue2demo#page1</li>
      <li>/vue2demo#page2</li>
      <li>/vue3demo#page1</li>
    </ul>
    <div id="yourContainer"></div>
  </div>
`
document.querySelectorAll('li')?.forEach(ele=>{
  ele.addEventListener('click',()=>{
    window.history.pushState(null,'', ele.innerText)
  })
})

registerMicroApps([
  {
    name: 'vue2demo', // 要和子应用 umd 全局变量同名
    entry: '//127.0.0.1:3002',
    container: '#yourContainer',
    activeRule: '/vue2demo'
  },
  {
    name: 'vue3 app',
    entry: '//localhost:7100',
    container: '#yourContainer',
    activeRule: '/vue3demo',
    beforeLoad: () => console.log('vue3demo 生命周期 beforeLoad'),
    mounted: () => console.log('vue3demo 生命周期 mounted'),
    destoryed: () => console.log('vue3demo 生命周期 destoryed')
  }
],{
  beforeLoad:[
    ()=>{
      console.log('主应用生命周期 开始加载')
      document.querySelector('#yourContainer')!.innerHTML = '子应用加载中'
    }
  ],
  mounted:[
    ()=>{
      console.log('主应用生命周期 渲染完成')
      // document.querySelector('#yourContainer')!.innerHTML = '子应用加载完成'
    }
  ],
  destoryed:[
    ()=>{
      console.log('主应用生命周期 销毁完成')
    }
  ]
});

start()
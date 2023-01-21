import { registerMicroApps, start } from '../../microCore/index';
import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <img src="/vite.svg" class="logo" alt="Vite logo" />
    <h1>Vite + TypeScript</h1>
    <ul>
      <li>/vue2demo#page1</li>
      <li>/vue2demo#page2</li>
      <li>/vue3demo#page1</li>
    </ul>
  </div>
`
document.querySelectorAll('li')?.forEach(ele=>{
  ele.addEventListener('click',()=>{
    window.history.pushState(null,'', ele.innerText)
  })
})

registerMicroApps([
  {
    name: 'vue2.7 app',
    entry: '//localhost:7100',
    container: '#yourContainer2',
    activeRule: '/vue2demo',
  },
  {
    name: 'vue3 app',
    entry: '//localhost:7100',
    container: '#yourContainer2',
    activeRule: '/vue3demo',
  }
],{
  beforeLoad:[
    ()=>{
      console.log('开始加载')
    }
  ],
  mounted:[
    ()=>{
      console.log('渲染完成')
    }
  ],
  destoryed:[
    ()=>{
      console.log('销毁完成')
    }
  ]
});

start()
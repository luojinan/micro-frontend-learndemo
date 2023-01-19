## 微前端demo
以 vite + 原生html/js 为宿主应用搭建微前端框架

以 webpack5 + vue2.7 为子应用

仿照qiankun的简易微前端框架
qiankun又是基于single-spa
所以本demo和`qiankun`、`single-spa`会很像

目前不支持子应用使用 vite 打包工具，因为是读取子应用 html 直接注入主应用容器的

而vite开发阶段dev用的是esm，并且dev拦截资源按需编译，主应用中本地不会启动子应用？


TODO: microCore 实现现在市面上多种微前端方案, 通过不同的入口文件暴露出来使用

- qiankun/single-spa 阿里
- micor-app 京东零售
- 无界
- iframe - 携程

## 注册子应用配置信息

[qiankun-在主应用中注册微应用](https://qiankun.umijs.org/zh/guide/getting-started#2-%E5%9C%A8%E4%B8%BB%E5%BA%94%E7%94%A8%E4%B8%AD%E6%B3%A8%E5%86%8C%E5%BE%AE%E5%BA%94%E7%94%A8)

```js
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'react app', // app name registered
    entry: '//localhost:7100',
    container: '#yourContainer',
    activeRule: '/yourActiveRule',
  },
  {
    name: 'vue app',
    entry: { scripts: ['//localhost:7100/main.js'] },
    container: '#yourContainer2',
    activeRule: '/yourActiveRule2',
  },
]);

start();
```

我们实现自己的 `registerMicroApps`

暂时可以看出是一个存储到 核心类库 中的一些配置项

如 `vite.config.ts` 中的 `defineConfig({})`

👇 `mainApp/src/main.ts`

```ts
import { registerMicroApps } from '../../microCore/index';
import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <img src="/vite.svg" class="logo" alt="Vite logo" />
    <h1>Vite + TypeScript</h1>
  </div>
`

registerMicroApps([
  {
    name: 'vue3 app',
    entry: '//localhost:7100',
    container: '#yourContainer2',
    activeRule: '/vue3demo',
  }
]);
```

👇 `microCore/index.ts`
```ts
// 微前端核心类库 提供给 mainAPP 使用
interface SubappInfo {
  name: string,
  entry: string,
  container: string,
  activeRule: string,
}

export function registerMicroApps(option :SubappInfo[]) {
  console.log('存储子应用注册信息', option)
}
```

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230118163805.png)

配置 `mainApp/tsconfig.json` 添加 `"../microCore"`
```json
"include": ["src", "../microCore"]
```

microCore 新增 `const/index.ts` 用于存储运行时的注册子应用信息

```ts
import type { SubappInfo } from '../type'

let subappList:SubappInfo[] = []
export const getAppList = () => subappList
export const setList = (appList:SubappInfo[]) => subappList = appList
```

👇 `microCore/index.ts`
```ts
// 微前端核心类库 提供给 mainAPP 使用
import { setAppList } from './const'
import type { SubappInfo } from './type'

export function registerMicroApps(option :SubappInfo[]) {
  setAppList(option) // <-- this
}
```

## 拦截路由

👇 `microCore/router/rewriteRouter.ts`
```ts
/**
 * 重写 history API
 */
export const rewriteRouter = () => {

  const originalPushState = window.history.pushState
  const originalReplaceState = window.history.replaceState

  window.history.pushState = function () {
    originalPushState.apply(this, arguments)
    console.log('history.pushState')
  }

  window.history.replaceState = function() {
    originalReplaceState.apply(this, arguments)
    console.log('history.replaceState')
  }

  window.onpopstate = function() {
    console.log('onpopstate')
  }
}
```

👇 `microCore/index.ts`
```ts
export function registerMicroApps(option :SubappInfo[]) {
  setAppList(option)
  rewriteRouter() // <-- this
}
```

控制台输入 `history.pushState(null, '', '/foo')` 触发了我们的拦截 `console`
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230118170503.png)

浏览器前进返回触发 打印 `'onpopstate'`

🤔 视频里利用 自定义事件监听器来触发 回调

```ts
export const rewriteRouter = () => {
  rewriteOriginFn(window.history.pushState, 'customerEventListenerPush') // 传入 未执行的原生方法 和 自定义事件名字符串
  rewriteOriginFn(window.history.replaceState, 'customerEventListenerReplace')

  window.addEventListener('customerEventListenerPush', openApp) // 创建 自定义事件
  window.addEventListener('customerEventListenerReplace', openApp)
}
```

```ts
function rewriteOriginFn(originFn, eventListenerName) {
  return function() {
    originFn.apply(this, argument) // 执行原生方法
    const e = new Event(eventListenerName) // 利用 new Event 把事件监听器名字符串 实例化为 事件
    window.dispatchEvent(e) // 通过 dispatchEvent 执行事件实例
  }
}
```

👆 `rewriteOriginFn` 封装重写原生方法的重复部分可以理解

🤔 但是第2个参数完全可以是一个回调函数, 为什么要用自定义事件监听器的方式调用回调？TODO: 

## 当前URL匹配子应用注册信息

通过 `location` 中的 `pathName` 来匹配注册信息中的子应用数据对象

在 `VueRouter` 原理中 我们利用 `Vue.util.reactive` 把当前Url数据转为响应式数据

通过 `watch` 来触发 回调 `render`

现在没有响应式数据, 则需要自己手动在所有 `URL` 改变的地方手动触发 `render`
- 页面 `init` 时, 如浏览器输入地址 `xxx/vue3demo/xx` 或 `刷新`
- 主/子应用, 通过 `pushState` 等方法跳转页面(各现代前端 `Router` 的原理底层 )

在 `qiankun` 这些步骤发生在 `start()`

👇 `microCore/utils/index.ts`
```ts
import { getAppList } from "../const"
import { SubappInfo } from "../type"

/**
 * 获取 URL 上的 pathname 作为 子应用name
 * @returns 
 */
export const getSubappNameByUrl = () => {
  return window.location.pathname
}

/**
 * 根据当前 URL 和 子应用注册列表 匹配出当前子应用信息
 */
export const getCurrentSubappInfo:()=>SubappInfo|null = () => {

  const appList = getAppList()
  const urlAppName = getSubappNameByUrl()

  const res = appList.find(item => item.activeRule === urlAppName)
  return res ?? null
}
```

👇 `microCore/index.ts`
```ts
export function start() {
  // 判断子应用注册是否为空
  const appList = getAppList()
  if(!appList.length) {
    throw '子应用列表为空, 请使用 registerMicroApps() 注册至少1个子应用'
  }

  // 获取当前 URL 匹配到的子应用信息
  const currentAppInfo = getCurrentSubappInfo()
  if(!currentAppInfo) return

  console.log('currentAppInfo',currentAppInfo)
}
```

编写主应用 Tab 功能

```ts
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <img src="/vite.svg" class="logo" alt="Vite logo" />
    <h1>Vite + TypeScript</h1>
    <ul>
      <li>/vue2#page1</li>
      <li>/vue2#page2</li>
    </ul>
  </div>
`
document.querySelectorAll('li')?.forEach(ele=>{
  ele.addEventListener('click',()=>{
    window.history.pushState(null,'', ele.innerText)
  })
})
```

在主应用编写 生命周期

microCore 的执行过程中调用传入进来的生命周期


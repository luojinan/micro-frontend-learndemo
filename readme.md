# 微前端demo
以 `vite + 原生html/js` 为宿主应用搭建微前端框架

以 [webpack5 + vue2.7](https://github.com/luojinan/webpack5-vue2.7-template) 为子应用

仿照 `qiankun` 的简易微前端框架
`qiankun` 又是基于 `single-spa`
所以本demo和`qiankun`、`single-spa`会很像

目前不支持子应用使用 `vite` 打包工具，因为是读取子应用 `html` 直接注入主应用容器的

而vite开发阶段dev用的是esm，并且dev拦截资源按需编译，主应用中本地不会启动子应用？


TODO: `microCore` 实现现在市面上多种微前端方案, 通过不同的入口文件暴露出来使用

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
    activeRule: '/vue2demo',
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

`microCore` 新增 `const/index.ts` 用于存储运行时的注册子应用信息

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
- 页面 `init` 时, 如浏览器输入地址 `xxx/vue2demo/xx` 或 `刷新`
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

## 编写主应用 Tab 功能

```ts
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <img src="/vite.svg" class="logo" alt="Vite logo" />
    <h1>Vite + TypeScript</h1>
    <ul>
      <li>/vue2demo#page1</li>
      <li>/vue2demo#page2</li>
    </ul>
  </div>
`
document.querySelectorAll('li')?.forEach(ele=>{
  ele.addEventListener('click',()=>{
    window.history.pushState(null,'', ele.innerText)
  })
})
```

## 加载子应用

前面只是拦截了路由没有写加载逻辑

👇 `microCore/load/loadSubApp.ts`
```ts
import { getCurrentSubappInfo } from "../utils"

export const loadApp = ()=>{
  // 获取当前 URL 匹配到的子应用信息
  const currentAppInfo = getCurrentSubappInfo()
  if(!currentAppInfo) return

  console.log('加载', currentAppInfo.activeRule)
}
```
👆 可以看出和 `start` 里逻辑重复, `start` 处理初始化和刷新逻辑

在路由监听逻辑里都调用这个函数

❕ 期望的效果是 子应用切换时才加载 同一个子应用不应该再次加载

所以应该判断 当前已加载的子应用 与 切换的子应用是否同一个，同一个时不触发 `load`

暂时用全局变量存 当前已加载的子应用

👇 `microCore/load/loadSubApp.ts`
```ts
/**
 * 加载 子应用
 * @returns 
 */
export const loadApp = ()=>{
  // 获取当前 URL 匹配到的子应用信息
  const currentAppInfo = getCurrentSubappInfo()
  if(!currentAppInfo) return

  if(window.__CURRENT_SUB_APP__ === currentAppInfo.activeRule) return

  console.log('加载', currentAppInfo.activeRule)

  window.__CURRENT_SUB_APP__ = currentAppInfo.activeRule // 定义 当前已加载的子应用 判断同一个子应用不触发load
}
```

ts定义 `Window` 全局变量 只要在 `tsconfig.json` 识别范围内，定义在哪都可以

👇 `microCore/type.ts`
```ts
declare global {
  interface Window {
    __CURRENT_SUB_APP__: string;
  }
}
```

此时还没有编写初次加载页面/刷新时加载的逻辑

一般来说和监听路由里的逻辑重复写

但是尝试一下 加载页面/刷新 时触发 `pushState` 从而触发路由监听试试 会不会因此多出一层路由

`/vue2demo push /vue2demo`

浏览器返回时 是否会导致2层

直接在控制台测试下来 `pushstate` 与当前 `location.href` 不会多出一层相同的历史

但是在实际编写的时候，在有路由历史的情况下 `刷新并触发pushstate当前url` 会丢失历史，相当于刷新后的路由变成了首个路由

TODO: 不 `pushstate` 的刷新可以正常返回， 不刷新的 `pushstate` 也可以返回, 但是刷新 + `pushstate` 就这样了？？？

这里暂时先 重复写监听路由里相同的逻辑

👇 `microCore/index.ts`
```ts
export function start() {
  // 判断子应用注册是否为空
  const appList = getAppList()
  if(!appList.length) {
    throw '子应用列表为空, 请使用 registerMicroApps() 注册至少1个子应用'
  }

  // 获取当前 URL 匹配到的子应用信息
  // const currentAppInfo = getCurrentSubappInfo()
  // if(!currentAppInfo) return

  // console.log('init currentAppInfo',location.pathname + location.hash)
  // history.pushState(null, '', location.href)
  // window.__CURRENT_SUB_APP__ = currentAppInfo.activeRule // 定义 当前已加载的子应用 判断同一个子应用不触发load
  loadApp()
}
```

## 主应用中定义通用生命周期

在主应用编写 生命周期

`microCore` 的执行过程中调用传入进来的生命周期

也就是会作用于加载所有子应用的过程x

👇 主应用入口文件注册子应用信息
```ts
registerMicroApps(subAppList,
  {
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
  }
)
```
生命周期的钩子逻辑是简单的发布订阅机制，把未执行的函数列表先存储起来，在执行到的某个时机去相应的调用这些函数

我们和存储子应用信息方式相同 创建 `microCore/const/mainLifeCycle.ts`

```ts
import type { LifeCycles } from '../type'

let mainLifeCycles:LifeCycles = {}
export const getMainlLifeCycles = () => mainLifeCycles
export const setMainlLifeCycles = (mainlLifeCycles:LifeCycles) => mainLifeCycles = mainlLifeCycles
```

👇 `microCore/type.ts`
```ts
export interface LifeCycles {
  beforeLoad?: Function[],
  mounted?: Function[],
  destoryed?: Function[],
}
```

编写调用逻辑

因为上面 首次加载/刷新 和 监听路由变化触发 的 `loadSubApp` 抽离到了一起

因此 `microCore/load/loadSubApp.ts`

```ts
export const loadApp = async ()=>{
  // 获取当前 URL 匹配到的子应用信息
  const currentAppInfo = getCurrentSubappInfo()
  if(!currentAppInfo) return

  if(window.__CURRENT_SUB_APP__ === currentAppInfo.activeRule) return

  console.log('加载', currentAppInfo.activeRule)

  // 1. 调 开始前 生命周期 // <-- this
  const {beforeLoad, mounted, destoryed} = getMainlLifeCycles()
  beforeLoad?.forEach(fn=>fn())

  // 2. 加载子应用(耗时) // <-- this
  await sleep()
  mounted?.forEach(fn=>fn())

  // 3. 调 完成 生命周期 // <-- this
  destoryed?.forEach(fn=>fn())

  window.__CURRENT_SUB_APP__ = currentAppInfo.activeRule // 定义 当前已加载的子应用 判断同一个子应用不触发load
}
```

生命周期效果如 👇
![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/microlife.gif)

### 生命周期loading实践

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230121152432.png)

表示左边的表达式不能判断是否有值再赋值, 即使有 `?.` 也不能确定 innerHTML 是否存在

换成 `!.` 就能排除掉前面是 `null` 和 `undefined`的情况 `document.querySelector('#yourContainer')!.innerHTML = '子应用加载中'`


## 子应用生命周期

子应用生命周期为注册信息对象中的属性

```ts
registerMicroApps([
  {
    name: 'vue2.7 app',
    entry: '//localhost:7100',
    container: '#yourContainer',
    activeRule: '/vue2demo',
    beforeLoad: () => console.log('vue2demo 生命周期 beforeLoad'), // <-- 子应用生命周期
    mounted: () => console.log('vue2demo 生命周期 mounted'),
    destoryed: () => console.log('vue2demo 生命周期 destoryed')
  }
], {
  beforeLoad: [], // <-- 主应用生命周期
  mounted: [],
  destoryed: [],
})
```
👆 主/子应用 生命周期触发时机相同 相当于主应用设置通用逻辑 子应用设置自定义逻辑

要获取前子应用和后子应用, 才能分别触发他们的生命周期

在匹配到目标路径是注册信息中的另一个子应用时
👇 修改当前子应用全局变量标识 的同时记录原子应用路径
```ts
window.__ORIGIN_SUB_APP__ = window.__CURRENT_SUB_APP__ // 修改 __CURRENT_SUB_APP__ 的值前 记录原值作为 preSubApp
window.__CURRENT_SUB_APP__ = currentAppInfo.activeRule // 定义 当前已加载的子应用 判断同一个子应用不触发load
```

👇 调用目录子应用的生命周期不需要判断
```ts
export const loadApp = async ()=>{
  // 获取当前 URL 匹配到的子应用信息
  const currentAppInfo = getCurrentSubappInfo()
  if(!currentAppInfo) return

  if(window.__CURRENT_SUB_APP__ === currentAppInfo.activeRule) return

  // 1. 调 开始前 生命周期
  const {beforeLoad, mounted, destoryed} = getMainlLifeCycles()
  beforeLoad?.forEach(fn=>fn())
  currentAppInfo?.beforeLoad?.() // <-- this

  // 2. 加载子应用(耗时) 调 完成 生命周期
  await sleep()
  mounted?.forEach(fn=>fn())
  currentAppInfo?.mounted?.() // <-- this

  window.__ORIGIN_SUB_APP__ = window.__CURRENT_SUB_APP__ // 修改 __CURRENT_SUB_APP__ 的值前 记录原值作为 preSubApp
  window.__CURRENT_SUB_APP__ = currentAppInfo.activeRule // 定义 当前已加载的子应用 判断同一个子应用不触发load
}
```

👇 调用销毁 则需要获取上一个子应用存在时, 并且时机是修改全局变量变量之后

```ts
export const loadApp = async ()=>{

  // ... 略
  window.__ORIGIN_SUB_APP__ = window.__CURRENT_SUB_APP__ // 修改 __CURRENT_SUB_APP__ 的值前 记录原值作为 preSubApp
  window.__CURRENT_SUB_APP__ = currentAppInfo.activeRule // 定义 当前已加载的子应用 判断同一个子应用不触发load

  // 3. 销毁上一个子应用调 销毁 生命周期 // <-- this
  const preSubApp = findSubAppInfo(window.__ORIGIN_SUB_APP__)
  if(preSubApp) {
    destoryed?.forEach(fn=>fn())
    preSubApp?.destoryed?.()
  }
}
```

## nodejs脚本批量启动前端项目

初始化[vue2.7 + webpack 子应用](https://github.com/luojinan/webpack5-vue2.7-template)

👇 `run.mjs`
```js
import { spawn } from 'node:child_process'
import { fileURLToPath, URL } from 'node:url'

const demoPath = {
  vue2: fileURLToPath(new URL('./subApp', import.meta.url)),
  main: fileURLToPath(new URL('./mainApp', import.meta.url))
}

Object.values(demoPath).forEach(path => {
  spawn(`cd ${path} && pnpm dev`, { stdio: 'overlapped', shell: true })
})
```

## fetch 子应用资源

👇 `microCore/loadResource.ts`
```ts
/**
 * fetch 请求静态资源返回文件内容
 * @param url 
 * @returns 
 */
export const fetchResource = (url:string) => {
  return fetch(url).then(res => res.text())
}
```

👇 跨域问题 

`subApp/build/webpack.dev.config.js`
```js
devServer: {
  allowedHosts: 'all', // 无效...
  headers: { 'Access-Control-Allow-Origin': '*' }, // allowedHosts 配置了也不能跨域访问本静态资源服务器 需要配置 headers
}
```


### 解析HTML内容


👇 把读取到的 `html` 文本内容通过 `innerHTML` 挂载到子应用配置信息的 `container` 节点上

```ts
const htmlContent = await fetchResource(currentAppInfo.entry) // 请求到 html 内容
mountSubApp(htmlRes, currentAppInfo)
```

```ts
const mountSubApp = (htmlContent:string, appInfo:SubappInfo) => {
  const subAppRootDom = document.querySelector(appInfo.container)
  subAppRootDom!.innerHTML = htmlContent
}
```

至此, `html` 虽然挂载上去了, 但是子应用内容是空的, 因为子应用是 `SPA` 应用, 需要加载到子应用 `JS` 才能渲染出内容

### 解析JS内容

```ts
/**
 * 解析 HTMl 文本内容 成 JS/CSS/HTML 数据
 */
export const pasrseHtml = (htmlContent:string) => {

  // 1. 创建一个div存放 fetch 到的html文本内容
  // 这么做是为了去掉html body 标签,  方便数据处理和递归
  const divDom = document.createElement('div')
  divDom.innerHTML = htmlContent
  parseScript(divDom) // 此时的 divDom 的内容是平级的 meta div script
  
  return htmlContent
}
```

递归结构

```ts
const parseScript = (root: HTMLDivElement) => {

  function deepParse (element) {
    const children = element.children // 类数组 不能用forEach
    for (const item of children) {
      deepParse(item)
    }
  }

  deepParse(root)
}
```

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230122102505.png)

👇 处理js
```ts
function deepParse (element:HTMLElement) {

  if(element.nodeName.toLowerCase() === 'script') {
    const src = element.getAttribute('src')
    if(!src) {
      // 非外部链接的js资源 内联逻辑
      script.push(element.outerHTML)
    } else {
      // 外部链接 绝对路径/相对路径
      if(src.startsWith('http')) {
        scriptUrl.push(src)
      }else{
        scriptUrl.push(`http:${entry}/${src}`)
      }
    }
  }

  const children = element.children // 类数组 不能用forEach
  for (const item of children) {
    deepParse(item)
  }
}
```

得到 `script` 请求的 绝对路径, 通过 `fetch` 请求得到 js文本内容

👇 通过 `eval` 执行 js文本内容
```ts
const [htmlRes, jsList] = await pasrseHtml(htmlContent, currentAppInfo.entry)
mountSubApp(htmlRes, currentAppInfo)
jsList.forEach(item => eval(item))
```

至此 子应用的 内容也渲染出来了

![](https://kingan-md-img.oss-cn-guangzhou.aliyuncs.com/blog/20230122111055.png)

## 调整子应用生命周期及模块化 41 42

为了允许 子应用 前端应用可以独立运行(不依靠主应用)

需要 子应用 的入口逻辑分为2种情况触发
1. 常规 SPA 加载 入口逻辑 立即触发渲染
2. 微前端环境 由主应用调用子应用中的生命周期(上面定义在子应用注册信息中)触发渲染

设置 微前端环境变量 告诉 前端项目 现在是作为子应用运行在微前端的主应用里

### 修改子应用入口逻辑

```js
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

// 抛出 子应用生命周期函数
export const beforeLoad = () => console.log('vue2demo 生命周期 beforeLoad')
export const mounted = () => {
  console.log('vue2demo 生命周期 mounted')
  render() // 微前端环境下 由生命周期执行 new Vue
}
export const destoryed = () => console.log('vue2demo 生命周期 destoryed')
```

### 修改子应用打包模块化方式

### 执行js文本获取抛出的变量


## 沙箱机制 43 44 45

## 通信 46 47 48 49

## store存储 50 51 52

## 性能优化 53 54

## npm发布并加自动化流程 55 - 61

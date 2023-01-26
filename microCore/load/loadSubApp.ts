import { getMainlLifeCycles } from "../const/mainLifeCycle"
import { proxySandbox } from "../sandbox/proxySandbox"
import { snapShotSandbox } from "../sandbox/snapShotbox"
import { SubappInfo } from "../type"
import { findSubAppInfo, getCurrentSubappInfo } from "../utils"
import { fetchApp } from "./cacheFetch"

/**
 * 加载 子应用
 * @returns 
 */
export const loadApp = async ()=>{
  // 获取当前 URL 匹配到的子应用信息
  const currentAppInfo = getCurrentSubappInfo()
  if(!currentAppInfo) return

  if(window.__CURRENT_SUB_APP__ === currentAppInfo.activeRule) return

  console.log('加载', currentAppInfo.activeRule)

  // 1. 调 开始前 生命周期
  const {beforeLoad, mounted, destoryed} = getMainlLifeCycles()
  beforeLoad?.forEach(fn=>fn())
  currentAppInfo?.beforeLoad?.()

  // 已经触发了 pushstate 相应的变量要修改 否则逻辑中断时 作为判断条件的以下变量会异常
  window.__ORIGIN_SUB_APP__ = window.__CURRENT_SUB_APP__ // 修改 __CURRENT_SUB_APP__ 的值前 记录原值作为 preSubApp
  window.__CURRENT_SUB_APP__ = currentAppInfo.activeRule // 定义 当前已加载的子应用 判断同一个子应用不触发load
  window.__MICRO_WEB__ = true // 执行子应用入口逻辑前 设置环境变量

  // const { active, inactive } = snapShotSandbox()
  const {active, inactive} = proxySandbox()
  currentAppInfo.sandbox = { active, inactive } // 存储到子应用信息中 用于通过上一个子应用来还原对应的(每个子应用的沙箱快照不同)沙箱快照
  const proxyWindow = active()

  // 3. 销毁上一个子应用调 销毁 生命周期
  const preSubApp = findSubAppInfo(window.__ORIGIN_SUB_APP__)
  if(preSubApp) {
    // 还原 window 为快照
    preSubApp?.sandbox?.inactive()

    destoryed?.forEach(fn=>fn())
    preSubApp?.destoryed?.()
  }

  // 2. 加载子应用(耗时) 调 完成 生命周期
  const [htmlRes, jsList] = await fetchApp(currentAppInfo)
  mountSubApp(htmlRes, currentAppInfo)

  // window.exports = {}
  // jsList.forEach(item => eval(item)) // 触发第二次 eval 全局模块变量会被置空?
  window.proxyWindow = proxyWindow
  jsList.forEach(item => {
    eval(`
      ((window)=>{
        ${item}
      })(window.proxyWindow)
    `)
  })
  // console.log(window.exports)
  window[currentAppInfo.name]?.mounted?.() // TODO: TS 怎么写变量属性 要求 [变量是数字]
  
  mounted?.forEach(fn=>fn())
  // currentAppInfo?.mounted?.()
}

const mountSubApp = (htmlContent:string, appInfo:SubappInfo) => {
  const subAppRootDom = document.querySelector(appInfo.container)
  subAppRootDom!.innerHTML = htmlContent
}
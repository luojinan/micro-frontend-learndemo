import { getMainlLifeCycles } from "../const/mainLifeCycle"
import { SubappInfo } from "../type"
import { findSubAppInfo, getCurrentSubappInfo } from "../utils"
import { fetchResource, pasrseHtml } from "./loadResource"

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

  // 2. 加载子应用(耗时) 调 完成 生命周期
  const htmlContent = await fetchResource(currentAppInfo.entry)
  const htmlRes = pasrseHtml(htmlContent)
  mountSubApp(htmlRes, currentAppInfo)
  
  mounted?.forEach(fn=>fn())
  currentAppInfo?.mounted?.()

  window.__ORIGIN_SUB_APP__ = window.__CURRENT_SUB_APP__ // 修改 __CURRENT_SUB_APP__ 的值前 记录原值作为 preSubApp
  window.__CURRENT_SUB_APP__ = currentAppInfo.activeRule // 定义 当前已加载的子应用 判断同一个子应用不触发load

  // 3. 销毁上一个子应用调 销毁 生命周期
  const preSubApp = findSubAppInfo(window.__ORIGIN_SUB_APP__)
  if(preSubApp) {
    destoryed?.forEach(fn=>fn())
    preSubApp?.destoryed?.()
  }
}

const mountSubApp = (htmlContent:string, appInfo:SubappInfo) => {
  const subAppRootDom = document.querySelector(appInfo.container)
  subAppRootDom!.innerHTML = htmlContent
}
import { getCurrentSubappInfo } from "../utils"

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
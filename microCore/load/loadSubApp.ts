import { getCurrentSubappInfo } from "../utils"

/**
 * 加载 子应用
 * @returns 
 */
export const loadApp = ()=>{
  // 获取当前 URL 匹配到的子应用信息
  const currentAppInfo = getCurrentSubappInfo()
  if(!currentAppInfo) return

  console.log('加载', currentAppInfo.activeRule)
}
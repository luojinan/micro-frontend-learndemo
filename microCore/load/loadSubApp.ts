import { getMainlLifeCycles } from "../const/mainLifeCycle"
import { getCurrentSubappInfo } from "../utils"

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

  // 2. 加载子应用(耗时)
  await sleep()
  mounted?.forEach(fn=>fn())

  // 3. 调 完成 生命周期
  destoryed?.forEach(fn=>fn())

  window.__CURRENT_SUB_APP__ = currentAppInfo.activeRule // 定义 当前已加载的子应用 判断同一个子应用不触发load
}

function sleep() {
  return new Promise( resolve => {
    setTimeout(()=>resolve('4000ms done'), 4000)
  })
}
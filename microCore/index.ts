// 微前端核心类库 提供给 mainAPP 使用
import { getAppList, setAppList } from './const'
import { rewriteRouter } from './router/rewriteRouter'
import type { SubappInfo } from './type'
import { getCurrentSubappInfo } from './utils'

export function registerMicroApps(option :SubappInfo[]) {
  setAppList(option)
  rewriteRouter()
}

export function start() {
  // 判断子应用注册是否为空
  const appList = getAppList()
  if(!appList.length) {
    throw '子应用列表为空, 请使用 registerMicroApps() 注册至少1个子应用'
  }

  // 获取当前 URL 匹配到的子应用信息
  const currentAppInfo = getCurrentSubappInfo()
  if(!currentAppInfo) return

  console.log('init currentAppInfo',currentAppInfo)

}
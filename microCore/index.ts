// 微前端核心类库 提供给 mainAPP 使用
import { setAppList } from './const'
import { rewriteRouter } from './router/rewriteRouter'
import type { SubappInfo } from './type'

export function registerMicroApps(option :SubappInfo[]) {
  setAppList(option)
  rewriteRouter()
}
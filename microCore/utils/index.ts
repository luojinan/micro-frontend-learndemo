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
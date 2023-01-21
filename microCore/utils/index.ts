import { getAppList } from "../const"
import { SubappInfo } from "../type"

/**
 * 获取 URL 上的 pathname 作为 子应用name
 * @returns 
 */
export const getUrlPathName = () => {
  return window.location.pathname
}

/**
 * 根据 子应用注册名 查找对应的 子应用注册信息
 * @param subName 子应用注册名
 * @returns 子应用注册信息
 */
export const findSubAppInfo = (subName:string|undefined) => {
  if(!subName) return null
  const appList = getAppList()

  const res = appList.find(item => item.activeRule === subName)
  return res ?? null
}

/**
 * 根据当前 URL 和 子应用注册列表 匹配出当前子应用信息
 */
export const getCurrentSubappInfo:()=>SubappInfo|null = () => {
  const urlAppName = getUrlPathName()

  return findSubAppInfo(urlAppName)
}
import { findSubAppInfo, getUrlPathName } from "../utils"
import { fetchApp } from "./cacheFetch"

export const preFetchApp = (appNameList:string[]) => {
  appNameList.forEach(appname => {
    const urlAppName = getUrlPathName()
    if(urlAppName === appname) return  // 当前pathname加载由 start 触发 return 避免重复加载

    const appinfo = findSubAppInfo(appname)
    if(appinfo) {
      fetchApp(appinfo)
    }
  })
}
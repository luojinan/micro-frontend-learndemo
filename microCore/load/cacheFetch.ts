import { SubappInfo } from "../type"
import { fetchResource, pasrseHtml } from "./loadResource"

const cache = {} // 以子应用name 来缓存html/JS 内容

export const fetchApp = async (appinfo:SubappInfo) => {
  // 添加缓存判断
  if(!cache[appinfo.name]) {
    const htmlContent = await fetchResource(appinfo.entry)
    const [htmlRes, jsList] = await pasrseHtml(htmlContent, appinfo.entry)
    cache[appinfo.name] = [htmlRes, jsList] // 添加缓存
  }

  return cache[appinfo.name]
}
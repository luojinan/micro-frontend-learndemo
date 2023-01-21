/**
 * fetch 请求静态资源返回文件内容
 * @param url 
 * @returns 
 */
export const fetchResource = (url:string) => {
  return fetch(url).then(res => res.text())
}

/**
 * 解析 HTMl 文本内容 成 JS/CSS/HTML 数据
 */
export const pasrseHtml = (htmlContent:string) => {
  return htmlContent
}
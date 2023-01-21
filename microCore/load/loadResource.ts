/**
 * fetch 请求静态资源返回文件内容
 * @param url 
 * @returns 
 */
export const fetchResource = (url:string) => {
  return fetch(url).then(res => res.text())
}
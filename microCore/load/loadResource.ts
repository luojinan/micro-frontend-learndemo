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
export const pasrseHtml = async (htmlContent:string, entry:string):Promise<[string,string[]]> => {

  // 1. 创建一个div存放 fetch 到的html文本内容 而不是直接挂到 target container 上
  // 这么做是为了去掉html body 标签,  方便数据处理和递归
  const divDom = document.createElement('div')
  divDom.innerHTML = htmlContent
  const [script,scriptUrl] = parseScript(divDom, entry)

  const scriptUrlResList = await Promise.all(scriptUrl.map(url => fetchResource(url) ))

  const allJsContentList = [...script, ...scriptUrlResList]
  
  return [htmlContent, allJsContentList]
}

const parseScript = (root: HTMLDivElement, entry:string) => {
  const scriptUrl:string[] = []
  const script:string[] = []

  function deepParse (element:HTMLElement) {

    if(element.nodeName.toLowerCase() === 'script') {
      const src = element.getAttribute('src')
      if(!src) {
        // 非外部链接的js资源 内联逻辑
        script.push(element.outerHTML)
      } else {
        // 外部链接 绝对路径/相对路径
        if(src.startsWith('http')) {
          scriptUrl.push(src)
        }else{
          scriptUrl.push(`http:${entry}/${src}`)
        }
      }
    }

    const children = element.children // 类数组 不能用forEach
    for (const item of children) {
      deepParse(item)
    }
  }

  // const dom = root.outerHTML
  deepParse(root)

  return [script, scriptUrl]
}
export const proxySandbox = () => {
  let proxyWindow = {} // 每个子应用都调用一次 active 即 proxyWindow 不会复用

  const active = () => {
    return new Proxy(window, {
      get(window, key){
        return proxyWindow[key] || window[key]
      },
      set(window, key, newVal){
        proxyWindow[key] = newVal
        return true
      }
    })
  }

  const inactive = () => {
    proxyWindow = {}
  }

  return {
    active, inactive
  }
}
export const snapShotSandbox = () => {
  const sandboxWindow = {}

  const getSandboxWindow = ()=>{
    return sandboxWindow
  }

  const active = () => {
    for (const key in window) {
      sandboxWindow[key] = window[key]
    }
    return getSandboxWindow()
  }

  const inactive = () => {
    for (const key in window) {
      const sandboxVal = sandboxWindow[key]
      if(window[key] !== sandboxVal) {
        try {
          window[key] = sandboxVal
        } catch (error) {
          console.log('还原快照window err', error)
        }
      }
    }
  }
  return {
    active, inactive
  }
}
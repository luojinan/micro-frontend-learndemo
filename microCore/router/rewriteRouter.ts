import { loadApp } from "../load/loadSubApp"

/**
 * 重写 history API
 */
export const rewriteRouter = () => {

  const originalPushState = window.history.pushState
  const originalReplaceState = window.history.replaceState

  window.history.pushState = function () {
    originalPushState.apply(this, arguments)
    console.log('history.pushState')
    loadApp()
  }

  window.history.replaceState = function() {
    originalReplaceState.apply(this, arguments)
    console.log('history.replaceState')
    loadApp()
  }

  window.onpopstate = function() {
    console.log('onpopstate')
    loadApp()
  }
}


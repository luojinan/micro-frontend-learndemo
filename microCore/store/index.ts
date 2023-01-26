import { Store } from "../type"


/**
 * 操作存储数据的功能 store
 * 并 提供 发布订阅 update 后自动触发
 */
export const createStore:()=>Store = () => {
  let store = {}
  const observers: Function[] = []

  const getStore = () => store

  const setStore = (newVal:{}) => {
    // newVal 不等于 原数据 才触发发布订阅
    if(newVal !== store) {
      const oldVal = store // 暂存后 赋新值
      store = newVal
      observers.forEach(fn => fn(newVal, oldVal))
    }
  }

  const addSubscribe = (fn: Function) => {
    observers.push(fn)
  }

  return {
    getStore, setStore, addSubscribe
  }
}
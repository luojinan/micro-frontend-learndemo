import type { SubappInfo } from '../type'

let subappList:SubappInfo[] = []
export const getAppList = () => subappList
export const setAppList = (appList:SubappInfo[]) => subappList = appList
import type { LifeCycles } from '../type'

let mainLifeCycles:LifeCycles = {}
export const getMainlLifeCycles = () => mainLifeCycles
export const setMainlLifeCycles = (mainlLifeCycles:LifeCycles) => mainLifeCycles = mainlLifeCycles
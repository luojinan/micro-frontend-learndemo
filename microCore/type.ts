
export interface SubappInfo {
  name: string,
  entry: string,
  container: string,
  activeRule: string,
}

export interface LifeCycles {
  beforeLoad?: Function[],
  mounted?: Function[],
  destoryed?: Function[],
}


declare global {
  interface Window {
    __CURRENT_SUB_APP__: string;
  }
}

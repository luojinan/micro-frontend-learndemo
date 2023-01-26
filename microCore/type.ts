
export interface SubappInfo {
  name: string,
  entry: string,
  container: string,
  activeRule: string,
  beforeLoad?: Function,
  mounted?: Function,
  destoryed?: Function,
  sandbox?: {active:Function, inactive:Function },
}

export interface LifeCycles {
  beforeLoad?: Function[],
  mounted?: Function[],
  destoryed?: Function[],
}

export interface Store {
  getStore:Function,
  setStore:({})=>void,
  addSubscribe:(arg0: Function) => void
}

declare global {
  interface Window {
    __CURRENT_SUB_APP__: string;
    __ORIGIN_SUB_APP__: string;
    __MICRO_WEB__: boolean;
    exports: {};
    vue2demo: {
      beforeLoad?: Function;
      mounted?: Function;
      destoryed?: Function;
    },
    proxyWindow: {},
    store: Store
  }
}

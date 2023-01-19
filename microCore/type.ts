
export interface SubappInfo {
  name: string,
  entry: string,
  container: string,
  activeRule: string,
}


declare global {
  interface Window {
    __CURRENT_SUB_APP__: string;
  }
}

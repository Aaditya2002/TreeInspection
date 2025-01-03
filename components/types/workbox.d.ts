interface WorkboxWindow extends Window {
    workbox?: {
      addEventListener: (event: string, callback: (event?: any) => void) => void
      register: () => void
      messageSkipWaiting: () => void
    }
  }
  
  declare const window: WorkboxWindow
  
  
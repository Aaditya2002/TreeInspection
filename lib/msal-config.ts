import { Configuration, PopupRequest } from "@azure/msal-browser"

export const msalConfig: Configuration = {
  auth: {
    clientId: "3f3fab13-4f7d-4494-9edf-24f32e1325b5",
    authority: "https://login.microsoftonline.com/73136b73-224c-40dc-8a8d-03e6ab8917d8",
    redirectUri: typeof window !== 'undefined' ? window.location.origin : "https://treeinspection.vercel.app/",
    navigateToLoginRequestUrl: true
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  },
  system: {
    allowNativeBroker: false,
    windowHashTimeout: 60000,
    iframeHashTimeout: 6000,
    loadFrameTimeout: 0,
  }
}

export const loginRequest: PopupRequest = {
  scopes: ["openid", "profile", "User.Read"]
}


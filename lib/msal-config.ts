import { Configuration, RedirectRequest } from "@azure/msal-browser"

export const msalConfig: Configuration = {
  auth: {
    clientId: "3f3fab13-4f7d-4494-9edf-24f32e1325b5",
    authority: "https://login.microsoftonline.com/73136b73-224c-40dc-8a8d-03e6ab8917d8",
    redirectUri: "https://treeinspection.vercel.app/",
  },
  cache: {
    cacheLocation: "localStorage", // This setting is more suitable for SPAs
    storeAuthStateInCookie: false // Set this to true if you have issues with IE11 or Edge
  }
}

export const loginRequest: RedirectRequest = {
  scopes: ["openid", "profile", "User.Read"]
}


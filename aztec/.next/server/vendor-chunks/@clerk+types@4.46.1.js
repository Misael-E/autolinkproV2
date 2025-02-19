"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@clerk+types@4.46.1";
exports.ids = ["vendor-chunks/@clerk+types@4.46.1"];
exports.modules = {

/***/ "(ssr)/./node_modules/.pnpm/@clerk+types@4.46.1/node_modules/@clerk/types/dist/esm/index.js":
/*!********************************************************************************************!*\
  !*** ./node_modules/.pnpm/@clerk+types@4.46.1/node_modules/@clerk/types/dist/esm/index.js ***!
  \********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   OAUTH_PROVIDERS: () => (/* binding */ OAUTH_PROVIDERS),\n/* harmony export */   SAML_IDPS: () => (/* binding */ SAML_IDPS),\n/* harmony export */   WEB3_PROVIDERS: () => (/* binding */ WEB3_PROVIDERS),\n/* harmony export */   getOAuthProviderData: () => (/* binding */ getOAuthProviderData),\n/* harmony export */   getWeb3ProviderData: () => (/* binding */ getWeb3ProviderData),\n/* harmony export */   sortedOAuthProviders: () => (/* binding */ sortedOAuthProviders)\n/* harmony export */ });\n// src/oauth.ts\nvar OAUTH_PROVIDERS = [\n  {\n    provider: \"google\",\n    strategy: \"oauth_google\",\n    name: \"Google\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/google\"\n  },\n  {\n    provider: \"discord\",\n    strategy: \"oauth_discord\",\n    name: \"Discord\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/discord\"\n  },\n  {\n    provider: \"facebook\",\n    strategy: \"oauth_facebook\",\n    name: \"Facebook\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/facebook\"\n  },\n  {\n    provider: \"twitch\",\n    strategy: \"oauth_twitch\",\n    name: \"Twitch\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/twitch\"\n  },\n  {\n    provider: \"twitter\",\n    strategy: \"oauth_twitter\",\n    name: \"Twitter\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/twitter\"\n  },\n  {\n    provider: \"microsoft\",\n    strategy: \"oauth_microsoft\",\n    name: \"Microsoft\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/microsoft\"\n  },\n  {\n    provider: \"tiktok\",\n    strategy: \"oauth_tiktok\",\n    name: \"TikTok\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/tiktok\"\n  },\n  {\n    provider: \"linkedin\",\n    strategy: \"oauth_linkedin\",\n    name: \"LinkedIn\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/linkedin\"\n  },\n  {\n    provider: \"linkedin_oidc\",\n    strategy: \"oauth_linkedin_oidc\",\n    name: \"LinkedIn\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/linkedin-oidc\"\n  },\n  {\n    provider: \"github\",\n    strategy: \"oauth_github\",\n    name: \"GitHub\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/github\"\n  },\n  {\n    provider: \"gitlab\",\n    strategy: \"oauth_gitlab\",\n    name: \"GitLab\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/gitlab\"\n  },\n  {\n    provider: \"dropbox\",\n    strategy: \"oauth_dropbox\",\n    name: \"Dropbox\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/dropbox\"\n  },\n  {\n    provider: \"atlassian\",\n    strategy: \"oauth_atlassian\",\n    name: \"Atlassian\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/atlassian\"\n  },\n  {\n    provider: \"bitbucket\",\n    strategy: \"oauth_bitbucket\",\n    name: \"Bitbucket\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/bitbucket\"\n  },\n  {\n    provider: \"hubspot\",\n    strategy: \"oauth_hubspot\",\n    name: \"HubSpot\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/hubspot\"\n  },\n  {\n    provider: \"notion\",\n    strategy: \"oauth_notion\",\n    name: \"Notion\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/notion\"\n  },\n  {\n    provider: \"apple\",\n    strategy: \"oauth_apple\",\n    name: \"Apple\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/apple\"\n  },\n  {\n    provider: \"line\",\n    strategy: \"oauth_line\",\n    name: \"LINE\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/line\"\n  },\n  {\n    provider: \"instagram\",\n    strategy: \"oauth_instagram\",\n    name: \"Instagram\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/instagram\"\n  },\n  {\n    provider: \"coinbase\",\n    strategy: \"oauth_coinbase\",\n    name: \"Coinbase\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/coinbase\"\n  },\n  {\n    provider: \"spotify\",\n    strategy: \"oauth_spotify\",\n    name: \"Spotify\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/spotify\"\n  },\n  {\n    provider: \"xero\",\n    strategy: \"oauth_xero\",\n    name: \"Xero\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/xero\"\n  },\n  {\n    provider: \"box\",\n    strategy: \"oauth_box\",\n    name: \"Box\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/box\"\n  },\n  {\n    provider: \"slack\",\n    strategy: \"oauth_slack\",\n    name: \"Slack\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/slack\"\n  },\n  {\n    provider: \"linear\",\n    strategy: \"oauth_linear\",\n    name: \"Linear\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/linear\"\n  },\n  {\n    provider: \"x\",\n    strategy: \"oauth_x\",\n    name: \"X / Twitter\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/x-twitter-v2\"\n  },\n  {\n    provider: \"enstall\",\n    strategy: \"oauth_enstall\",\n    name: \"Enstall\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/enstall\"\n  },\n  {\n    provider: \"huggingface\",\n    strategy: \"oauth_huggingface\",\n    name: \"Hugging Face\",\n    docsUrl: \"https://clerk.com/docs/authentication/social-connections/huggingface\"\n  }\n];\nfunction getOAuthProviderData({\n  provider,\n  strategy\n}) {\n  if (provider) {\n    return OAUTH_PROVIDERS.find((oauth_provider) => oauth_provider.provider == provider);\n  }\n  return OAUTH_PROVIDERS.find((oauth_provider) => oauth_provider.strategy == strategy);\n}\nfunction sortedOAuthProviders(sortingArray) {\n  return OAUTH_PROVIDERS.slice().sort((a, b) => {\n    let aPos = sortingArray.indexOf(a.strategy);\n    if (aPos == -1) {\n      aPos = Number.MAX_SAFE_INTEGER;\n    }\n    let bPos = sortingArray.indexOf(b.strategy);\n    if (bPos == -1) {\n      bPos = Number.MAX_SAFE_INTEGER;\n    }\n    return aPos - bPos;\n  });\n}\n\n// src/saml.ts\nvar SAML_IDPS = {\n  saml_okta: {\n    name: \"Okta Workforce\",\n    logo: \"okta\"\n  },\n  saml_google: {\n    name: \"Google Workspace\",\n    logo: \"google\"\n  },\n  saml_microsoft: {\n    name: \"Microsoft Entra ID (Formerly AD)\",\n    logo: \"azure\"\n  },\n  saml_custom: {\n    name: \"SAML\",\n    logo: \"saml\"\n  }\n};\n\n// src/web3.ts\nvar WEB3_PROVIDERS = [\n  {\n    provider: \"metamask\",\n    strategy: \"web3_metamask_signature\",\n    name: \"MetaMask\"\n  },\n  {\n    provider: \"coinbase_wallet\",\n    strategy: \"web3_coinbase_wallet_signature\",\n    name: \"Coinbase Wallet\"\n  },\n  {\n    provider: \"okx_wallet\",\n    strategy: \"web3_okx_wallet_signature\",\n    name: \"OKX Wallet\"\n  }\n];\nfunction getWeb3ProviderData({\n  provider,\n  strategy\n}) {\n  if (provider) {\n    return WEB3_PROVIDERS.find((p) => p.provider == provider);\n  }\n  return WEB3_PROVIDERS.find((p) => p.strategy == strategy);\n}\n\n//# sourceMappingURL=index.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvLnBucG0vQGNsZXJrK3R5cGVzQDQuNDYuMS9ub2RlX21vZHVsZXMvQGNsZXJrL3R5cGVzL2Rpc3QvZXNtL2luZGV4LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFRRTtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYXV0b2xpbmtwcm8tYXp0ZWMvLi9ub2RlX21vZHVsZXMvLnBucG0vQGNsZXJrK3R5cGVzQDQuNDYuMS9ub2RlX21vZHVsZXMvQGNsZXJrL3R5cGVzL2Rpc3QvZXNtL2luZGV4LmpzPzhiNzgiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gc3JjL29hdXRoLnRzXG52YXIgT0FVVEhfUFJPVklERVJTID0gW1xuICB7XG4gICAgcHJvdmlkZXI6IFwiZ29vZ2xlXCIsXG4gICAgc3RyYXRlZ3k6IFwib2F1dGhfZ29vZ2xlXCIsXG4gICAgbmFtZTogXCJHb29nbGVcIixcbiAgICBkb2NzVXJsOiBcImh0dHBzOi8vY2xlcmsuY29tL2RvY3MvYXV0aGVudGljYXRpb24vc29jaWFsLWNvbm5lY3Rpb25zL2dvb2dsZVwiXG4gIH0sXG4gIHtcbiAgICBwcm92aWRlcjogXCJkaXNjb3JkXCIsXG4gICAgc3RyYXRlZ3k6IFwib2F1dGhfZGlzY29yZFwiLFxuICAgIG5hbWU6IFwiRGlzY29yZFwiLFxuICAgIGRvY3NVcmw6IFwiaHR0cHM6Ly9jbGVyay5jb20vZG9jcy9hdXRoZW50aWNhdGlvbi9zb2NpYWwtY29ubmVjdGlvbnMvZGlzY29yZFwiXG4gIH0sXG4gIHtcbiAgICBwcm92aWRlcjogXCJmYWNlYm9va1wiLFxuICAgIHN0cmF0ZWd5OiBcIm9hdXRoX2ZhY2Vib29rXCIsXG4gICAgbmFtZTogXCJGYWNlYm9va1wiLFxuICAgIGRvY3NVcmw6IFwiaHR0cHM6Ly9jbGVyay5jb20vZG9jcy9hdXRoZW50aWNhdGlvbi9zb2NpYWwtY29ubmVjdGlvbnMvZmFjZWJvb2tcIlxuICB9LFxuICB7XG4gICAgcHJvdmlkZXI6IFwidHdpdGNoXCIsXG4gICAgc3RyYXRlZ3k6IFwib2F1dGhfdHdpdGNoXCIsXG4gICAgbmFtZTogXCJUd2l0Y2hcIixcbiAgICBkb2NzVXJsOiBcImh0dHBzOi8vY2xlcmsuY29tL2RvY3MvYXV0aGVudGljYXRpb24vc29jaWFsLWNvbm5lY3Rpb25zL3R3aXRjaFwiXG4gIH0sXG4gIHtcbiAgICBwcm92aWRlcjogXCJ0d2l0dGVyXCIsXG4gICAgc3RyYXRlZ3k6IFwib2F1dGhfdHdpdHRlclwiLFxuICAgIG5hbWU6IFwiVHdpdHRlclwiLFxuICAgIGRvY3NVcmw6IFwiaHR0cHM6Ly9jbGVyay5jb20vZG9jcy9hdXRoZW50aWNhdGlvbi9zb2NpYWwtY29ubmVjdGlvbnMvdHdpdHRlclwiXG4gIH0sXG4gIHtcbiAgICBwcm92aWRlcjogXCJtaWNyb3NvZnRcIixcbiAgICBzdHJhdGVneTogXCJvYXV0aF9taWNyb3NvZnRcIixcbiAgICBuYW1lOiBcIk1pY3Jvc29mdFwiLFxuICAgIGRvY3NVcmw6IFwiaHR0cHM6Ly9jbGVyay5jb20vZG9jcy9hdXRoZW50aWNhdGlvbi9zb2NpYWwtY29ubmVjdGlvbnMvbWljcm9zb2Z0XCJcbiAgfSxcbiAge1xuICAgIHByb3ZpZGVyOiBcInRpa3Rva1wiLFxuICAgIHN0cmF0ZWd5OiBcIm9hdXRoX3Rpa3Rva1wiLFxuICAgIG5hbWU6IFwiVGlrVG9rXCIsXG4gICAgZG9jc1VybDogXCJodHRwczovL2NsZXJrLmNvbS9kb2NzL2F1dGhlbnRpY2F0aW9uL3NvY2lhbC1jb25uZWN0aW9ucy90aWt0b2tcIlxuICB9LFxuICB7XG4gICAgcHJvdmlkZXI6IFwibGlua2VkaW5cIixcbiAgICBzdHJhdGVneTogXCJvYXV0aF9saW5rZWRpblwiLFxuICAgIG5hbWU6IFwiTGlua2VkSW5cIixcbiAgICBkb2NzVXJsOiBcImh0dHBzOi8vY2xlcmsuY29tL2RvY3MvYXV0aGVudGljYXRpb24vc29jaWFsLWNvbm5lY3Rpb25zL2xpbmtlZGluXCJcbiAgfSxcbiAge1xuICAgIHByb3ZpZGVyOiBcImxpbmtlZGluX29pZGNcIixcbiAgICBzdHJhdGVneTogXCJvYXV0aF9saW5rZWRpbl9vaWRjXCIsXG4gICAgbmFtZTogXCJMaW5rZWRJblwiLFxuICAgIGRvY3NVcmw6IFwiaHR0cHM6Ly9jbGVyay5jb20vZG9jcy9hdXRoZW50aWNhdGlvbi9zb2NpYWwtY29ubmVjdGlvbnMvbGlua2VkaW4tb2lkY1wiXG4gIH0sXG4gIHtcbiAgICBwcm92aWRlcjogXCJnaXRodWJcIixcbiAgICBzdHJhdGVneTogXCJvYXV0aF9naXRodWJcIixcbiAgICBuYW1lOiBcIkdpdEh1YlwiLFxuICAgIGRvY3NVcmw6IFwiaHR0cHM6Ly9jbGVyay5jb20vZG9jcy9hdXRoZW50aWNhdGlvbi9zb2NpYWwtY29ubmVjdGlvbnMvZ2l0aHViXCJcbiAgfSxcbiAge1xuICAgIHByb3ZpZGVyOiBcImdpdGxhYlwiLFxuICAgIHN0cmF0ZWd5OiBcIm9hdXRoX2dpdGxhYlwiLFxuICAgIG5hbWU6IFwiR2l0TGFiXCIsXG4gICAgZG9jc1VybDogXCJodHRwczovL2NsZXJrLmNvbS9kb2NzL2F1dGhlbnRpY2F0aW9uL3NvY2lhbC1jb25uZWN0aW9ucy9naXRsYWJcIlxuICB9LFxuICB7XG4gICAgcHJvdmlkZXI6IFwiZHJvcGJveFwiLFxuICAgIHN0cmF0ZWd5OiBcIm9hdXRoX2Ryb3Bib3hcIixcbiAgICBuYW1lOiBcIkRyb3Bib3hcIixcbiAgICBkb2NzVXJsOiBcImh0dHBzOi8vY2xlcmsuY29tL2RvY3MvYXV0aGVudGljYXRpb24vc29jaWFsLWNvbm5lY3Rpb25zL2Ryb3Bib3hcIlxuICB9LFxuICB7XG4gICAgcHJvdmlkZXI6IFwiYXRsYXNzaWFuXCIsXG4gICAgc3RyYXRlZ3k6IFwib2F1dGhfYXRsYXNzaWFuXCIsXG4gICAgbmFtZTogXCJBdGxhc3NpYW5cIixcbiAgICBkb2NzVXJsOiBcImh0dHBzOi8vY2xlcmsuY29tL2RvY3MvYXV0aGVudGljYXRpb24vc29jaWFsLWNvbm5lY3Rpb25zL2F0bGFzc2lhblwiXG4gIH0sXG4gIHtcbiAgICBwcm92aWRlcjogXCJiaXRidWNrZXRcIixcbiAgICBzdHJhdGVneTogXCJvYXV0aF9iaXRidWNrZXRcIixcbiAgICBuYW1lOiBcIkJpdGJ1Y2tldFwiLFxuICAgIGRvY3NVcmw6IFwiaHR0cHM6Ly9jbGVyay5jb20vZG9jcy9hdXRoZW50aWNhdGlvbi9zb2NpYWwtY29ubmVjdGlvbnMvYml0YnVja2V0XCJcbiAgfSxcbiAge1xuICAgIHByb3ZpZGVyOiBcImh1YnNwb3RcIixcbiAgICBzdHJhdGVneTogXCJvYXV0aF9odWJzcG90XCIsXG4gICAgbmFtZTogXCJIdWJTcG90XCIsXG4gICAgZG9jc1VybDogXCJodHRwczovL2NsZXJrLmNvbS9kb2NzL2F1dGhlbnRpY2F0aW9uL3NvY2lhbC1jb25uZWN0aW9ucy9odWJzcG90XCJcbiAgfSxcbiAge1xuICAgIHByb3ZpZGVyOiBcIm5vdGlvblwiLFxuICAgIHN0cmF0ZWd5OiBcIm9hdXRoX25vdGlvblwiLFxuICAgIG5hbWU6IFwiTm90aW9uXCIsXG4gICAgZG9jc1VybDogXCJodHRwczovL2NsZXJrLmNvbS9kb2NzL2F1dGhlbnRpY2F0aW9uL3NvY2lhbC1jb25uZWN0aW9ucy9ub3Rpb25cIlxuICB9LFxuICB7XG4gICAgcHJvdmlkZXI6IFwiYXBwbGVcIixcbiAgICBzdHJhdGVneTogXCJvYXV0aF9hcHBsZVwiLFxuICAgIG5hbWU6IFwiQXBwbGVcIixcbiAgICBkb2NzVXJsOiBcImh0dHBzOi8vY2xlcmsuY29tL2RvY3MvYXV0aGVudGljYXRpb24vc29jaWFsLWNvbm5lY3Rpb25zL2FwcGxlXCJcbiAgfSxcbiAge1xuICAgIHByb3ZpZGVyOiBcImxpbmVcIixcbiAgICBzdHJhdGVneTogXCJvYXV0aF9saW5lXCIsXG4gICAgbmFtZTogXCJMSU5FXCIsXG4gICAgZG9jc1VybDogXCJodHRwczovL2NsZXJrLmNvbS9kb2NzL2F1dGhlbnRpY2F0aW9uL3NvY2lhbC1jb25uZWN0aW9ucy9saW5lXCJcbiAgfSxcbiAge1xuICAgIHByb3ZpZGVyOiBcImluc3RhZ3JhbVwiLFxuICAgIHN0cmF0ZWd5OiBcIm9hdXRoX2luc3RhZ3JhbVwiLFxuICAgIG5hbWU6IFwiSW5zdGFncmFtXCIsXG4gICAgZG9jc1VybDogXCJodHRwczovL2NsZXJrLmNvbS9kb2NzL2F1dGhlbnRpY2F0aW9uL3NvY2lhbC1jb25uZWN0aW9ucy9pbnN0YWdyYW1cIlxuICB9LFxuICB7XG4gICAgcHJvdmlkZXI6IFwiY29pbmJhc2VcIixcbiAgICBzdHJhdGVneTogXCJvYXV0aF9jb2luYmFzZVwiLFxuICAgIG5hbWU6IFwiQ29pbmJhc2VcIixcbiAgICBkb2NzVXJsOiBcImh0dHBzOi8vY2xlcmsuY29tL2RvY3MvYXV0aGVudGljYXRpb24vc29jaWFsLWNvbm5lY3Rpb25zL2NvaW5iYXNlXCJcbiAgfSxcbiAge1xuICAgIHByb3ZpZGVyOiBcInNwb3RpZnlcIixcbiAgICBzdHJhdGVneTogXCJvYXV0aF9zcG90aWZ5XCIsXG4gICAgbmFtZTogXCJTcG90aWZ5XCIsXG4gICAgZG9jc1VybDogXCJodHRwczovL2NsZXJrLmNvbS9kb2NzL2F1dGhlbnRpY2F0aW9uL3NvY2lhbC1jb25uZWN0aW9ucy9zcG90aWZ5XCJcbiAgfSxcbiAge1xuICAgIHByb3ZpZGVyOiBcInhlcm9cIixcbiAgICBzdHJhdGVneTogXCJvYXV0aF94ZXJvXCIsXG4gICAgbmFtZTogXCJYZXJvXCIsXG4gICAgZG9jc1VybDogXCJodHRwczovL2NsZXJrLmNvbS9kb2NzL2F1dGhlbnRpY2F0aW9uL3NvY2lhbC1jb25uZWN0aW9ucy94ZXJvXCJcbiAgfSxcbiAge1xuICAgIHByb3ZpZGVyOiBcImJveFwiLFxuICAgIHN0cmF0ZWd5OiBcIm9hdXRoX2JveFwiLFxuICAgIG5hbWU6IFwiQm94XCIsXG4gICAgZG9jc1VybDogXCJodHRwczovL2NsZXJrLmNvbS9kb2NzL2F1dGhlbnRpY2F0aW9uL3NvY2lhbC1jb25uZWN0aW9ucy9ib3hcIlxuICB9LFxuICB7XG4gICAgcHJvdmlkZXI6IFwic2xhY2tcIixcbiAgICBzdHJhdGVneTogXCJvYXV0aF9zbGFja1wiLFxuICAgIG5hbWU6IFwiU2xhY2tcIixcbiAgICBkb2NzVXJsOiBcImh0dHBzOi8vY2xlcmsuY29tL2RvY3MvYXV0aGVudGljYXRpb24vc29jaWFsLWNvbm5lY3Rpb25zL3NsYWNrXCJcbiAgfSxcbiAge1xuICAgIHByb3ZpZGVyOiBcImxpbmVhclwiLFxuICAgIHN0cmF0ZWd5OiBcIm9hdXRoX2xpbmVhclwiLFxuICAgIG5hbWU6IFwiTGluZWFyXCIsXG4gICAgZG9jc1VybDogXCJodHRwczovL2NsZXJrLmNvbS9kb2NzL2F1dGhlbnRpY2F0aW9uL3NvY2lhbC1jb25uZWN0aW9ucy9saW5lYXJcIlxuICB9LFxuICB7XG4gICAgcHJvdmlkZXI6IFwieFwiLFxuICAgIHN0cmF0ZWd5OiBcIm9hdXRoX3hcIixcbiAgICBuYW1lOiBcIlggLyBUd2l0dGVyXCIsXG4gICAgZG9jc1VybDogXCJodHRwczovL2NsZXJrLmNvbS9kb2NzL2F1dGhlbnRpY2F0aW9uL3NvY2lhbC1jb25uZWN0aW9ucy94LXR3aXR0ZXItdjJcIlxuICB9LFxuICB7XG4gICAgcHJvdmlkZXI6IFwiZW5zdGFsbFwiLFxuICAgIHN0cmF0ZWd5OiBcIm9hdXRoX2Vuc3RhbGxcIixcbiAgICBuYW1lOiBcIkVuc3RhbGxcIixcbiAgICBkb2NzVXJsOiBcImh0dHBzOi8vY2xlcmsuY29tL2RvY3MvYXV0aGVudGljYXRpb24vc29jaWFsLWNvbm5lY3Rpb25zL2Vuc3RhbGxcIlxuICB9LFxuICB7XG4gICAgcHJvdmlkZXI6IFwiaHVnZ2luZ2ZhY2VcIixcbiAgICBzdHJhdGVneTogXCJvYXV0aF9odWdnaW5nZmFjZVwiLFxuICAgIG5hbWU6IFwiSHVnZ2luZyBGYWNlXCIsXG4gICAgZG9jc1VybDogXCJodHRwczovL2NsZXJrLmNvbS9kb2NzL2F1dGhlbnRpY2F0aW9uL3NvY2lhbC1jb25uZWN0aW9ucy9odWdnaW5nZmFjZVwiXG4gIH1cbl07XG5mdW5jdGlvbiBnZXRPQXV0aFByb3ZpZGVyRGF0YSh7XG4gIHByb3ZpZGVyLFxuICBzdHJhdGVneVxufSkge1xuICBpZiAocHJvdmlkZXIpIHtcbiAgICByZXR1cm4gT0FVVEhfUFJPVklERVJTLmZpbmQoKG9hdXRoX3Byb3ZpZGVyKSA9PiBvYXV0aF9wcm92aWRlci5wcm92aWRlciA9PSBwcm92aWRlcik7XG4gIH1cbiAgcmV0dXJuIE9BVVRIX1BST1ZJREVSUy5maW5kKChvYXV0aF9wcm92aWRlcikgPT4gb2F1dGhfcHJvdmlkZXIuc3RyYXRlZ3kgPT0gc3RyYXRlZ3kpO1xufVxuZnVuY3Rpb24gc29ydGVkT0F1dGhQcm92aWRlcnMoc29ydGluZ0FycmF5KSB7XG4gIHJldHVybiBPQVVUSF9QUk9WSURFUlMuc2xpY2UoKS5zb3J0KChhLCBiKSA9PiB7XG4gICAgbGV0IGFQb3MgPSBzb3J0aW5nQXJyYXkuaW5kZXhPZihhLnN0cmF0ZWd5KTtcbiAgICBpZiAoYVBvcyA9PSAtMSkge1xuICAgICAgYVBvcyA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuICAgIH1cbiAgICBsZXQgYlBvcyA9IHNvcnRpbmdBcnJheS5pbmRleE9mKGIuc3RyYXRlZ3kpO1xuICAgIGlmIChiUG9zID09IC0xKSB7XG4gICAgICBiUG9zID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG4gICAgfVxuICAgIHJldHVybiBhUG9zIC0gYlBvcztcbiAgfSk7XG59XG5cbi8vIHNyYy9zYW1sLnRzXG52YXIgU0FNTF9JRFBTID0ge1xuICBzYW1sX29rdGE6IHtcbiAgICBuYW1lOiBcIk9rdGEgV29ya2ZvcmNlXCIsXG4gICAgbG9nbzogXCJva3RhXCJcbiAgfSxcbiAgc2FtbF9nb29nbGU6IHtcbiAgICBuYW1lOiBcIkdvb2dsZSBXb3Jrc3BhY2VcIixcbiAgICBsb2dvOiBcImdvb2dsZVwiXG4gIH0sXG4gIHNhbWxfbWljcm9zb2Z0OiB7XG4gICAgbmFtZTogXCJNaWNyb3NvZnQgRW50cmEgSUQgKEZvcm1lcmx5IEFEKVwiLFxuICAgIGxvZ286IFwiYXp1cmVcIlxuICB9LFxuICBzYW1sX2N1c3RvbToge1xuICAgIG5hbWU6IFwiU0FNTFwiLFxuICAgIGxvZ286IFwic2FtbFwiXG4gIH1cbn07XG5cbi8vIHNyYy93ZWIzLnRzXG52YXIgV0VCM19QUk9WSURFUlMgPSBbXG4gIHtcbiAgICBwcm92aWRlcjogXCJtZXRhbWFza1wiLFxuICAgIHN0cmF0ZWd5OiBcIndlYjNfbWV0YW1hc2tfc2lnbmF0dXJlXCIsXG4gICAgbmFtZTogXCJNZXRhTWFza1wiXG4gIH0sXG4gIHtcbiAgICBwcm92aWRlcjogXCJjb2luYmFzZV93YWxsZXRcIixcbiAgICBzdHJhdGVneTogXCJ3ZWIzX2NvaW5iYXNlX3dhbGxldF9zaWduYXR1cmVcIixcbiAgICBuYW1lOiBcIkNvaW5iYXNlIFdhbGxldFwiXG4gIH0sXG4gIHtcbiAgICBwcm92aWRlcjogXCJva3hfd2FsbGV0XCIsXG4gICAgc3RyYXRlZ3k6IFwid2ViM19va3hfd2FsbGV0X3NpZ25hdHVyZVwiLFxuICAgIG5hbWU6IFwiT0tYIFdhbGxldFwiXG4gIH1cbl07XG5mdW5jdGlvbiBnZXRXZWIzUHJvdmlkZXJEYXRhKHtcbiAgcHJvdmlkZXIsXG4gIHN0cmF0ZWd5XG59KSB7XG4gIGlmIChwcm92aWRlcikge1xuICAgIHJldHVybiBXRUIzX1BST1ZJREVSUy5maW5kKChwKSA9PiBwLnByb3ZpZGVyID09IHByb3ZpZGVyKTtcbiAgfVxuICByZXR1cm4gV0VCM19QUk9WSURFUlMuZmluZCgocCkgPT4gcC5zdHJhdGVneSA9PSBzdHJhdGVneSk7XG59XG5leHBvcnQge1xuICBPQVVUSF9QUk9WSURFUlMsXG4gIFNBTUxfSURQUyxcbiAgV0VCM19QUk9WSURFUlMsXG4gIGdldE9BdXRoUHJvdmlkZXJEYXRhLFxuICBnZXRXZWIzUHJvdmlkZXJEYXRhLFxuICBzb3J0ZWRPQXV0aFByb3ZpZGVyc1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/.pnpm/@clerk+types@4.46.1/node_modules/@clerk/types/dist/esm/index.js\n");

/***/ })

};
;
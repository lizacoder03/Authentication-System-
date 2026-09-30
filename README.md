# Assignment 7: Authentication System

A responsive React demo with required-field validation, live password-strength feedback, remember-me storage, a protected dashboard, simulated JWT-shaped tokens, and logout.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Any non-empty username and password are accepted in demo mode.

## Session behavior

- With **Remember me** off, the token is stored in `sessionStorage` and expires after one hour.
- With **Remember me** on, the token is stored in `localStorage` and expires after seven days.
- The dashboard is available at `/dashboard` only while a non-expired token exists. Signing out clears both token keys.

Tokens are simulated in the browser and are not signed or verified by a server. This project demonstrates client-side flow only; it is not production authentication.

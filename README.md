# Kindle Clippings Frontend

## Version 1.0.0

### Changelog & Updates

- **SPA Routing for Cloudflare Pages:**  
    - Switched deployment from Cloudflare Workers to Cloudflare Pages for proper SPA routing.
        - Added and removed `_routes.json` for fallback routing to `index.html`. (workers do not support redirections pages do not need _routes)
        - Removed `_redirects` and Netlify-style redirects from the project.

- **File Upload & Processing:**  
  - Users can upload their Kindle clippings file.
  - Backend processes highlights and returns a downloadable PDF/ZIP.
  - Coins are updated after processing, and relevant error messages are shown (e.g., not enough coins).

- **Error Handling:**  
  - Informative toast notifications for backend errors, authentication issues, and insufficient coins.

---

## Version 1.1.0

- **Authentication Flow:**  
    - Protected routes now check authentication via `/auth/me` endpoint.
    - While checking authentication, a book stacking animation and rotating informative messages are shown.
    - If not authenticated, users are redirected to `/auth`.

## Version 1.2.0

- **Coins System:**  
  - Global coins state managed via React Context (`CoinsContext`).
  - Coins are set from backend responses after login, signup, Google login, and relevant API calls.
  - `/coins` API is only called as a fallback if coins are undefined.

- **UI/UX Improvements:**  
  - Coins dashboard is now a transparent, rounded component with a custom icon.
  - Burger menu added to open a dashboard drawer with logout and other actions.
  - spinner animation with messages during authentication checks.
  - Responsive and modern color palette using royal blue, and gray tones.


## Getting Started

1. Install dependencies:  
   `npm install` or `bun install`

2. Run locally:  
   `npm run dev` or `bun run dev`

3. Build for production:  
   `npm run build` or `bun run build`

4. Deploy using Cloudflare Pages with `dist` as the publish directory.

---

## Tech Stack

- React + Vite
- Tailwind CSS
- Cloudflare Pages
- Context API for global state
- REST API backend

---

## License

MIT

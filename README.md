# RD Browser

RD Browser is a local web app for browsing and managing Real-Debrid torrents.

## Requirements

- Node.js
- npm
- A Real-Debrid API token

## Run Locally

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd rd-browser
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:

   ```bash
   RD_API_TOKEN="your_real_debrid_api_token"
   ```

4. Start the local development server:

   ```bash
   npm run dev
   ```

5. Open the local URL printed by Vite in your browser.

## Scripts

- `npm run dev` - start the local development server
- `npm run build` - build the app for production
- `npm run preview` - preview the production build locally
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript checks

## Notes

- Keep your `.env` file private. It contains your Real-Debrid API token.
- `.env` is ignored by git in this project.

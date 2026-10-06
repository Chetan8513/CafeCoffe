# Café Invitation App

A mobile-first, static invitation web app for Tejashri. It is designed to work on GitHub Pages and Netlify without any build step.

## Features

- Golden ticket unlock flow
- Playful yes/no question interaction
- Plan builder with vibe, place, date, and time
- Geolocation + nearby café suggestions
- Weather via Open-Meteo
- Calendar export and maps link
- Prefilled Gmail confirmation draft with WhatsApp fallback
- Fully responsive, mobile-first layout

## Local run

Open the folder in a browser directly, or run a tiny local server:

```bash
cd d:\CafeClick
python -m http.server 8000
```

Then visit:

- http://localhost:8000

## Email flow

When the user confirms the plan, the app opens a prefilled Gmail draft. On mobile it tries the Gmail app first and falls back to Gmail in the browser; on a laptop it opens Gmail's compose page. The draft includes:

- recipient: the configured `myEmail` address (`pchetan908@gmail.com` for testing)
- Gmail account hint: the same configured address on the web compose page
- subject: the selected date and time
- body: date, time, vibe, selected place and address, a Maps link, weather, note, and a warm message

Gmail chooses the actual From identity from the active Gmail account; a web page cannot set it. For testing, sign in to Gmail as `pchetan908@gmail.com` on the device and leave the recipient configured to that same address. The draft is not sent automatically. This uses no EmailJS API key or email-sending service.

The generated email draft is built in [app.js](app.js).

## GitHub Pages deployment

1. Push this project to a GitHub repository.
2. Open the repository in GitHub.
3. Go to Settings → Pages.
4. Set source to "Deploy from a branch".
5. Choose the main branch and root folder.
6. Save and wait for the site to publish.

## Netlify deployment

1. Push this project to GitHub or GitLab.
2. Log in to Netlify.
3. Click "Add new project" → "Import an existing project".
4. Select the repository.
5. Keep the default settings because this is a static site.
6. Publish.

## Notes

- Geolocation and map data stay in the browser.
- External APIs time out gracefully and fall back to sensible defaults.
- The app works without a build step and is compatible with modern static hosts.

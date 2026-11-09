# Roohu Football Arena (Android)

A football draft-and-simulate game: pick a formation, draft 11 legends, choose tactics, then watch a seeded match with extra time and penalties. Play against the CPU (4 levels) or pass the phone between two players. Works fully offline. Online rooms are not included.

## Get the APK (no tools needed on your PC)

1. Sign in at github.com and click **New repository**. Name it, keep it Private or Public, and create it.
2. On the new repo page click **uploading an existing file**.
3. Unzip this project and drag **everything inside the folder** into the page, including the `.github` folder. If your computer hides `.github`, turn on "show hidden files" first.
4. Click **Commit changes**. Make sure the branch is `main`.
5. Open the **Actions** tab. A run named **Build Android APK** starts by itself (about 5 to 10 minutes). To start it again later: Actions, Build Android APK, **Run workflow**.
6. When it shows a green tick, open the run and scroll to **Artifacts** at the bottom. Download **roohu-football-arena-debug-apk** and unzip it to get `app-debug.apk`.
7. Copy it to your phone and open it. Allow "Install unknown apps" for your file manager or browser when asked.

If the run turns red, open it, click the failed step and send me the red error text.

## What the workflow does

Installs Node 20 and Java 17, runs `npm install`, `npm test` (300 simulated drafts and matches), `npm run build` (Vite), creates the Android project with `npx cap add android`, applies `scripts/patch-android.mjs` (icon, splash, immersive mode, portrait lock, no INTERNET permission), runs `npx cap sync android`, then `./gradlew assembleDebug` and uploads the APK.

## Notes

- This is a debug APK, fine for installing on your own phone. A Play Store release needs a signed release build.
- The `android/` folder is generated on every build, so it is not stored in the repo.
- Back button: asks before leaving a game; on the home screen it closes the app.
- Ratings are game ratings, not official statistics.

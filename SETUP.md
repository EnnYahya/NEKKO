# Nekko Setup — Text, Chat, Profiles and Chess

## Firebase
Enable:
1. Authentication → Email/Password.
2. Firestore Database → Production mode.
3. Paste `firestore.rules` into the Firestore Rules tab and publish it.
4. Create a Web App and copy its Firebase config into `js/firebase-config.js`.

Firebase Storage is not used. You do not need to enable Storage.

## GitHub Pages
Upload all files listed below to the root of your GitHub repository while keeping the same folder structure. Then enable GitHub Pages from the `main` branch and `/ (root)`.

## Features
- Username/password accounts
- Text-only posts and comments
- Clickable usernames
- Public profile with display name and bio
- Edit your own profile
- Direct messages
- Live two-player chess using Firestore
- No image, video, upload, story, Snake, or Barricade features

## Important
Replace the placeholder values in `js/firebase-config.js` before publishing.

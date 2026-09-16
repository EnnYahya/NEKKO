# Nekko — Setup Guide

This gets your site live with accounts, a text feed, direct messages,
profile pages, and online chess — using GitHub Pages (hosting) +
Firebase (accounts + database), both free. No Firebase Storage is
used anywhere, so you never need to put a card on file.

---

## Part A — Create your Firebase project

1. Go to https://console.firebase.google.com and click **Add project**.
2. Name it anything (e.g. "nekko-app"). Disable Google Analytics (not needed) → **Create project**.
3. In the left sidebar, click **Build > Authentication** → **Get started**.
4. Under "Sign-in method," click **Email/Password**, toggle it **Enabled**, click **Save**.
   (We use this behind the scenes even though users only type a username — see note below.)
5. In the left sidebar, click **Build > Firestore Database** → **Create database**.
   - Choose **Start in production mode**.
   - Pick any location close to you → **Enable**.
6. Once created, click the **Rules** tab at the top.
7. Delete everything there and paste in the entire contents of **firestore.rules**
   (included in this folder). Click **Publish**.
8. Now click the gear icon (top left, next to "Project Overview") → **Project settings**.
9. Scroll to "Your apps" → click the **</>** (web) icon.
10. Give it a nickname (e.g. "nekko-web") → **Register app**.
11. Firebase shows you a `firebaseConfig = { ... }` block. Copy those values.
12. Open **js/firebase-config.js** in this folder and paste your real values in,
    replacing the `PASTE_YOUR_...` placeholders.

That's it for Firebase — accounts and the database are ready. You do
**not** need to enable Storage or Billing/Blaze for any of this to work.

---

## Part B — Put it on GitHub Pages

1. Go to https://github.com and log in (or create a free account).
2. Click the **+** icon top right → **New repository**.
3. Name it (e.g. `nekko`), keep it **Public**, click **Create repository**.
4. On the new repo page, click **uploading an existing file**.
5. Drag in **every file and folder** listed below.
6. Scroll down, click **Commit changes**.
7. Go to the repo's **Settings** tab → **Pages** (left sidebar).
8. Under "Branch," choose **main** and folder **/ (root)** → **Save**.
9. Wait about 1 minute, then refresh — GitHub shows your live link, like:
   `https://yourusername.github.io/nekko/`

Send that link to anyone — it works on phone or PC, no installs needed.

### Files to upload

```
index.html
signup.html
forgot-password.html
dashboard.html
chat.html
profile.html
games.html
chess.html
firestore.rules
SETUP.md
css/style.css
js/firebase-config.js
js/auth.js
js/posts.js
js/chat.js
js/chess-engine.js
js/chess-online.js
images/logo-placeholder.png
images/site-background.jpg
```

(`storage.rules` and `js/scores.js` no longer exist — Storage isn't used.)

---

## Swapping in your own images

1. Put your logo image in the `images/` folder, named `logo-placeholder.png`
   (or update the filename in the HTML files if you name it something else).
2. To change the site background, replace `images/site-background.jpg`
   with your own picture (same filename), or edit the `background-image`
   line in `css/style.css` to point at a different file.
3. Re-upload the changed file to GitHub the same way as Part B, step 5.

---

## How the "no email" login actually works

Firebase's login system technically requires an email address behind the
scenes. So this code quietly creates one for you: if someone signs up as
`nekomen`, it stores an internal email of `nekomen@nekko.local` that the
user never sees or types. They only ever interact with their username.

## How "Forgot Password" works

Since there's no email to send a reset link to, the "Forgot Password" page
just saves a request (with their username) into your Firestore database.
To see these requests:

1. Firebase Console → Firestore Database → look for the
   **password_reset_requests** collection.
2. Find their username, then go to **Authentication** tab, search their
   fake email (`username@nekko.local`), click the **⋮** menu → **Reset password**
   (or just delete and let them re-sign-up, or manually set a temp password).

---

## What you've got

- **Accounts** — sign up / log in / log out with just a username and password.
- **Text feed** — post, comment, and share a direct link to any post. Everything
  updates live for everyone on the site, no refresh needed. (Photo/video posting
  and 24-hour stories were removed — both needed Firebase Storage, which requires
  the paid Blaze plan even to stay within the free quota.)
- **Direct messages** — click "💬 Chat," type a username to start a conversation,
  or hit "💬 Message" from someone's profile. Messages sync live.
- **Profile pages** — click any username (on a post, a comment, or in chat) to see
  their profile: name, bio, a "Message" button, and a "Play Chess" button. On your
  own profile, an "Edit Profile" button lets you set your bio.
- **Chess, online** — from the Games hub or from someone's profile, start a real-time
  chess game with them. Moves sync instantly through Firestore, so you don't need to
  be on the same device — one game per pair of friends, and "Restart Game" resets it
  for a rematch. Standard rules (check, checkmate, stalemate), except no castling or
  en passant, and pawns promote straight to queen.

If you want more later — likes on posts, group chats, a real chess AI opponent,
re-adding photo posts once you're comfortable enabling Storage/Blaze — just ask.

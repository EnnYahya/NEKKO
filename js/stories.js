// ============================================================
// STORIES LOGIC — 24-hour disappearing photo/video updates
// ============================================================
// Data model:
// stories/{storyId}
//   authorId, authorUsername, mediaUrl, mediaType,
//   createdAt, expireAt (createdAt + 24h)
//
// Stories are filtered to "active" (expireAt > now) on the client.
// Firestore's native TTL policy (set up in the console, see SETUP.md)
// automatically deletes expired documents in the background so your
// database doesn't fill up with old stories — that's a server-side
// cleanup, separate from the client-side filtering below.
// ============================================================

const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000;

// ---------- CREATE A STORY ----------
async function createStory(user, profile, fileInput, onProgress) {
  const file = fileInput.files[0];
  if (!file) throw new Error("Choose a photo or video first.");

  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");
  if (!isVideo && !isImage) throw new Error("Only images and videos are supported.");
  if (file.size > 25 * 1024 * 1024) throw new Error("File is too large — please keep it under 25MB.");

  const mediaType = isVideo ? "video" : "image";
  const path = `stories/${user.uid}/${Date.now()}_${file.name}`;
  const ref = storage.ref(path);
  const task = ref.put(file);

  const mediaUrl = await new Promise((resolve, reject) => {
    task.on("state_changed",
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        if (onProgress) onProgress(pct);
      },
      (err) => reject(err),
      async () => resolve(await task.snapshot.ref.getDownloadURL())
    );
  });

  const now = new Date();
  const expireAt = new Date(now.getTime() + STORY_LIFETIME_MS);

  await db.collection("stories").add({
    authorId: user.uid,
    authorUsername: profile.username,
    mediaUrl,
    mediaType,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    expireAt: firebase.firestore.Timestamp.fromDate(expireAt)
  });
}

// ---------- LIVE LIST OF ACTIVE STORIES, GROUPED BY AUTHOR ----------
function listenToActiveStories(onUpdate) {
  return db.collection("stories")
    .orderBy("createdAt", "desc")
    .limit(200)
    .onSnapshot((snapshot) => {
      const now = Date.now();
      const active = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(story => story.expireAt && story.expireAt.toMillis() > now);

      // Group by author, newest first within each group, oldest-story-first for viewing order
      const groups = {};
      active.forEach(story => {
        if (!groups[story.authorId]) {
          groups[story.authorId] = {
            authorId: story.authorId,
            authorUsername: story.authorUsername,
            stories: []
          };
        }
        groups[story.authorId].stories.push(story);
      });
      Object.values(groups).forEach(g => g.stories.reverse()); // oldest first for playback order

      onUpdate(Object.values(groups));
    }, (err) => console.error("Stories listener error:", err));
}

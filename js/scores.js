// ============================================================
// HIGH SCORES — personal best per game, saved per user
// ============================================================
// Stored at: users/{uid}.highScores.{gameName}
// Uses a merge update so it never touches the rest of the profile.
// ============================================================

async function getHighScore(uid, gameName) {
  const doc = await db.collection("users").doc(uid).get();
  const data = doc.data();
  return (data && data.highScores && data.highScores[gameName]) || 0;
}

async function saveHighScoreIfBetter(uid, gameName, score) {
  const current = await getHighScore(uid, gameName);
  if (score > current) {
    await db.collection("users").doc(uid).set({
      highScores: { [gameName]: score }
    }, { merge: true });
    return true; // new record
  }
  return false;
}

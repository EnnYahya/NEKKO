// ============================================================
// CHESS ONLINE — real-time 1v1 games between two users
// ============================================================
// Data model:
// chess_games/{gameId}
//   players: [uidA, uidB]
//   playerUsernames: { uidA: "name", uidB: "name" }
//   playerColors: { uidA: "w", uidB: "b" }   (assigned once, stable)
//   board: array of 64 strings, row-major, "" for empty square
//   turn: "w" | "b"
//   status: "active" | "checkmate" | "stalemate"
//   winner: null | "w" | "b" | "draw"
//   createdAt, updatedAt
//
// Game IDs are deterministic — same pattern as chat conversations —
// so starting a game with the same person always reuses the same
// board (and a "Restart" resets that same shared doc).
// ============================================================

function makeChessGameId(uidA, uidB) {
  return [uidA, uidB].sort().join("_");
}

// ---------- BOARD <-> FIRESTORE CONVERSION ----------
// Firestore's compat SDK doesn't support nested arrays, so the 8x8
// board is flattened to a single array of 64 cells for storage.
function flattenBoard(board) {
  const flat = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      flat.push(board[r][c] || "");
    }
  }
  return flat;
}

function unflattenBoard(flat) {
  const board = [];
  for (let r = 0; r < 8; r++) {
    board.push(flat.slice(r * 8, r * 8 + 8).map(cell => cell || null));
  }
  return board;
}

// ---------- START OR RESUME A GAME BY USERNAME ----------
async function findOrCreateChessGame(currentUser, currentProfile, otherUsername) {
  const cleanUsername = otherUsername.trim().toLowerCase();
  if (cleanUsername === currentProfile.username) {
    throw new Error("You can't play against yourself.");
  }

  const usernameDoc = await db.collection("usernames").doc(cleanUsername).get();
  if (!usernameDoc.exists) {
    throw new Error("No user found with that username.");
  }
  const otherUid = usernameDoc.data().uid;
  return startOrResumeChessGameWithUid(currentUser, currentProfile, otherUid, cleanUsername);
}

// ---------- START OR RESUME A GAME BY UID (used from profile pages) ----------
async function startOrResumeChessGameWithUid(currentUser, currentProfile, otherUid, otherUsername) {
  if (otherUid === currentUser.uid) {
    throw new Error("You can't play against yourself.");
  }

  const gameId = makeChessGameId(currentUser.uid, otherUid);
  const gameRef = db.collection("chess_games").doc(gameId);
  const gameDoc = await gameRef.get();

  if (!gameDoc.exists) {
    // Whoever's UID sorts first plays white — stable regardless of who starts the game.
    const [firstUid] = [currentUser.uid, otherUid].sort();
    const playerColors = {
      [firstUid]: "w",
      [firstUid === currentUser.uid ? otherUid : currentUser.uid]: "b"
    };

    await gameRef.set({
      players: [currentUser.uid, otherUid],
      playerUsernames: {
        [currentUser.uid]: currentProfile.username,
        [otherUid]: otherUsername
      },
      playerColors,
      board: flattenBoard(createInitialBoard()),
      turn: "w",
      status: "active",
      winner: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  return gameId;
}

// ---------- LIVE GAME STATE ----------
function listenToChessGame(gameId, onUpdate) {
  return db.collection("chess_games").doc(gameId).onSnapshot((doc) => {
    if (!doc.exists) { onUpdate(null); return; }
    onUpdate({ id: doc.id, ...doc.data() });
  }, (err) => console.error("Chess game listener error:", err));
}

// ---------- SUBMIT A MOVE ----------
async function submitChessMove(gameId, newBoard, newTurn, status, winner) {
  await db.collection("chess_games").doc(gameId).update({
    board: flattenBoard(newBoard),
    turn: newTurn,
    status,
    winner,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// ---------- RESTART A GAME (keeps the same players/colors) ----------
async function restartChessGame(gameId) {
  await db.collection("chess_games").doc(gameId).update({
    board: flattenBoard(createInitialBoard()),
    turn: "w",
    status: "active",
    winner: null,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// ---------- HELPER: get the other player's uid/username ----------
function otherChessPlayer(game, myUid) {
  const otherUid = game.players.find(uid => uid !== myUid);
  return { uid: otherUid, username: game.playerUsernames[otherUid] || "Unknown" };
}

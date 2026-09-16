function chessGameId(a,b){return "chess_"+[a,b].sort().join("_")}
async function createOrOpenChessGame(user,profile,otherUid,otherProfile){
 const id=chessGameId(user.uid,otherUid), ref=db.collection("games").doc(id), snap=await ref.get();
 if(!snap.exists) await ref.set({type:"chess",players:[user.uid,otherUid],playerUsernames:{[user.uid]:profile.username,[otherUid]:otherProfile.username},whiteId:user.uid,blackId:otherUid,board:createInitialBoard(),turn:"w",status:"active",createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
 return id;
}

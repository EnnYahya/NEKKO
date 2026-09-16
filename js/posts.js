// Text-only posts and comments (no Firebase Storage required)
async function createPost(user, profile, text) {
  const cleanText = (text || "").trim();
  if (!cleanText) throw new Error("Write something first.");
  if (cleanText.length > 2000) throw new Error("Post is too long.");
  await db.collection("posts").add({
    authorId: user.uid, authorUsername: profile.username,
    text: cleanText, commentCount: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}
function listenToFeed(onUpdate) {
  return db.collection("posts").orderBy("createdAt","desc").limit(50)
    .onSnapshot(
      s => onUpdate(s.docs.map(d => ({ id:d.id, ...d.data() }))),
      e => console.error(e)
    );
}
async function addComment(postId,user,profile,text){
  const cleanText=(text||"").trim();
  if(!cleanText) throw new Error("Comment can't be empty.");
  if(cleanText.length>500) throw new Error("Comment is too long.");
  const postRef=db.collection("posts").doc(postId), ref=postRef.collection("comments").doc();
  await db.runTransaction(async t=>{
    t.set(ref,{authorId:user.uid,authorUsername:profile.username,text:cleanText,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
    const post=await t.get(postRef);
    t.update(postRef,{commentCount:(post.data().commentCount||0)+1});
  });
}
function listenToComments(postId,onUpdate){
 return db.collection("posts").doc(postId).collection("comments").orderBy("createdAt","asc")
  .onSnapshot(s=>onUpdate(s.docs.map(d=>({id:d.id,...d.data()}))));
}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
async function sharePost(postId){ const url=new URL("dashboard.html",location.href);url.searchParams.set("post",postId); if(navigator.clipboard){await navigator.clipboard.writeText(url.href);return true;} return false; }

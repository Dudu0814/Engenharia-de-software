import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import {
  createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  signOut, updateProfile,
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, limit, onSnapshot, runTransaction,
  orderBy, query, serverTimestamp, setDoc, updateDoc, where,
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

export const firebaseReady = Boolean(firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("COLE_"));

let auth;
let db;

if (firebaseReady) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

function requireFirebase() {
  if (!firebaseReady) throw new Error("Configure o Firebase antes de usar recursos online.");
}

function profileFromUser(user, profile = {}) {
  return { ...profile, uid: user.uid, name: profile.name || user.displayName || "Estudante", email: user.email, course: profile.course || "" };
}

export function watchSession(callback) {
  if (!firebaseReady) return () => {};
  let stopProfile = () => {};
  return onAuthStateChanged(auth, (user) => {
    stopProfile();
    if (!user) { callback(null); return; }
    stopProfile = onSnapshot(doc(db, "profiles", user.uid), (snapshot) => {
      callback(profileFromUser(user, snapshot.exists() ? snapshot.data() : {}));
    });
  });
}

export async function registerAccount({ name, email, password, course, university, subject, semester, intent, difficulty }) {
  requireFirebase();
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: name });
  const profile = { name, email: email.toLowerCase(), course, university, subject, semester, intent, difficulty, updatedAt: serverTimestamp() };
  await setDoc(doc(db, "profiles", result.user.uid), profile, { merge: true });
  return profileFromUser(result.user, profile);
}

export async function saveProfile(user, profile) {
  requireFirebase();
  await setDoc(doc(db, "profiles", user.uid), { ...profile, updatedAt: serverTimestamp() }, { merge: true });
}

export async function signInAccount(email, password) {
  requireFirebase();
  const result = await signInWithEmailAndPassword(auth, email, password);
  const snapshot = await getDoc(doc(db, "profiles", result.user.uid));
  return profileFromUser(result.user, snapshot.exists() ? snapshot.data() : {});
}

export async function signOutAccount() {
  requireFirebase();
  await signOut(auth);
}

export async function createOnlineRoom({ name, subject, objective, limit, visibility }, owner) {
  requireFirebase();
  const room = await addDoc(collection(db, "rooms"), {
    name, subject, objective, limit, ownerName: owner.name, ownerId: owner.uid,
    memberIds: [owner.uid], memberNames: { [owner.uid]: owner.name }, memberCount: 1, visibility, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  return room.id;
}

export function watchRooms(callback, onError) {
  if (!firebaseReady) return () => {};
  return onSnapshot(query(collection(db, "rooms"), orderBy("updatedAt", "desc")), (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  }, onError);
}

function addRoomMember(transaction, ref, room, uid, name) {
  if (room.memberIds.includes(uid)) return;
  if (room.memberIds.length >= room.limit) throw new Error("O grupo está cheio.");

  const memberIds = [...room.memberIds, uid];
  transaction.update(ref, {
    memberIds,
    memberNames: { ...room.memberNames, [uid]: name },
    memberCount: memberIds.length,
    updatedAt: serverTimestamp(),
  });
}

export async function joinOnlineRoom(roomId, user) {
  const ref = doc(db, "rooms", roomId);
  await runTransaction(db, async (transaction) => {
    const room = await transaction.get(ref);
    if (!room.exists()) throw new Error("Este grupo não existe mais.");
    const data = room.data();
    if (data.visibility === "private" && !data.memberIds.includes(user.uid)) {
      throw new Error("Este grupo exige aprovação.");
    }
    addRoomMember(transaction, ref, data, user.uid, user.name);
  });
}

export async function requestRoomAccess(room, user) {
  const ref = doc(db, "roomRequests", `${room.id}_${user.uid}`);
  await setDoc(ref, { roomId: room.id, groupName: room.name, ownerId: room.ownerId, requesterId: user.uid, name: user.name, status: "Pendente", updatedAt: serverTimestamp() });
}

export function watchRoomRequests(userId, field, callback, onError) {
  return onSnapshot(query(collection(db, "roomRequests"), where(field, "==", userId)), (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))), onError);
}

export async function decideRoomRequest(request, approved) {
  const requestRef = doc(db, "roomRequests", request.id);
  const roomRef = doc(db, "rooms", request.roomId);
  await runTransaction(db, async (transaction) => {
    const requestSnap = await transaction.get(requestRef);
    const roomSnap = await transaction.get(roomRef);
    if (!requestSnap.exists() || requestSnap.data().status !== "Pendente") throw new Error("Esta solicitação já foi respondida.");
    if (!roomSnap.exists()) throw new Error("Este grupo não existe mais.");
    const room = roomSnap.data();
    const currentRequest = requestSnap.data();
    if (approved) addRoomMember(transaction, roomRef, room, currentRequest.requesterId, currentRequest.name);
    transaction.update(requestRef, { status: approved ? "Aprovada" : "Recusada", updatedAt: serverTimestamp() });
  });
}

export async function getRoomMemberNames(memberIds) {
  const profiles = await Promise.all(memberIds.map((id) => getDoc(doc(db, "profiles", id))));
  return Object.fromEntries(profiles.map((profile, index) => [memberIds[index], profile.exists() ? profile.data().name : "Membro sem perfil"]));
}

export async function removeRoomMember(roomId, userId) {
  const ref = doc(db, "rooms", roomId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error("Este grupo não existe mais.");
    const room = snapshot.data();
    if (userId === room.ownerId) throw new Error("O organizador não pode ser removido.");
    const members = room.memberIds.filter((id) => id !== userId);
    const names = { ...(room.memberNames || {}) }; delete names[userId];
    transaction.update(ref, { memberIds: members, memberNames: names, memberCount: members.length, updatedAt: serverTimestamp() });
  });
}

export async function deleteOnlineRoom(roomId) { await deleteDoc(doc(db, "rooms", roomId)); }

export function watchRoomMessages(roomId, callback, onError) {
  if (!firebaseReady) return () => {};
  return onSnapshot(query(collection(db, "rooms", roomId, "messages"), orderBy("createdAt", "asc")), (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  }, onError);
}

export async function sendRoomMessage(roomId, user, text) {
  requireFirebase();
  await addDoc(collection(db, "rooms", roomId, "messages"), { senderId: user.uid, senderName: user.name, text, createdAt: serverTimestamp() });
}

export async function findProfileByEmail(email) {
  requireFirebase();
  const result = await getDocs(query(collection(db, "profiles"), where("email", "==", email.toLowerCase()), limit(1)));
  if (result.empty) return null;
  return { uid: result.docs[0].id, ...result.docs[0].data() };
}

function directConversationId(firstUserId, secondUserId) {
  return [firstUserId, secondUserId].sort().join("_");
}

export async function openDirectConversation(currentUser, recipient) {
  requireFirebase();
  const id = directConversationId(currentUser.uid, recipient.uid);
  await setDoc(doc(db, "directConversations", id), { participantIds: [currentUser.uid, recipient.uid], participantNames: { [currentUser.uid]: currentUser.name, [recipient.uid]: recipient.name }, updatedAt: serverTimestamp() }, { merge: true });
  return id;
}

export function watchDirectConversations(userId, callback, onError) {
  if (!firebaseReady || !userId) return () => {};
  const conversations = query(collection(db, "directConversations"), where("participantIds", "array-contains", userId));
  return onSnapshot(conversations, (snapshot) => {
    const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    items.sort((a, b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0));
    callback(items);
  }, onError);
}

export function watchDirectMessages(conversationId, callback, onError) {
  if (!firebaseReady || !conversationId) return () => {};
  return onSnapshot(query(collection(db, "directConversations", conversationId, "messages"), orderBy("createdAt", "asc")), (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  }, onError);
}

export async function sendDirectMessage(conversationId, user, text) {
  requireFirebase();
  await addDoc(collection(db, "directConversations", conversationId, "messages"), { senderId: user.uid, senderName: user.name, text, createdAt: serverTimestamp() });
  await updateDoc(doc(db, "directConversations", conversationId), { updatedAt: serverTimestamp() });
}

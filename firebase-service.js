import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import {
  createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  signOut, updateProfile,
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
import {
  addDoc, arrayUnion, collection, doc, getDoc, getDocs, getFirestore, limit, onSnapshot,
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
  return { uid: user.uid, name: profile.name || user.displayName || "Estudante", email: user.email, course: profile.course || "Não informado" };
}

export function watchSession(callback) {
  if (!firebaseReady) return () => {};
  return onAuthStateChanged(auth, async (user) => {
    if (!user) return callback(null);
    const snapshot = await getDoc(doc(db, "profiles", user.uid));
    callback(profileFromUser(user, snapshot.exists() ? snapshot.data() : {}));
  });
}

export async function registerAccount({ name, email, password, course }) {
  requireFirebase();
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: name });
  const profile = { name, email: email.toLowerCase(), course, updatedAt: serverTimestamp() };
  await setDoc(doc(db, "profiles", result.user.uid), profile, { merge: true });
  return profileFromUser(result.user, profile);
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

export async function createOnlineRoom({ name, subject, objective, limit }, owner) {
  requireFirebase();
  const room = await addDoc(collection(db, "rooms"), {
    name, subject, objective, limit, ownerName: owner.name, ownerId: owner.uid,
    memberIds: [owner.uid], memberCount: 1, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  return room.id;
}

export function watchRooms(callback, onError) {
  if (!firebaseReady) return () => {};
  return onSnapshot(query(collection(db, "rooms"), orderBy("updatedAt", "desc")), (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  }, onError);
}

export async function joinOnlineRoom(roomId, user) {
  requireFirebase();
  const room = await getDoc(doc(db, "rooms", roomId));
  if (!room.exists()) throw new Error("Esta sala não existe mais.");
  const data = room.data();
  if (data.memberIds.includes(user.uid)) return;
  if (data.memberCount >= data.limit) throw new Error("Esta sala está cheia.");
  await updateDoc(room.ref, { memberIds: arrayUnion(user.uid), memberCount: data.memberCount + 1, updatedAt: serverTimestamp() });
}

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

async function ensureConversation(currentUser, recipient) {
  const id = directConversationId(currentUser.uid, recipient.uid);
  await setDoc(doc(db, "directConversations", id), { participantIds: [currentUser.uid, recipient.uid], participantNames: { [currentUser.uid]: currentUser.name, [recipient.uid]: recipient.name }, updatedAt: serverTimestamp() }, { merge: true });
  return id;
}

export async function openDirectConversation(currentUser, recipient) {
  requireFirebase();
  return ensureConversation(currentUser, recipient);
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

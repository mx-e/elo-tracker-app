import { initializeApp } from "firebase/app";
import { getDatabase, get, ref, push, child, update } from "firebase/database";
import moment from "moment";
import axios from "axios";

const firebaseConfig = {
  apiKey: "AIzaSyDC3hKKkzSyaVgD2n4wWatrU7Hoq7ifxlA",
  authDomain: "elo-tracker-adeab.firebaseapp.com",
  databaseURL:
    "https://elo-tracker-adeab-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "elo-tracker-adeab",
  storageBucket: "elo-tracker-adeab.appspot.com",
  messagingSenderId: "1095170738610",
  appId: "1:1095170738610:web:9a19a9358a467ed8c73cab",
  measurementId: "G-QHKXJMMTS8",
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
const dbRef = ref(db);

const baseRestUrl = process.env.REACT_APP_BASE_URL;
const request = axios.create({
  baseURL: baseRestUrl,
  timeout: 10000,
});

const testDB = () => {
  get(dbRef, "groups/")
    .then((snap) => {
      if (snap.exists()) {
        console.groupCollapsed("Connection Working!");
        console.log(snap.val());
        console.groupEnd();
      } else {
        console.warn("Connection Issue!");
      }
    })
    .catch((err) => {
      console.groupCollapsed("Connection Error!");
      console.error(err);
      console.groupEnd();
    });
};

const createApiErrorHandler = (hook) => (error) => {
  hook();
  console.error("API Error!");
  console.log(error);
};

const api = {
  addNewGroup: (name) => {
    const newGroupKey = push(child(ref(db), "groups/")).key;
    const updates = {};
    updates["groups/" + newGroupKey] = { name: name };
    updates["groupData/" + newGroupKey] = {
      games: [],
      name: name,
      players: [],
    };
    return update(dbRef, updates);
  },
  addNewPlayer: (name, groupKey) => {
    const path = "groupData/" + groupKey + "/players/";
    const newPlayerKey = push(child(ref(db), path)).key;
    const updates = {};
    updates[path + newPlayerKey] = { name: name };
    return update(dbRef, updates);
  },
  addNewGame: (name, groupKey, winners, losers) => {
    const path = "groupData/" + groupKey + "/games/";
    const newGameKey = push(child(ref(db), path)).key;
    const updates = {};
    updates[path + newGameKey] = {
      name: name,
      timestamp: moment().toISOString(),
      winners: winners,
      losers: losers,
    };
    return update(dbRef, updates);
  },
  getRanking: (groupKey, groupData) => {
    return request.post("/compute-ranking", JSON.stringify(groupData), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
};

export { testDB, api, createApiErrorHandler };

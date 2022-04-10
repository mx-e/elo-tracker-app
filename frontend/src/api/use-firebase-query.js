import { useEffect, useState } from "react";
import { RequestStates } from "../utils/utils";
import { onValue, ref } from "firebase/database";
import { db } from "./api";

export const useFirebaseQuery = (queryString) => {
  const [data, setData] = useState(null);
  const [requestState, setRequestState] = useState(RequestStates.LOADING);

  useEffect(() => {
    const groupListRef = ref(db, queryString);
    onValue(groupListRef, (snap) => {
      const queryData = snap.val();
      setData(queryData);
      setRequestState(RequestStates.IDLE);
    });
  }, [queryString]);

  return [data, requestState, setRequestState];
};

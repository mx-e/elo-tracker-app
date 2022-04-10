export const RequestStates = Object.freeze({
  IDLE: "IDLE",
  LOADING: "LOADING",
  FAILED: "FAILED",
});

export const unmarshallPlayers = (playersObj) =>
  Object.values(playersObj).map(({ name }) => name);

export const unmarshallPlayerSet = (playersSet, playersObj) =>
  Object.keys(playersSet).map((setKey) => playersObj[setKey].name);

export const marshallPlayersSet = (playersList, playersObj) =>
  Object.fromEntries(
    playersList.map((name) => [
      Object.keys(playersObj).find((key) => playersObj[key].name === name),
      true,
    ])
  );

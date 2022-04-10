import { Link, useParams } from "react-router-dom";
import { useFirebaseQuery } from "../api/use-firebase-query";
import {
  marshallPlayersSet,
  RequestStates,
  unmarshallPlayers,
  unmarshallPlayerSet,
} from "../utils/utils";
import { useForm } from "react-hook-form";
import { cloneElement, useRef, useState } from "react";
import { api } from "../api/api";
import MultiSelect from "../components/multi-select";

const Group = () => {
  let { groupId } = useParams();
  const [groupData, requestState, setRequestState] = useFirebaseQuery(
    "groupData/" + groupId + "/"
  );

  if (!groupData && requestState === RequestStates.LOADING) {
    return (
      <>
        <Link to={"/"}>back to group list</Link>
        <h1>Group </h1>
        <h1>Loading...</h1>
      </>
    );
  }
  const { name, games, players } = groupData;

  const handleRequest = () => setRequestState(RequestStates.LOADING);

  return (
    <>
      <Link to={"/"}>back to group list</Link>
      <h1>Group {name}</h1>
      <PlayersList players={players ? players : {}} onRequest={handleRequest} />
      <GamesList
        players={players ? players : {}}
        games={games ? games : {}}
        onRequest={handleRequest}
      />
      <br />
      <Link to={"ranking"}>
        <button>Ranking</button>
      </Link>
    </>
  );
};

const PlayersList = ({ players, onRequest }) => {
  let { groupId } = useParams();
  const [isAdding, setIsAdding] = useState(false);
  const handleSubmit = (form) => {
    setIsAdding(false);
    onRequest();
    api.addNewPlayer(form.name, groupId);
  };

  const handleClose = () => {
    setIsAdding(false);
  };

  return (
    <div>
      <h3>Players</h3>
      {Object.values(players).length > 0 ? (
        <ul>
          {Object.entries(players).map(([key, { name }]) => (
            <li key={key}>{name}</li>
          ))}
        </ul>
      ) : (
        <p>no players yet</p>
      )}
      <button onClick={() => setIsAdding(true)}>add player</button>
      {isAdding && (
        <AddPlayerForm
          onClose={handleClose}
          onSubmit={handleSubmit}
          players={players}
        />
      )}
    </div>
  );
};

const AddPlayerForm = ({ onClose, onSubmit, players }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const groupNames = Object.values(players).map((player) => player.name);
  const validateName = (name) => !groupNames.includes(name);
  return (
    <>
      <h3>New Player</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register("name", {
            required: "Name is required!",
            validate: (name) =>
              validateName(name) || "Player with this name already exists!",
          })}
          placeholder="Player Name"
        />
        <input type="submit" />
        <button onClick={onClose}>Cancel</button>
      </form>
      {errors.name && <p>{errors.name.message}</p>}
    </>
  );
};

const GamesList = ({ players, games, onRequest }) => {
  let { groupId } = useParams();
  const [isAdding, setIsAdding] = useState(false);
  const handleSubmit = ({ name, winners, losers }) => {
    setIsAdding(false);
    onRequest();
    api.addNewGame(name, groupId, winners, losers);
  };

  const handleClose = () => {
    setIsAdding(false);
  };

  return (
    <div>
      <h3>Games</h3>
      <table>
        <thead>
          <tr>
            <th>Game Name</th>
            <th>Timestamp</th>
            <th>Winning Team</th>
            <th>Losing Team</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(games).length > 0 ? (
            Object.entries(games).map(
              ([key, { name, timestamp, winners, losers }]) => (
                <tr key={key}>
                  <td>{name}</td>
                  <td>{timestamp}</td>
                  <td>{unmarshallPlayerSet(winners, players).toString()}</td>
                  <td>{unmarshallPlayerSet(losers, players).toString()}</td>
                </tr>
              )
            )
          ) : (
            <p>no games yet</p>
          )}
        </tbody>
      </table>
      <button onClick={() => setIsAdding(true)}>add game</button>
      {isAdding && (
        <AddGameForm
          onClose={handleClose}
          onSubmit={handleSubmit}
          games={games}
          players={players}
        />
      )}
    </div>
  );
};

const AddGameForm = ({ onClose, onSubmit, games, players }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const winningPlayersRef = useRef([]);
  const losingPlayersRef = useRef([]);
  const [selectError, setSelectError] = useState(null);

  const validateThenSubmit = (form) => {
    const winners = winningPlayersRef.current;
    const losers = losingPlayersRef.current;
    const union = [...new Set([...winners, ...losers])];
    if (union.length < winners.length + losers.length) {
      setSelectError("Same person in winning and losing team!");
    } else {
      onSubmit({
        ...form,
        winners: marshallPlayersSet(winners, players),
        losers: marshallPlayersSet(losers, players),
      });
    }
  };
  const groupGames = Object.values(games).map((game) => game.name);
  const validateName = (name) => !groupGames.includes(name);
  return (
    <>
      <h3>New Game</h3>

      <form onSubmit={handleSubmit(validateThenSubmit)}>
        <input
          {...register("name", {
            required: "Name is required!",
            validate: (name) =>
              validateName(name) || "Game with this name already exists!",
          })}
          placeholder="Game Name"
        />
        <MultiSelect
          refVal={winningPlayersRef}
          label={"winning team"}
          optionList={unmarshallPlayers(players)}
        />
        <MultiSelect
          refVal={losingPlayersRef}
          label={"losing team"}
          highlightColor={"lightcoral"}
          optionList={unmarshallPlayers(players)}
        />
        <br />
        <button type="submit">Submit</button>
        <button onClick={onClose}>Cancel</button>
      </form>
      {errors.name && <p>{errors.name.message}</p>}
      {selectError && <p>{selectError}</p>}
    </>
  );
};

export default Group;

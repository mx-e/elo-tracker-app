import { Link, useParams } from "react-router-dom";
import { useFirebaseQuery } from "../api/use-firebase-query";
import { RequestStates } from "../utils/utils";
import { useEffect, useState } from "react";
import { api } from "../api/api";

const Ranking = () => {
  let { groupId } = useParams();
  const [groupData, requestState,] = useFirebaseQuery(
    "groupData/" + groupId + "/"
  );
  const [rankingData, setRankingData] = useState(null);
  useEffect(() => {
    if (groupData) {
      api.getRanking(groupData.name, groupData).then((response) => {
        setRankingData(JSON.parse(response.data));
      });
    }
  }, [groupData]);

  if (!groupData || !rankingData || requestState === RequestStates.LOADING)
    return (
      <>
        <Link to={"/" + groupId}>back to group</Link>
        <h1>Ranking</h1>
        <h1>Loading...</h1>
      </>
    );

  const { name, games, players } = groupData;

  const [, { timestamp }] = Object.entries(games).sort(
    ([key1, value1], [key2, value2]) =>
      value2.timestamp.localeCompare(value1.timestamp)
  )[0];
  const lastTimestamp = timestamp;
  return (
    <div>
      <Link to={"/" + groupId}>back to group</Link>
      <h1>Ranking of {name} players</h1>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Score</th>
            <th>Uncertainty</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(players)
            .sort(([key_a], [key_b]) =>
              rankingData[key_a][lastTimestamp].mu >
                rankingData[key_b][lastTimestamp].mu
                ? -1
                : 1
            )
            .map(([key, { name }], i) => (
              <tr key={key}>
                <td>{i}</td>
                <td>{name}</td>
                <td>{rankingData[key][lastTimestamp].mu.toFixed(2)}</td>
                <td>{rankingData[key][lastTimestamp].sigma.toFixed(2)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Ranking;

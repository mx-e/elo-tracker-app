import { testDB } from "./api/api";
import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import Group from "./pages/group";
import GroupList from "./pages/group-list";
import Ranking from "./pages/ranking";

const App = () => {
  useEffect(() => testDB(), []);

  return (
    <Routes>
      <Route index element={<GroupList />} />
      <Route path=":groupId" element={<Group />} />
      <Route path=":groupId/ranking/" element={<Ranking />} />
    </Routes>
  );
};

export default App;

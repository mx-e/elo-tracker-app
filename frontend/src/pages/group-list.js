import { useState } from "react";
import { RequestStates } from "../utils/utils";
import { api, createApiErrorHandler } from "../api/api";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useFirebaseQuery } from "../api/use-firebase-query";

const GroupList = () => {
  const [groups, requestState, setRequestState] = useFirebaseQuery("groups/");
  const [addingGroup, setAddingGroup] = useState(false);

  const handleNewFormClose = () => {
    setAddingGroup(false);
  };

  const handleNewFormSubmit = (data) => {
    setAddingGroup(false);
    setRequestState(RequestStates.LOADING);
    api
      .addNewGroup(data.name)
      .catch(
        createApiErrorHandler(() => setRequestState(RequestStates.FAILED))
      );
  };

  return (
    <>
      <h1>Game Groups</h1>
      {groups && requestState === RequestStates.IDLE ? (
        <>
          <ul>
            {Object.entries(groups)
              .sort(([key1, group1], [key2, group2]) =>
                group1.name.localeCompare(group2.name)
              )
              .map(([key, group]) => (
                <li key={key}>
                  {group.name} <Link to={"/" + key}> details...</Link>
                </li>
              ))}
          </ul>
          <button onClick={() => setAddingGroup(true)}>add group</button>
          {addingGroup && (
            <NewGroupForm
              onClose={handleNewFormClose}
              onSubmit={handleNewFormSubmit}
              currentData={groups}
            />
          )}
        </>
      ) : (
        <h3>Loading...</h3>
      )}
    </>
  );
};

const NewGroupForm = ({ onClose, onSubmit, currentData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const groupNames = Object.values(currentData).map((group) => group.name);
  const validateName = (name) => !groupNames.includes(name);
  return (
    <>
      <h3>New group</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register("name", {
            required: "Name is required!",
            validate: (name) => validateName(name) || "Name already taken!",
          })}
          placeholder="Group Name"
        />
        <input type="submit" />
        <button onClick={onClose}>Cancel</button>
      </form>
      {errors.name && <p>{errors.name.message}</p>}
    </>
  );
};
export default GroupList;

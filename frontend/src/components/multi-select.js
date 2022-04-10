import { useState } from "react";
import styled from "styled-components";

const MultiSelectWrap = styled.div`
  display: block;
  width: 350px;
  margin-top: 20px;
`;

const PillListWrap = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 25px;
  flex-wrap: wrap;
`;

const Pill = styled.p`
  background-color: ${({ color }) => (color ? color : "lightgrey")};
  cursor: pointer;
  margin: 1px;
  border-radius: 2px;
  padding: 1px;
`;

const FauxInputWrap = styled.div`
  border: solid black 1px;
  border-radius: 3px;
  width: 250px;
`;
const MultiSelect = ({
  refVal,
  optionList,
  label,
  highlightColor = "lightblue",
}) => {
  const [selectedItems, setSelectedItems] = useState([]);

  const handleSelect = (item) => {
    if (!selectedItems.includes(item)) {
      setSelectedItems([...selectedItems, item]);
      refVal.current.push(item);
    }
  };

  const handleDeselect = (item) => {
    setSelectedItems(
      selectedItems.filter((selectedItem) => selectedItem !== item)
    );
    refVal.current = refVal.current.filter((refItem) => refItem !== item);
  };
  return (
    <MultiSelectWrap>
      <PillListWrap>
        {optionList
          .filter((option) => !selectedItems.includes(option))
          .map((option) => (
            <Pill onClick={() => handleSelect(option)} key={option}>
              {option}
            </Pill>
          ))}
      </PillListWrap>
      {label}
      <FauxInputWrap>
        <PillListWrap>
          {selectedItems.map((option) => (
            <Pill
              onClick={() => handleDeselect(option)}
              key={option}
              color={highlightColor}
            >
              {option}
            </Pill>
          ))}
        </PillListWrap>
      </FauxInputWrap>
    </MultiSelectWrap>
  );
};

export default MultiSelect;

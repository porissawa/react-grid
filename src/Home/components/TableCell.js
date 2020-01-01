import React from 'react';
import styled from 'styled-components';

import { colors } from '../../utils/styles';

// styled components
const Cell = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;;
  align-items: center;
  width: calc(100% / 6);
  min-width: 100px;
  padding: 4px;
  border: 1px solid ${colors.grayLight};
  font-size: 18px;
  background-color: ${colors.grayLighter};
  /* overflow: hidden; */
`;

function TableCell({className, text, onClick}) {
  return (
    <Cell className={className} onClick={onClick}>
      <span>{text}</span>
    </Cell>
  )
};

export default TableCell;
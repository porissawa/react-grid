import React from 'react';
import styled from 'styled-components';

import { colors } from '../../utils/styles';

// styled components
const Cell = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: calc(100% / 6);
  min-width: 100px;
  padding: 4px;
  border: 1px solid ${colors.grayLight};
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  background-color: ${colors.grayLighter};
  white-space: nowrap;
  overflow: hidden;
`;

function TableCell({className, text, onClick, style}) {
  return (
    <Cell className={className} onClick={onClick} style={style}>
      {text}
    </Cell>
  )
};

export default TableCell;
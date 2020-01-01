import React from 'react';
import styled from 'styled-components';

// project imports

// styled components
const Container = styled.div`
  display: flex;
  width: 100%;
  height: ${props => props.isHeader ? '50px' : '30px'};
`;

function Row({className, children, onClick, isHeader}) {
  return (
    <Container className={className} onClick={onClick} isHeader={isHeader}>
      {children}
    </Container>
  )
}
export default Row;
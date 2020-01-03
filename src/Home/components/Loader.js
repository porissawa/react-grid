import React from 'react';
import styled, { keyframes } from 'styled-components';

const ldsDualRing = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
}`

const Spinner = styled.div`
  display: inline-block;
  width: 80px;
  height: 80px;

  & {
    content: " ";
    display: block;
    width: 64px;
    height: 64px;
    margin: 8px;
    border-radius: 50%;
    border: 6px solid #fff;
    border-color: #ed1d24 transparent #888 transparent;
    animation: ${ldsDualRing} 1.2s linear infinite;
  }
`;

const Loader = () => <Spinner />

export default Loader;
import React, { useRef } from 'react';
import styled from 'styled-components';

// project imports
import { colors } from '../../utils/styles';

// styled components
const ContainerBox = styled.form`
  display: flex;
  align-items: center;
  width: 100%;
  height: 56px;
  padding: 0 16px;
  background-color: white;
  box-shadow: 1px 1px 5px ${colors.grayDark};
  border-radius: 16px;
  @media (max-width: 320px) {
    padding: 8px;
  }
`;

const SInput = styled.input`
  flex: 1;
  padding: 0;
  border: 0 none;
  font-size: 15px;
  line-height: 56px;
`;

const ClearBtn = styled.button.attrs({
  type: 'button',
})`
  width: 24px;
  height: 24px;
  padding: 4px;
  border: 0 none;
  border-radius: 50%;
  margin-left: 16px;
  background: ${colors.grayLight};
`;

function SearchBar({
  className,
  onChange,
  onSubmit,
  onClear,
  placeholder,
  value,
}) {
  const inputEl = useRef(null);

  const submit = e => {
    onSubmit(e);
  };

  return (
    <ContainerBox className={className} onSubmit={submit}>
      <SInput
        ref={inputEl}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {value && (
        <ClearBtn onClick={onClear}>
          X
        </ClearBtn>
      )}
    </ContainerBox>
  );
}

export default SearchBar;
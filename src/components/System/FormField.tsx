import React from 'react';
import { Input, Select } from 'antd';
import styled from '@emotion/styled';
import { useTheme } from '../../context/ThemeContext';

interface FormFieldProps {
  label?: string;
  children: React.ReactNode;
  required?: boolean;
}

const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FieldLabel = styled.label<{ isDark?: boolean; isRequired?: boolean }>`
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)'};
  display: flex;
  align-items: center;
  gap: 4px;

  ${props => props.isRequired && `
    &::before {
      content: '*';
      color: #ff4d4f;
      margin-right: 2px;
    }
  `}
`;

interface StyledInputProps extends React.ComponentProps<typeof Input> {
  isDark?: boolean;
}

interface StyledSelectProps extends React.ComponentProps<typeof Select> {
  isDark?: boolean;
}

const StyledInput: React.FC<StyledInputProps> = ({ isDark, className, ...props }) => {
  return <Input className={`styled-input ${className || ''}`} {...props} />;
};

const StyledSelect: React.FC<StyledSelectProps> = ({ isDark, className, ...props }) => {
  return <Select className={`styled-select ${className || ''}`} {...props} />;
};

const FormField: React.FC<FormFieldProps> = ({ label, children, required }) => {
  const { isDarkMode } = useTheme();

  return (
    <FieldWrapper>
      {label && <FieldLabel isDark={isDarkMode} isRequired={required}>{label}</FieldLabel>}
      {children}
    </FieldWrapper>
  );
};

export { StyledInput, StyledSelect };
export default FormField;

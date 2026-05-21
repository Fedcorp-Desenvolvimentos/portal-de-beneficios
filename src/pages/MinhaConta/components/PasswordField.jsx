import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import * as S from '../MinhaContaStyles';

const PasswordField = ({ 
  label, 
  value, 
  onChange, 
  disabled, 
  placeholder,
  id 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <S.FormField>
      <S.Label htmlFor={id}>{label}</S.Label>
      <S.InputWrapper>
        <S.Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={disabled ? "editing-mode" : ""}
        />
        <S.PasswordToggle
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </S.PasswordToggle>
      </S.InputWrapper>
    </S.FormField>
  );
};

export default PasswordField;
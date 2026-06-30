import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaArrowRight,
  FaColumns,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaFileUpload,
  FaLock,
  FaShieldAlt,
} from 'react-icons/fa';

import { useAuth } from '../../context/AuthContext';
import { useGlobal } from '../../context/GlobalContext';
import * as S from './LoginStyles';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { loading } = useGlobal();
  const { login } = useAuth();
  const navigate = useNavigate();

  const canSubmit = useMemo(
    () => email.trim().length >= 3 && password.trim().length >= 6,
    [email, password]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!canSubmit || loading) return;

    try {
      const result = await login({
        email: email.trim(),
        password,
      });

      if (!result.success) {
        setError(result.error || 'Falha ao autenticar.');
        return;
      }

      navigate(result.user?.tipo === 'fat' ? '/dashboard' : '/home', {
        replace: true,
      });
    } catch (err) {
      console.error('Erro de login no componente:', err);
      setError('Ocorreu um erro inesperado durante o login.');
    }
  };

  return (
    <S.Page>
      <S.BrandSide aria-hidden="true">
        <S.BrandInner>
          <S.BrandLogoWrap>
            <S.BrandLogo src="/assets/logo-negativo.png" alt="Logo FedCorp" />
          </S.BrandLogoWrap>

          <S.BrandCopy>
            <h1>
              Plataforma
              <br />
              FedHub Benefícios
            </h1>
            <p>
              Gerencie faturas, pagamentos e status dos condomínios em um único
              lugar.
            </p>
          </S.BrandCopy>

          <S.Features>
            <S.FeatureItem>
              <S.FeatureIcon>
                <FaShieldAlt />
              </S.FeatureIcon>
              <div>
                <strong>Acesso seguro por perfil</strong>
                <span>Segurança e informações dos dados.</span>
              </div>
            </S.FeatureItem>

            <S.FeatureItem>
              <S.FeatureIcon>
                <FaFileUpload />
              </S.FeatureIcon>
              <div>
                <strong>Import & revisão de faturas</strong>
                <span>Extração automática via PDF, revise o faturamento.</span>
              </div>
            </S.FeatureItem>

            <S.FeatureItem>
              <S.FeatureIcon>
                <FaColumns />
              </S.FeatureIcon>
              <div>
                <strong>Acompanhamento visual</strong>
                <span>Acompanhe cada status, do faturamento ao pagamento</span>
              </div>
            </S.FeatureItem>
          </S.Features>
        </S.BrandInner>
      </S.BrandSide>

      <S.FormSide>
        <S.FormInner>
          <S.FormHeader>
            <h2>Bem-vindo de volta</h2>
            <p>Acesse sua conta para continuar</p>
          </S.FormHeader>

          <S.Form onSubmit={handleSubmit} noValidate autoComplete="off">
            <S.Field>
              <S.Label htmlFor="email">E-mail</S.Label>
              <S.InputWrap>
                <S.InputIcon>
                  <FaEnvelope />
                </S.InputIcon>
                <S.Input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={loading}
                  required
                />
              </S.InputWrap>
            </S.Field>

            <S.Field>
              <S.Label htmlFor="password">Senha</S.Label>
              <S.InputWrap>
                <S.InputIcon>
                  <FaLock />
                </S.InputIcon>
                <S.Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                  required
                />
                <S.PeekButton
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </S.PeekButton>
              </S.InputWrap>
            </S.Field>

            <S.Row>
              <S.Checkbox>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  disabled={loading}
                />
                <span>Manter conectado</span>
              </S.Checkbox>

              <S.MutedLink as={Link} to="/esqueci-senha">
                Esqueci minha senha
              </S.MutedLink>
            </S.Row>

            <S.SubmitButton type="submit" disabled={loading || !canSubmit}>
              <span>{loading ? 'Entrando...' : 'Entrar'}</span>
              {!loading && <FaArrowRight />}
            </S.SubmitButton>

            <S.Feedback $visible={Boolean(error)}>{error}</S.Feedback>
          </S.Form>

          <S.FormFooter>
            <small>
              Ao continuar, você concorda com os termos internos de uso da
              plataforma FedCorp.
            </small>
          </S.FormFooter>
        </S.FormInner>
      </S.FormSide>
    </S.Page>
  );
};

export default Login;

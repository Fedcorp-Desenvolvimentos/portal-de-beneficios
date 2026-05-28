// src/pages/Login/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import * as S from './LoginStyles';
import { GoogleLogin } from '@react-oauth/google';
import { useGlobal } from '../../context/GlobalContext';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { loading, setLoading } = useGlobal();
    const { user, login, loginGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        
        try {
            const result = await login({ email, password });

            // console.log("result em login: ", result)

            console.log("Tipo do usuário:", result.user?.tipo);

            if (result.success && result.user?.tipo === "fat") {
                navigate('/dashboard');
            } else if (result.success && result.user?.tipo === "adm") {
                navigate('/home');
            } else {
                setError(result.error || 'Falha no login. Verifique suas credenciais.');
            }
        } catch (err) {
            setError('Ocorreu um erro inesperado durante o login.');
            console.error('Erro de login no componente:', err);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setError(null);
        
        try {
            console.log('Google credential received');
            
            const result = await loginGoogle(credentialResponse.credential);

            if (result.success) {
                navigate('/home');
            } else {
                setError(result.error || 'Falha no login com Google');
            }
        } catch (err) {
            console.error('Google login error:', err);
            setError('Erro ao autenticar com Google. Tente novamente.');
        }
    };

    const handleGoogleError = () => {
        console.error('Google login failed');
        setError('Erro no login com Google. Tente novamente ou use email/senha.');
    };

    return (
        <>
            <S.GradientBg />
            
            <S.LoginWrapper>
                <S.LoginContainer>
                    <S.LoginBox>
                        <S.LogoImg 
                            src="/imagens/LOGO.png"
                            alt="Fedcorp Logo"
                        />
                        
                        <S.Title>Portal de Benefícios</S.Title>
                        <S.Subtitle>Insira seus dados para acessar a plataforma</S.Subtitle>

                        <S.Form onSubmit={handleSubmit}>
                            <S.InputGroup>
                                <S.Label htmlFor="email">E-mail:</S.Label>
                                <S.Input
                                    type="email"
                                    id="email"
                                    placeholder="Digite seu e-mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </S.InputGroup>

                            <S.InputGroup>
                                <S.Label htmlFor="password">Senha:</S.Label>
                                <S.PasswordWrapper>
                                    <S.Input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        placeholder="Digite sua senha"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                    <S.TogglePasswordButton
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </S.TogglePasswordButton>
                                </S.PasswordWrapper>
                            </S.InputGroup>

                            {error && (
                                <S.ErrorMessage>
                                    {error}
                                </S.ErrorMessage>
                            )}

                            <S.LoginButton type="submit" disabled={loading}>
                                {loading ? 'Entrando...' : 'Entrar'}
                            </S.LoginButton>

                            {/* <S.Divider>
                                <span>ou</span>
                            </S.Divider>

                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                useOneTap={false}
                                theme="outline"
                                size="large"
                                text="continue_with"
                                shape="rectangular"
                            /> */}

                            <S.ForgotPassword href="/recuperar-senha">
                                Esqueceu sua senha?
                            </S.ForgotPassword>
                        </S.Form>
                    </S.LoginBox>
                </S.LoginContainer>
            </S.LoginWrapper>
        </>
    );
};

export default Login;
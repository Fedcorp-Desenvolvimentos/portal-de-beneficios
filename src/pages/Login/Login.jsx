import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useGlobal } from '../../context/GlobalContext';
import * as S from './LoginStyles';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { loading, setLoading } = useGlobal();
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        
        try {

            const result = await login({ email, password });

            if (result.success) {
                navigate('/home');
            } else {
                setError(result.error || 'Falha no login. Verifique suas credenciais.');
            }
        } catch (err) {
            setError('Ocorreu um erro inesperado durante o login.');
            console.error('Erro de login no componente:', err);
        } finally {
            setLoading(false);
        }
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
                                />
                            </S.InputGroup>

                            <S.InputGroup>
                                <S.Label htmlFor="password">Password:</S.Label>
                                <S.PasswordWrapper>
                                    <S.Input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        placeholder="Digite sua password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
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

                            <S.ForgotPassword href="/recuperar-password">
                                Esqueceu sua password?
                            </S.ForgotPassword>
                        </S.Form>
                    </S.LoginBox>
                </S.LoginContainer>
            </S.LoginWrapper>
        </>
    );
};

export default Login;
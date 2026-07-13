import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import * as S from "./ResetarSenhaStyles";
import { 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaKey,
  FaShieldAlt,
  FaHourglassHalf,
  FaExclamationTriangle,
  FaCheckCircle
} from "react-icons/fa";
import api from "../../services/api";

const ResetarSenha = () => {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValido, setTokenValido] = useState(false);
  const [validandoToken, setValidandoToken] = useState(true);
  const [email, setEmail] = useState("");
  
  const { token } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const validarToken = async () => {
      if (!token) {
        setTokenValido(false);
        setValidandoToken(false);
        enqueueSnackbar("Link de recuperação inválido.", { variant: "error" });
        return;
      }
      
      try {
        const response = await api.get(`/api/users/validar-token-reset/${token}/`);
        
        if (response.data.valid === true) {
          setTokenValido(true);
          setEmail(response.data.email || "");
        } else {
          setTokenValido(false);
          enqueueSnackbar(response.data.detail || "Link de recuperação inválido ou expirado.", { variant: "error" });
        }
      } catch (err) {
        setTokenValido(false);
        enqueueSnackbar(err.response?.data?.detail || "Link de recuperação inválido ou expirado.", { variant: "error" });
      } finally {
        setValidandoToken(false);
      }
    };

    validarToken();
  }, [token, enqueueSnackbar]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!novaSenha || novaSenha.length < 6) {
      enqueueSnackbar("A senha deve ter no mínimo 6 caracteres.", { variant: "error" });
      return;
    }

    if (novaSenha !== confirmarSenha) {
      enqueueSnackbar("As senhas não coincidem.", { variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/users/resetar-senha/", {
        token: token,
        nova_senha: novaSenha
      });
      
      enqueueSnackbar("Senha redefinida com sucesso! Redirecionando para o login...", { variant: "success" });
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.detail || "Erro ao redefinir senha.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Estado de carregamento - validando token
  if (validandoToken) {
    return (
      <>
        <S.GradientBg />
        <S.Container>
          <S.Card>
            <S.VerificandoContainer>
              <S.VerificandoAnimation>
                <S.CircleCheck>
                  <S.CheckmarkSvg viewBox="0 0 52 52">
                    <S.CheckmarkCircle cx="26" cy="26" r="25" fill="none" />
                    <S.CheckmarkCheck fill="none" d="M14 27l7 7 16-16" />
                  </S.CheckmarkSvg>
                  <S.PulseRing />
                </S.CircleCheck>
              </S.VerificandoAnimation>
              
              <S.VerificandoTitle>Validando link de recuperação</S.VerificandoTitle>
              
              <S.VerificandoSteps>
                <S.Step $delay="0.2s">
                  <FaShieldAlt />
                  <span>Verificando token...</span>
                </S.Step>
                <S.Step $delay="0.6s">
                  <FaHourglassHalf />
                  <span>Checando expiração...</span>
                </S.Step>
              </S.VerificandoSteps>
              
              <S.VerificandoText>Por favor, aguarde um momento</S.VerificandoText>
            </S.VerificandoContainer>
          </S.Card>
        </S.Container>
      </>
    );
  }

  // Token inválido
  if (!tokenValido) {
    return (
      <>
        <S.GradientBg />
        <S.Container>
          <S.Card>
            <S.ErrorState>
              <FaExclamationTriangle />
              <h2>Link inválido ou expirado</h2>
              <p>O link de recuperação de senha que você acessou é inválido ou já expirou.</p>
              <S.ButtonGroup>
                <S.PrimaryButton onClick={() => navigate("/recuperar-senha")}>
                  Solicitar novo link
                </S.PrimaryButton>
                <S.SecondaryButton onClick={() => navigate("/login")}>
                  Voltar para o login
                </S.SecondaryButton>
              </S.ButtonGroup>
            </S.ErrorState>
          </S.Card>
        </S.Container>
      </>
    );
  }

  // Token válido - mostrar formulário
  return (
    <>
      <S.GradientBg />
      
      <S.Container>
        <S.Card>
          <S.LogoWrapper>
            <S.LogoImg src="/imagens/LOGO.png" alt="Fedcorp Logo" />
          </S.LogoWrapper>

          <S.Title>Redefinir Senha</S.Title>
          <S.Subtitle>Digite sua nova senha abaixo</S.Subtitle>

          {email && (
            <S.InfoBox>
              <FaCheckCircle />
              <p>Redefinindo senha para: <strong>{email}</strong></p>
            </S.InfoBox>
          )}

          <S.InfoBox>
            <FaCheckCircle />
            <p>
              Crie uma senha forte e segura para sua conta.
            </p>
          </S.InfoBox>

          <S.Form onSubmit={handleSubmit}>
            <S.InputGroup>
              <S.Label htmlFor="novaSenha">
                <FaLock />
                Nova senha
              </S.Label>
              <S.PasswordWrapper>
                <S.Input
                  type={showPassword ? "text" : "password"}
                  id="novaSenha"
                  placeholder="Digite sua nova senha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                  disabled={loading}
                />
                <S.ToggleButton
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </S.ToggleButton>
              </S.PasswordWrapper>
              <S.PasswordHint>Mínimo de 6 caracteres</S.PasswordHint>
            </S.InputGroup>

            <S.InputGroup>
              <S.Label htmlFor="confirmarSenha">
                <FaKey />
                Confirmar nova senha
              </S.Label>
              <S.PasswordWrapper>
                <S.Input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmarSenha"
                  placeholder="Confirme sua nova senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                  disabled={loading}
                />
                <S.ToggleButton
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </S.ToggleButton>
              </S.PasswordWrapper>
            </S.InputGroup>

            <S.SubmitButton type="submit" disabled={loading}>
              {loading ? "Redefinindo, aguarde..." : "Redefinir senha"}
            </S.SubmitButton>
          </S.Form>
        </S.Card>
      </S.Container>
    </>
  );
};

export default ResetarSenha;
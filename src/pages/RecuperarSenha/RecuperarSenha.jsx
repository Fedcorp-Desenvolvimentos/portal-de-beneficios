import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import * as S from "./RecuperarSenhaStyles";
import { 
  FaEnvelope, 
  FaInfoCircle, 
  FaPaperPlane, 
  FaArrowLeft,
  FaSpinner
} from "react-icons/fa";
import api from "../../services/api";

const RecuperarSenha = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleVoltarLogin = () => {
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      enqueueSnackbar("Por favor, informe seu e-mail.", { variant: "error" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      enqueueSnackbar("Por favor, informe um e-mail válido.", { variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("solicitar-reset-senha/", { email });
      // await new Promise(resolve => setTimeout(resolve, 2000));
      enqueueSnackbar(
        res?.message || "Enviamos um link de recuperação para o seu e-mail. Verifique sua caixa de entrada e spam.",
        { variant: "success" }
      );
      setEmail("");
    } catch (err) {
      enqueueSnackbar(
        err?.response?.data?.message || "Falha ao solicitar recuperação de senha. Tente novamente mais tarde.",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <S.GradientBg />
      
      <S.Container>
        <S.Card>
          <S.LogoWrapper>
            <S.LogoImg src="/imagens/LOGO.png" alt="Fedcorp Logo" />
          </S.LogoWrapper>

          <S.Title>Esqueceu sua senha?</S.Title>
          <S.Subtitle>Recupere o acesso à sua conta</S.Subtitle>

          <S.InfoBox>
            <FaInfoCircle />
            <p>
              Digite seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
            </p>
          </S.InfoBox>

          <S.Form onSubmit={handleSubmit}>
            <S.InputGroup>
              <S.Label htmlFor="email">
                <FaEnvelope />
                E-mail
              </S.Label>
              <S.Input
                type="email"
                id="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                disabled={loading}
              />
            </S.InputGroup>

            <S.SubmitButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <FaSpinner style={{ animation: 'spin 0.8s linear infinite' }} />
                  Enviando...
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  Enviar link de recuperação
                </>
              )}
            </S.SubmitButton>
          </S.Form>

          <S.BackButton type="button" onClick={handleVoltarLogin}>
            <FaArrowLeft />
            Voltar para o login
          </S.BackButton>
        </S.Card>
      </S.Container>
    </>
  );
};

export default RecuperarSenha;
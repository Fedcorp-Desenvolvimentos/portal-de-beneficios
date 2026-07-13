import React, { useState } from 'react';
import Carousel from "../../../components/Carousel";
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import logo from "../../../public/imagens/LOGO.png";
import '../../../styles/Login.css';
import { useSnackbar } from 'notistack';
import { solicitarResetSenha } from '../../../services/userService';

export default function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email) {
      enqueueSnackbar('Por favor, informe seu e-mail.', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const response = await solicitarResetSenha(email);
      
      if (response.success) {
        enqueueSnackbar(
          response.data.message || 'E-mail enviado! Verifique sua caixa de entrada.',
          { variant: 'success' }
        );
      } else {
        enqueueSnackbar(response.error, { variant: 'error' });
      }
      
      // Limpa o campo
      setEmail('');
      
      // Redireciona para o login após alguns segundos
      setTimeout(() => {
        navigate('/login');
      }, 5000);
      
    } catch (error) {
      console.error('Erro ao solicitar reset:', error);
      enqueueSnackbar(
        error.response?.data?.detail || 'Erro ao enviar solicitação. Tente novamente.',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  }

  function handleVoltar() {
    navigate('/login');
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-left">
          <div className="login-brand">
            <img src={logo} alt="Logo" className="logoImg" />
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <h2 className="login-title">Recuperar senha</h2>
            <p className="login-subtitle">
              Informe o e-mail cadastrado para enviarmos as instruções.
            </p>

            <div className="field">
              <label>E-mail</label>
              <div className="input-group">
                <input
                  type="email"
                  className="input"
                  placeholder="seuemail@empresa.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="button primary" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar instruções'}
            </button>

            <button
              type="button"
              className="voltar-btn"
              onClick={handleVoltar}
              disabled={loading}
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
          </form>
        </div>

        <div className="login-right">
          <Carousel interval={3500} />
        </div>
      </div>
    </div>
  );
}
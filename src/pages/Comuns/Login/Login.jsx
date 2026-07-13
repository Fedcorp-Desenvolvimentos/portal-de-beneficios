import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import logo from "../../../public/imagens/LOGO.png";

import "../../../styles/Login.css"
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(String(email ?? "").trim(), String(password ?? ""), "/Home");

    } catch (err) {
      console.error("Erro de login no componente:", err);

      const status = err?.response?.status;
      const msg = String(err?.response?.data?.message || err?.message || "").toLowerCase();

      if (
        status === 401 ||
        msg.includes("usuário") ||
        msg.includes("usuario") ||
        msg.includes("não encontrado") ||
        msg.includes("não encontrado")
      ) {
        setError("Senha incorreta. Tente novamente ou recupere sua senha.")
      } else if (
        status === 404 ||
        msg.includes("Usuário") ||
        msg.includes("Usuario") ||
        msg.includes("não encontrado") ||
        msg.includes("nao encontrado")
      ) {
        setError("Usuário não cadastrado.")
      } else {
        setError("Ocorreu um erro inesperado durante o login")
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="gradient-bg"></div>

      <div className="login-wrapper">
        <div className="loginContainer">
          <div className="loginBox">
            <img src={logo} alt="Logo" className="logoImg" />

            <h2 className="titlePortal">Portal de Benefícios</h2>
            <p className="pPortal">Insira seus dados para acessar a plataforma</p>

            <form onSubmit={handleSubmit}>
              <div className="inputGroup">
                <label htmlFor="email">E-mail:</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="inputGroup senhaGroup">
                <label htmlFor="senha">Senha:</label>

                <div className="senhaWrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="senha"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="togglePassword"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {error && <p className="error-message">{error}</p>}

              <button type="submit" className="loginButton" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </button>

              <Link to="/esqueci-senha" className="forgot-password">
                Esqueceu sua senha?
              </Link>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
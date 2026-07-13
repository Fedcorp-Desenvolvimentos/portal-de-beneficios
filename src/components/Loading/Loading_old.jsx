// src/components/Loading/Loading.jsx
import * as S from './LoadingStyles';
import LOGO from './LOGO.png';

const Loading = ({ 
  fullScreen = false, 
  message = 'Carregando...',
  progress = 0  // NOVO - recebe progresso real
}) => {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const LoadingContent = () => (
    <S.Container>
      <S.LogoWrapper>
        <S.LogoImg 
          src={LOGO}
          alt="Logo" 
          onError={(e) => {
            console.error('Erro ao carregar logo:', LOGO);
            e.target.style.display = 'none';
          }}
        />
        
        <S.ProgressSvg viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="4"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#2463eb"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.3s ease' // animação suave
            }}
          />
        </S.ProgressSvg>
        
        {/* Mostra porcentagem no centro */}
        {/* <S.PercentageBadge>{Math.round(progress)}%</S.PercentageBadge> */}
      </S.LogoWrapper>
      
      {message && (
        <S.MessageContainer>
          <S.MessageText>{message}</S.MessageText>
        </S.MessageContainer>
      )}
    </S.Container>
  );

  if (fullScreen) {
    return (
      <S.Overlay>
        <LoadingContent />
      </S.Overlay>
    );
  }

  return <LoadingContent />;
};

export default Loading;
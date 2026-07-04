import styles from '../DashboardEquipe.module.css';

export default function WelcomeGreeting({ userName }) {
  if (!userName) return null;

  const firstName = String(userName).trim().split(' ')[0];

  const now = new Date();

  const dateStrRaw = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const dateStr = dateStrRaw.charAt(0).toUpperCase() + dateStrRaw.slice(1);

  return (
    <div className={styles['ps-welcome']}>
      <div>
        <h2 className={styles['ps-greeting']}>
          Bem-vindo(a), {firstName}
        </h2>

        <p className={styles['ps-date']}>{dateStr}</p>
      </div>
    </div>
  );
}
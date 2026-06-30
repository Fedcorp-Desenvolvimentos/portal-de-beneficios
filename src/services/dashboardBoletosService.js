function getDefaultDashboardBoletosUrl() {
  const port = import.meta.env.VITE_DASHBOARD_BOLETOS_PORT || '3001';
  if (typeof window === 'undefined') return `http://localhost:${port}`;
  return `${window.location.protocol}//${window.location.hostname}:${port}`;
}

function getDashboardBoletosBaseUrl() {
  return (
    import.meta.env.VITE_DASHBOARD_BOLETOS_API_URL ||
    import.meta.env.VITE_DASHBOARD_BOLETOS_URL ||
    getDefaultDashboardBoletosUrl()
  ).replace(/\/$/, '');
}

async function request(path, options = {}) {
  const baseUrl = getDashboardBoletosBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '');

  if (!response.ok) {
    const message =
      data?.message ||
      data?.detail ||
      `Dashboard Boletos respondeu com status ${response.status}.`;

    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const dashboardBoletosService = {
  getBaseUrl: getDashboardBoletosBaseUrl,
  health() {
    return request('/health');
  },
  listarFaturas() {
    return request('/api/faturas');
  },
  listarBoletos() {
    return request('/api/boletos');
  },
};

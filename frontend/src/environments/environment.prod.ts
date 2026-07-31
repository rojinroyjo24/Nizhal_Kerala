declare var process: any;

export const environment = {
  production: true,
  apiUrl: (window as any).__env?.apiUrl || (typeof process !== 'undefined' && process?.env?.['NG_APP_API_URL']) || 'http://localhost:8000/api',
};


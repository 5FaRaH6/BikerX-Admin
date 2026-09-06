export function handleUnauthorized(response) {
  if (response.status === 401) {
    localStorage.removeItem('adminToken');
    window.location.href = '/login';

    return true;
  }

  return false;
}
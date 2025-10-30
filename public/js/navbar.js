async function logout() {
  try {
    const response = await fetch('/api/users/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    if (response.ok && data.redirectUrl) {
      window.location.href = data.redirectUrl;
    } else {
      console.error('Logout malsucedido:', data.message || 'Unknown error');
    }
  } catch (err) {
    console.error('Error durante o logout:', err);
  }
}
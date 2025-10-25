// This is the function your logout button should call
async function logout() {
  try {
    // 1. Make the POST request to your server
    const response = await fetch('/api/users/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 2. Parse the JSON response from the server
    const data = await response.json();

    // 3. Check if the server sent back the redirect URL
    if (response.ok && data.redirectUrl) {
      // 4. Manually redirect the browser
      window.location.href = data.redirectUrl;
    } else {
      console.error('Logout malsucedido:', data.message || 'Unknown error');
    }

  } catch (err) {
    console.error('Error durante o logout:', err);
  }
}
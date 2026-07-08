// We keep all our API calls in one place. 
// We are now loading our base URL from the .env file!
// This makes switching between local development and production super easy.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const authApi = {
  // Login API call
  login: async (phone_number, password) => {
    // FastAPI's OAuth2PasswordRequestForm requires URL encoded form data
    const formData = new URLSearchParams();
    formData.append('username', phone_number);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to login');
    }
    
    return data;
  },

  // Register API call
  register: async (phone_number, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number,
        password
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to register account');
    }
    
    return data;
  }
};

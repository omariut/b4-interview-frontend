// We keep all our API calls in one place. 
// We are now loading our base URL from the .env file!
// This makes switching between local development and production super easy.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Helper for generic fetch wrapper to handle errors consistently
const fetchWithAuth = async (endpoint, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      // Clear token and force redirect if unauthorized
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    throw new Error((data && data.detail) || 'An unexpected error occurred');
  }

  return data;
};

export const authApi = {
  // Login with Google API call
  loginWithGoogle: async (credential) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to login with Google');
    }
    
    return data;
  },

  // Get current user details
  getMe: async () => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user details');
    }
    
    return await response.json();
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

export const cvApi = {
  getStats: () => fetchWithAuth('/cv/stats'),
  getAll: () => fetchWithAuth('/cv/'),
  getById: (id) => fetchWithAuth(`/cv/${id}`),
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    // Don't set Content-Type header manually when sending FormData
    // The browser will automatically set it with the boundary
    return fetchWithAuth('/cv/upload', {
      method: 'POST',
      body: formData
    });
  },
  getPDFBlob: async (id) => {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/cv/${id}/pdf`, { headers });
    if (!response.ok) throw new Error('Failed to fetch PDF');
    return await response.blob();
  },
  delete: async (id) => {
    return fetchWithAuth(`/cv/${id}`, {
      method: 'DELETE',
    });
  },
  getThumbnailBlob: async (id) => {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/cv/${id}/thumbnail`, { headers });
    if (!response.ok) throw new Error('Failed to fetch thumbnail');
    return await response.blob();
  }
};

export const interviewApi = {
  getAllQuestions: () => fetchWithAuth('/interview/questions/all'),
  getQuestionById: (id) => fetchWithAuth(`/interview/questions/${id}`),
  submitAnswer: (questionId, answer_text) => {
    return fetchWithAuth(`/interview/questions/${questionId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ answer_text })
    });
  },
  submitFeedback: (answerId, feedback_rating) => {
    return fetchWithAuth(`/interview/answers/${answerId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ feedback_rating })
    });
  }
};

export const adminApi = {
  getCosts: () => fetchWithAuth('/admin/costs'),
};

// We keep all our API calls in one place. 
// We are now loading our base URL from the .env file!
// This makes switching between local development and production super easy.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8050';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
};

// Helper for generic fetch wrapper to handle errors consistently
const fetchWithAuth = async (endpoint, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken })
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('access_token', refreshData.access_token);
            if (refreshData.refresh_token) {
              localStorage.setItem('refresh_token', refreshData.refresh_token);
            }
            onRefreshed(refreshData.access_token);
          } else {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            onRefreshed(null);
            window.location.href = '/login';
            throw new Error('Session expired');
          }
        } catch (e) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          onRefreshed(null);
          window.location.href = '/login';
          throw e;
        } finally {
          isRefreshing = false;
        }
      }
      
      const newAccessToken = await new Promise(resolve => {
        subscribeTokenRefresh(token => resolve(token));
      });
      
      if (newAccessToken) {
        const newHeaders = {
          ...options.headers,
          'Authorization': `Bearer ${newAccessToken}`
        };
        response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers: newHeaders });
      }
    } else {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }

    if (response.status === 500) {
      window.dispatchEvent(new CustomEvent('server-error', {
        detail: { message: (data && data.detail) || 'Internal server error. Please try again later.' }
      }));
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
    return fetchWithAuth('/auth/me');
  },

  updateProfile: async (data) => {
    return fetchWithAuth('/auth/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
  },

  generateWhatsappLink: async () => {
    return fetchWithAuth('/auth/whatsapp/generate-link', {
      method: 'POST'
    });
  },

  verifyWhatsappOtp: async (otp) => {
    return fetchWithAuth('/auth/whatsapp/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp })
    });
  },

  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Using fetch directly because fetchWithAuth sets default Content-Type sometimes if we're not careful,
    // though here we just need to ensure we don't set Content-Type manually so the browser sets the boundary.
    const response = await fetch(`${API_BASE_URL}/auth/profile-picture`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });
    
    const responseData = await response.json().catch(() => null);
    if (!response.ok) throw new Error(responseData?.detail || 'Failed to upload image');
    return responseData;
  },

  deleteProfilePicture: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/profile-picture`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const responseData = await response.json().catch(() => null);
    if (!response.ok) throw new Error(responseData?.detail || 'Failed to delete profile picture');
    return responseData;
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
  generateIdealAnswer: (questionId) => {
    return fetchWithAuth(`/interview/questions/${questionId}/ideal-answer`, {
      method: 'POST'
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
  },
  reportAnswer: (answerId, report_text) => {
    return fetchWithAuth(`/interview/answers/${answerId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ report_text })
    });
  }
};

export const adminApi = {
  getCosts: () => fetchWithAuth('/admin/costs'),
};

export const subscriptionApi = {
  getSubscription: () => fetchWithAuth('/subscription/'),
  getPaymentHistory: () => fetchWithAuth('/subscription/history'),
  uploadVoucher: async (plan_id, file) => {
    const formData = new FormData();
    formData.append('plan_id', plan_id);
    formData.append('file', file);
    return fetchWithAuth('/subscription/upload-voucher', {
      method: 'POST',
      body: formData
    });
  }
};

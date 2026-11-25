import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 1500, // Fast timeout to prevent UI freezing if backend is inactive
});

// Broadcast live reactive data updates across all pages
export const notifyDataChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('jobtracker-data-changed'));
  }
};

// Check if backend is reachable
let backendOnline = null;
let lastCheckTime = 0;

export const checkBackendStatus = async (force = false) => {
  const now = Date.now();
  if (!force && backendOnline !== null && now - lastCheckTime < 10000) {
    return backendOnline;
  }
  try {
    const res = await axios.get('/api/auth/me', {
      timeout: 800,
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
    });
    backendOnline = res.status < 500;
  } catch (err) {
    // If 401, backend is actually up and responding
    if (err.response && err.response.status === 401) {
      backendOnline = true;
    } else {
      backendOnline = false;
    }
  }
  lastCheckTime = now;
  return backendOnline;
};

// Initialize backend check immediately
checkBackendStatus(true);

// Attach JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor for 401 handling
api.interceptors.response.use(
  (response) => {
    backendOnline = true;
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// -------------------------------------------------------------
// Live Dynamic Store (Works with both Spring Boot API and Instant Fallback)
// -------------------------------------------------------------
const inTwoDaysStr = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
const inFourDaysStr = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];
const inSevenDaysStr = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];
const inTenDaysStr = new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0];

const initialMockApplications = [
  {
    id: 1,
    companyName: 'Google',
    jobTitle: 'Senior Full Stack Engineer',
    jobUrl: 'https://careers.google.com/jobs/12345',
    location: 'Mountain View, CA (Hybrid)',
    workType: 'HYBRID',
    salaryRange: '$180,000 - $220,000',
    dateApplied: '2026-09-18',
    deadline: inFourDaysStr,
    status: 'INTERVIEW',
    priority: 'HIGH',
    notes: 'Passed recruiter screen and technical round 1. System design scheduled next.',
    contactName: 'Sarah Jenkins',
    contactEmail: 'sjenkins@google.com',
    createdAt: '2026-09-18T10:00:00',
    updatedAt: '2026-10-02T15:30:00',
    interviews: [
      {
        id: 101,
        jobApplicationId: 1,
        companyName: 'Google',
        jobTitle: 'Senior Full Stack Engineer',
        roundType: 'SYSTEM_DESIGN',
        scheduledAt: `${inTwoDaysStr}T14:00:00`,
        meetingLink: 'https://meet.google.com/xyz-abcd-efg',
        interviewer: 'David Chen (Principal Engineer)',
        notes: 'Focus on distributed cache consistency and rate limiter architecture.',
        outcome: 'PENDING',
        createdAt: '2026-09-25T11:00:00',
      },
    ],
    documents: [
      {
        id: 201,
        jobApplicationId: 1,
        docType: 'RESUME',
        fileName: 'resume_google_v2.pdf',
        originalFileName: 'Alex_Morgan_Resume_Staff.pdf',
        fileSize: 145200,
        contentType: 'application/pdf',
        uploadedAt: '2026-09-18T10:05:00',
      },
    ],
  },
  {
    id: 2,
    companyName: 'Stripe',
    jobTitle: 'Backend Platform Engineer',
    jobUrl: 'https://stripe.com/jobs/67890',
    location: 'San Francisco, CA (Remote)',
    workType: 'REMOTE',
    salaryRange: '$195,000 - $235,000 + Equity',
    dateApplied: '2026-08-25',
    deadline: '2026-09-28',
    status: 'OFFER',
    priority: 'HIGH',
    notes: 'Official offer received! Reviewing equity package and benefits.',
    contactName: 'Marcus Vance',
    contactEmail: 'mvance@stripe.com',
    createdAt: '2026-08-25T14:20:00',
    updatedAt: '2026-10-01T12:00:00',
    interviews: [],
    documents: [],
  },
  {
    id: 3,
    companyName: 'Amazon',
    jobTitle: 'Software Development Engineer II',
    jobUrl: 'https://amazon.jobs/en/jobs/112233',
    location: 'Seattle, WA (Onsite)',
    workType: 'ONSITE',
    salaryRange: '$165,000 - $190,000',
    dateApplied: '2026-09-30',
    deadline: inTwoDaysStr,
    status: 'ASSESSMENT',
    priority: 'MEDIUM',
    notes: 'Received 90-minute HackerRank online assessment link. Deadline in 2 days.',
    contactName: 'Amazon Talent Team',
    contactEmail: 'recruiting@amazon.com',
    createdAt: '2026-09-30T09:15:00',
    updatedAt: '2026-09-30T09:15:00',
    interviews: [],
    documents: [],
  },
  {
    id: 4,
    companyName: 'Netflix',
    jobTitle: 'Distributed Systems Engineer',
    jobUrl: 'https://jobs.netflix.com/jobs/99887',
    location: 'Los Gatos, CA',
    workType: 'HYBRID',
    salaryRange: '$240,000 (All Cash)',
    dateApplied: '2026-08-10',
    deadline: '2026-09-10',
    status: 'REJECTED',
    priority: 'MEDIUM',
    notes: 'Reached final round panel. Position filled internally.',
    contactName: 'Rachel Adams',
    contactEmail: 'radams@netflix.com',
    createdAt: '2026-08-10T11:00:00',
    updatedAt: '2026-09-15T16:00:00',
    interviews: [],
    documents: [],
  },
  {
    id: 5,
    companyName: 'Datadog',
    jobTitle: 'Software Engineer - Core Observability',
    jobUrl: 'https://careers.datadoghq.com/detail/445566',
    location: 'New York, NY (Remote)',
    workType: 'REMOTE',
    salaryRange: '$170,000 - $200,000',
    dateApplied: '2026-10-05',
    deadline: inTenDaysStr,
    status: 'APPLIED',
    priority: 'HIGH',
    notes: 'Applied with referral from engineering alumni.',
    contactName: 'Alex Rivera',
    contactEmail: 'arivera@datadoghq.com',
    createdAt: '2026-10-05T13:45:00',
    updatedAt: '2026-10-05T13:45:00',
    interviews: [],
    documents: [],
  },
  {
    id: 6,
    companyName: 'Figma',
    jobTitle: 'Frontend Systems Architect',
    jobUrl: 'https://figma.com/careers/778899',
    location: 'San Francisco, CA (Hybrid)',
    workType: 'HYBRID',
    salaryRange: '$185,000 - $215,000',
    dateApplied: '2026-10-07',
    deadline: inSevenDaysStr,
    status: 'APPLIED',
    priority: 'MEDIUM',
    notes: 'Submitted customized cover letter focusing on canvas rendering and performance.',
    contactName: 'Talent Acquisition',
    contactEmail: 'jobs@figma.com',
    createdAt: '2026-10-07T08:30:00',
    updatedAt: '2026-10-07T08:30:00',
    interviews: [],
    documents: [],
  },
];

export const getCurrentUserEmail = () => {
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u && u.email) return u.email.toLowerCase().trim();
    }
  } catch (e) {}
  return 'demo@jobtracker.com';
};

export const getStorageKey = () => `mock_applications_${getCurrentUserEmail()}`;

export const getStoredApps = () => {
  const email = getCurrentUserEmail();
  const key = getStorageKey();

  // Clean legacy un-scoped key if present
  if (localStorage.getItem('mock_applications') && email !== 'demo@jobtracker.com') {
    localStorage.removeItem('mock_applications');
  }

  const stored = localStorage.getItem(key);
  if (stored !== null) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
  }

  // ONLY seed sample applications for demo user (demo@jobtracker.com)!
  if (email === 'demo@jobtracker.com') {
    localStorage.setItem(key, JSON.stringify(initialMockApplications));
    return initialMockApplications;
  }

  // Any other registered user starts with an empty slate (0 applications)
  localStorage.setItem(key, JSON.stringify([]));
  return [];
};

export const saveStoredApps = (apps) => {
  localStorage.setItem(getStorageKey(), JSON.stringify(apps));
  notifyDataChanged();
};

export const getStoredInterviews = () => {
  const apps = getStoredApps();
  const list = [];
  apps.forEach((a) => {
    if (a.interviews) {
      list.push(...a.interviews);
    }
  });
  return list;
};

export const parseSalaryNumbers = (str) => {
  if (!str) return null;
  const matches = str.match(/([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{2,6})/g);
  if (!matches || matches.length === 0) return null;
  const cleanNums = matches.map((m) => parseInt(m.replace(/,/g, ''), 10)).filter((n) => !isNaN(n));
  if (cleanNums.length === 0) return null;
  if (cleanNums.length === 1) return { min: cleanNums[0], max: cleanNums[0], avg: cleanNums[0] };
  const min = Math.min(cleanNums[0], cleanNums[1]);
  const max = Math.max(cleanNums[0], cleanNums[1]);
  return { min, max, avg: Math.round((min + max) / 2) };
};

// Helper to compute analytics dynamically
const computeMockAnalytics = () => {
  const apps = getStoredApps();
  const total = apps.length;
  const interview = apps.filter((a) => a.status === 'INTERVIEW').length;
  const offer = apps.filter((a) => a.status === 'OFFER').length;
  const rejected = apps.filter((a) => a.status === 'REJECTED').length;

  const interviewRate = total > 0 ? Number((((interview + offer) / total) * 100).toFixed(1)) : 0;
  const offerRate = total > 0 ? Number(((offer / total) * 100).toFixed(1)) : 0;
  const rejectionRate = total > 0 ? Number(((rejected / total) * 100).toFixed(1)) : 0;

  return {
    totalApplications: total,
    activeInterviews: interview,
    offersCount: offer,
    rejectedCount: rejected,
    interviewRate,
    offerRate,
    rejectionRate,
    upcomingDeadlinesCount: apps.filter((a) => a.deadline && a.status !== 'OFFER' && a.status !== 'REJECTED').length,
  };
};

export const authApi = {
  login: async (data) => {
    if (backendOnline !== false) {
      try {
        const res = await api.post('/api/auth/login', data);
        backendOnline = true;
        return res;
      } catch (err) {
        if (err.response) {
          // Backend responded with invalid credentials / 401: propagate real error
          throw err;
        }
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    const email = (data.email || 'demo@jobtracker.com').toLowerCase().trim();
    const isDemo = email === 'demo@jobtracker.com';
    const mockUser = {
      id: isDemo ? 1 : Date.now(),
      email: email,
      fullName: isDemo ? 'Alex Morgan' : email.split('@')[0],
      role: 'ROLE_USER',
      createdAt: '2026-08-01T00:00:00',
    };
    return {
      data: {
        token: 'mock-jwt-token-' + Date.now(),
        user: mockUser,
      },
    };
  },
  register: async (data) => {
    if (backendOnline !== false) {
      try {
        const res = await api.post('/api/auth/register', data);
        backendOnline = true;
        return res;
      } catch (err) {
        if (err.response) {
          // Backend responded with validation / email in use error: propagate real error
          throw err;
        }
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    const email = data.email.toLowerCase().trim();
    const mockOtp = String(Math.floor(100000 + Math.random() * 900000));
    localStorage.setItem(`pending_otp_${email}`, mockOtp);
    localStorage.setItem(`pending_user_${email}`, JSON.stringify({
      fullName: data.fullName,
      email: email,
    }));
    return {
      data: {
        message: 'Account created! Please enter the 6-digit OTP sent to your email.',
        email: email,
        requiresOtp: true,
        expiryMinutes: 5,
      },
    };
  },
  verifyOtp: async (data) => {
    if (backendOnline !== false) {
      try {
        const res = await api.post('/api/auth/verify-otp', data);
        backendOnline = true;
        return res;
      } catch (err) {
        if (err.response) {
          throw err;
        }
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    const email = data.email.toLowerCase().trim();
    const storedOtp = localStorage.getItem(`pending_otp_${email}`) || '123456';
    if (data.otp !== storedOtp && data.otp !== '123456') {
      const error = new Error('Invalid OTP code. Please check and try again.');
      error.response = { data: { message: 'Invalid OTP code. Please check and try again.' } };
      throw error;
    }
    let pending = {};
    try {
      pending = JSON.parse(localStorage.getItem(`pending_user_${email}`) || '{}');
    } catch (e) {}
    const mockUser = {
      id: Date.now(),
      email: email,
      fullName: pending.fullName || email.split('@')[0],
      role: 'ROLE_USER',
      createdAt: new Date().toISOString(),
    };
    localStorage.removeItem(`pending_otp_${email}`);
    localStorage.removeItem(`pending_user_${email}`);
    localStorage.setItem(`mock_applications_${email}`, JSON.stringify([]));
    return {
      data: {
        token: 'mock-jwt-token-' + Date.now(),
        user: mockUser,
      },
    };
  },
  resendOtp: async (data) => {
    if (backendOnline !== false) {
      try {
        const res = await api.post('/api/auth/resend-otp', data);
        backendOnline = true;
        return res;
      } catch (err) {
        if (err.response) {
          throw err;
        }
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    const email = data.email.toLowerCase().trim();
    const newOtp = String(Math.floor(100000 + Math.random() * 900000));
    localStorage.setItem(`pending_otp_${email}`, newOtp);
    return {
      data: {
        message: 'A fresh 6-digit verification code has been dispatched to your email.',
        email: email,
        expiryMinutes: 2,
      },
    };
  },
  inspectMailbox: async (email) => {
    if (backendOnline !== false) {
      try {
        const res = await api.get(`/api/auth/inspect-mailbox?email=${encodeURIComponent(email)}`);
        backendOnline = true;
        return res;
      } catch (err) {
        if (err.response) throw err;
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    const storedOtp = localStorage.getItem(`pending_otp_${email}`) || '123456';
    return {
      data: {
        recipient: email,
        subject: `🔐 Your JobPulse Verification Code: ${storedOtp}`,
        otpCode: storedOtp,
        sentAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
      },
    };
  },
  getMe: async () => {
    if (backendOnline !== false) {
      try {
        const res = await api.get('/api/auth/me');
        backendOnline = true;
        return res;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    const saved = localStorage.getItem('user');
    const user = saved ? JSON.parse(saved) : { id: 1, email: 'demo@jobtracker.com', fullName: 'Alex Morgan' };
    return { data: user };
  },
};

export const applicationsApi = {
  getAll: async (params) => {
    if (backendOnline !== false) {
      try {
        const res = await api.get('/api/applications', { params });
        backendOnline = true;
        return res;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }

    let apps = getStoredApps();
    if (params?.search) {
      const q = params.search.toLowerCase();
      apps = apps.filter(
        (a) =>
          a.companyName.toLowerCase().includes(q) ||
          a.jobTitle.toLowerCase().includes(q) ||
          (a.location && a.location.toLowerCase().includes(q))
      );
    }
    if (params?.status) apps = apps.filter((a) => a.status === params.status);
    if (params?.priority) apps = apps.filter((a) => a.priority === params.priority);
    if (params?.workType) apps = apps.filter((a) => a.workType === params.workType);
    return { data: apps };
  },

  getById: async (id) => {
    if (backendOnline !== false) {
      try {
        const res = await api.get(`/api/applications/${id}`);
        backendOnline = true;
        return res;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    const apps = getStoredApps();
    const found = apps.find((a) => a.id === Number(id));
    if (!found) throw new Error('Not found');
    return { data: found };
  },

  create: async (data) => {
    if (backendOnline !== false) {
      try {
        const res = await api.post('/api/applications', data);
        backendOnline = true;
        notifyDataChanged();
        return res;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    const apps = getStoredApps();
    const newApp = {
      ...data,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      interviews: [],
      documents: [],
    };
    apps.unshift(newApp);
    saveStoredApps(apps);
    return { data: newApp };
  },

  update: async (id, data) => {
    if (backendOnline !== false) {
      try {
        const res = await api.put(`/api/applications/${id}`, data);
        backendOnline = true;
        notifyDataChanged();
        return res;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    const apps = getStoredApps();
    const idx = apps.findIndex((a) => a.id === Number(id));
    if (idx !== -1) {
      apps[idx] = { ...apps[idx], ...data, updatedAt: new Date().toISOString() };
      saveStoredApps(apps);
      return { data: apps[idx] };
    }
    throw new Error('Not found');
  },

  updateStatus: async (id, status) => {
    if (backendOnline !== false) {
      try {
        const res = await api.patch(`/api/applications/${id}/status`, { status });
        backendOnline = true;
        notifyDataChanged();
        return res;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    const apps = getStoredApps();
    const idx = apps.findIndex((a) => a.id === Number(id));
    if (idx !== -1) {
      apps[idx].status = status;
      apps[idx].updatedAt = new Date().toISOString();
      saveStoredApps(apps);
      return { data: apps[idx] };
    }
    throw new Error('Not found');
  },

  delete: async (id) => {
    if (backendOnline !== false) {
      try {
        const res = await api.delete(`/api/applications/${id}`);
        backendOnline = true;
        notifyDataChanged();
        return res;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    let apps = getStoredApps();
    apps = apps.filter((a) => a.id !== Number(id));
    saveStoredApps(apps);
    return { data: null };
  },

  uploadDocument: async (applicationId, formData) => {
    if (backendOnline !== false) {
      try {
        const res = await api.post(`/api/applications/${applicationId}/documents`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        backendOnline = true;
        notifyDataChanged();
        return res;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    const file = formData.get('file');
    const docType = formData.get('docType') || 'RESUME';
    const newDoc = {
      id: Date.now(),
      jobApplicationId: Number(applicationId),
      docType,
      fileName: file ? file.name : 'document.pdf',
      originalFileName: file ? file.name : 'document.pdf',
      fileSize: file ? file.size : 124000,
      contentType: file ? file.type : 'application/pdf',
      uploadedAt: new Date().toISOString(),
    };
    const apps = getStoredApps();
    const app = apps.find((a) => a.id === Number(applicationId));
    if (app) {
      if (!app.documents) app.documents = [];
      app.documents.push(newDoc);
      saveStoredApps(apps);
    }
    return { data: newDoc };
  },
};

export const documentsApi = {
  download: async (documentId, fileName) => {
    if (backendOnline !== false) {
      try {
        const response = await api.get(`/api/documents/${documentId}/download`, {
          responseType: 'blob',
        });
        backendOnline = true;
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    const blob = new Blob([`Job Tracker Document Archive: ${fileName}\nUploaded via JobPulse PRO`], {
      type: 'text/plain',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  delete: async (documentId) => {
    if (backendOnline !== false) {
      try {
        const res = await api.delete(`/api/documents/${documentId}`);
        backendOnline = true;
        notifyDataChanged();
        return res;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    const apps = getStoredApps();
    apps.forEach((a) => {
      if (a.documents) {
        a.documents = a.documents.filter((d) => d.id !== Number(documentId));
      }
    });
    saveStoredApps(apps);
    return { data: null };
  },
};

export const interviewsApi = {
  getAll: async () => {
    if (backendOnline !== false) {
      try {
        const res = await api.get('/api/interviews');
        backendOnline = true;
        return res;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    return { data: getStoredInterviews() };
  },

  getUpcoming: async () => {
    if (backendOnline !== false) {
      try {
        const res = await api.get('/api/interviews/upcoming');
        backendOnline = true;
        return res;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    const now = new Date();
    const list = getStoredInterviews().filter((i) => new Date(i.scheduledAt) >= now);
    return { data: list };
  },

  create: async (data) => {
    if (backendOnline !== false) {
      try {
        const res = await api.post('/api/interviews', data);
        backendOnline = true;
        notifyDataChanged();
        return res;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    const apps = getStoredApps();
    const app = apps.find((a) => a.id === Number(data.jobApplicationId));
    const newInterview = {
      ...data,
      id: Date.now(),
      companyName: app ? app.companyName : 'Target Company',
      jobTitle: app ? app.jobTitle : 'Role',
      createdAt: new Date().toISOString(),
    };
    if (app) {
      if (!app.interviews) app.interviews = [];
      app.interviews.push(newInterview);
      saveStoredApps(apps);
    }
    return { data: newInterview };
  },

  update: async (id, data) => {
    if (backendOnline !== false) {
      try {
        const res = await api.put(`/api/interviews/${id}`, data);
        backendOnline = true;
        notifyDataChanged();
        return res;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    const apps = getStoredApps();
    let updated = null;
    apps.forEach((a) => {
      if (a.interviews) {
        const idx = a.interviews.findIndex((i) => i.id === Number(id));
        if (idx !== -1) {
          a.interviews[idx] = { ...a.interviews[idx], ...data };
          updated = a.interviews[idx];
        }
      }
    });
    saveStoredApps(apps);
    return { data: updated };
  },

  delete: async (id) => {
    if (backendOnline !== false) {
      try {
        const res = await api.delete(`/api/interviews/${id}`);
        backendOnline = true;
        notifyDataChanged();
        return res;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    const apps = getStoredApps();
    apps.forEach((a) => {
      if (a.interviews) {
        a.interviews = a.interviews.filter((i) => i.id !== Number(id));
      }
    });
    saveStoredApps(apps);
    return { data: null };
  },
};

export const analyticsApi = {
  getSummary: async () => {
    if (backendOnline !== false) {
      try {
        const res = await api.get('/api/analytics/summary');
        backendOnline = true;
        return res;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    return { data: computeMockAnalytics() };
  },

  getMonthly: async () => {
    if (backendOnline !== false) {
      try {
        const res = await api.get('/api/analytics/monthly');
        backendOnline = true;
        return res;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    const apps = getStoredApps();
    const monthCounts = {};
    apps.forEach((a) => {
      if (a.dateApplied) {
        const d = new Date(a.dateApplied);
        const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        monthCounts[key] = (monthCounts[key] || 0) + 1;
      }
    });
    const data = Object.keys(monthCounts).map((k) => ({ month: k, count: monthCounts[k] }));
    return {
      data,
    };
  },

  getStatusDistribution: async () => {
    if (backendOnline !== false) {
      try {
        const res = await api.get('/api/analytics/status-breakdown');
        backendOnline = true;
        return res;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    const apps = getStoredApps();
    const total = apps.length || 1;
    const statuses = ['APPLIED', 'ASSESSMENT', 'INTERVIEW', 'OFFER', 'REJECTED'];
    const data = statuses.map((status) => {
      const count = apps.filter((a) => a.status === status).length;
      return {
        status,
        count,
        percentage: apps.length > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
      };
    });
    return { data };
  },

  getTopCompanies: async () => {
    if (backendOnline !== false) {
      try {
        const res = await api.get('/api/analytics/top-companies');
        backendOnline = true;
        return res;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    const apps = getStoredApps();
    const companyCounts = {};
    apps.forEach((a) => {
      companyCounts[a.companyName] = (companyCounts[a.companyName] || 0) + 1;
    });
    const data = Object.keys(companyCounts)
      .map((k) => ({ companyName: k, count: companyCounts[k] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    return { data };
  },

  getSalaries: async () => {
    if (backendOnline !== false) {
      try {
        const res = await api.get('/api/analytics/salaries');
        backendOnline = true;
        return res;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    const apps = getStoredApps();
    const salaryList = [];
    apps.forEach((a) => {
      if (a.salaryRange) {
        const parsed = parseSalaryNumbers(a.salaryRange);
        if (parsed) {
          salaryList.push({
            id: a.id,
            companyName: a.companyName,
            jobTitle: a.jobTitle,
            minSalary: parsed.min,
            maxSalary: parsed.max,
            avgSalary: parsed.avg,
            rawSalary: a.salaryRange,
            workType: a.workType,
            status: a.status,
          });
        }
      }
    });
    salaryList.sort((a, b) => b.avgSalary - a.avgSalary);
    return { data: salaryList };
  },
};

export const remindersApi = {
  getDeadlines: async () => {
    if (backendOnline !== false) {
      try {
        const res = await api.get('/api/reminders/deadlines');
        backendOnline = true;
        return res;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
      }
    }
    const apps = getStoredApps();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reminders = apps
      .filter((a) => a.deadline && a.status !== 'OFFER' && a.status !== 'REJECTED')
      .map((a) => {
        const d = new Date(a.deadline);
        d.setHours(0, 0, 0, 0);
        const diffTime = d - today;
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let urgency = 'UPCOMING';
        if (daysRemaining < 0) urgency = 'OVERDUE';
        else if (daysRemaining === 0) urgency = 'TODAY';
        else if (daysRemaining <= 3) urgency = 'URGENT';

        return {
          applicationId: a.id,
          companyName: a.companyName,
          jobTitle: a.jobTitle,
          deadline: a.deadline,
          daysRemaining,
          status: a.status,
          urgency,
        };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    return { data: reminders };
  },
};

export const emailSyncApi = {
  processEmail: async (data) => {
    if (backendOnline !== false) {
      try {
        const res = await api.post('/api/email-sync/process', data);
        backendOnline = true;
        notifyDataChanged();
        return res;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) backendOnline = false;
        else if (err.response) throw err;
      }
    }

    // Heuristic offline fallback parser
    const { sender = '', subject = '', body = '' } = data;
    const fullText = `${subject}\n${body}`;

    // Extract meeting link (Google Meet, Zoom, Teams, Webex)
    const meetMatch = fullText.match(/https?:\/\/(?:[a-zA-Z0-9-]+\.)?(?:meet\.google\.com\/[a-z0-9-]+|zoom\.us\/j\/[0-9]+(?:\?pwd=[a-zA-Z0-9]+)?|teams\.microsoft\.com\/l\/meetup-join\/[^\s]+|webex\.com\/[^\s]+)/i);
    const meetingLink = meetMatch ? meetMatch[0] : null;

    // Extract salary
    const salaryMatch = fullText.match(/(?:\$|USD\s*|Rs\.?\s*|INR\s*|₹\s*)\d[\d,]*(?:\.\d+)?(?:\s*(?:k|K|lakhs?|LPA|per annum|\/year))?(?:\s*(?:-|to)\s*(?:\$|USD\s*|Rs\.?\s*|INR\s*|₹\s*)?\d[\d,]*(?:\.\d+)?(?:\s*(?:k|K|lakhs?|LPA|per annum|\/year))?)?/i);
    const detectedSalary = salaryMatch ? salaryMatch[0].trim() : null;

    // Detect stage & intent
    const lower = fullText.toLowerCase();
    let detectedStage = 'APPLIED';
    let actionTaken = 'LOGGED';
    let details = 'Email logged successfully.';

    if (lower.includes('offer') || lower.includes('congratulations') || lower.includes('pleased to offer')) {
      detectedStage = 'OFFER';
      actionTaken = 'OFFER_RECEIVED';
      details = `Job offer detected! Stage updated to OFFER.${detectedSalary ? ' Salary: ' + detectedSalary : ''}`;
    } else if (meetingLink || lower.includes('interview') || lower.includes('technical screen') || lower.includes('meeting') || lower.includes('round')) {
      detectedStage = 'INTERVIEW';
      actionTaken = 'INTERVIEW_SCHEDULED';
      details = `Interview detected! Meeting link extracted: ${meetingLink || 'None provided'}`;
    } else if (lower.includes('assessment') || lower.includes('hackerrank') || lower.includes('codility') || lower.includes('take-home') || lower.includes('test')) {
      detectedStage = 'ASSESSMENT';
      actionTaken = 'ASSESSMENT_RECEIVED';
      details = 'Online Assessment detected! Stage updated to ASSESSMENT.';
    } else if (lower.includes('regret') || lower.includes('unfortunately') || lower.includes('pursuing other candidates')) {
      detectedStage = 'REJECTED';
      actionTaken = 'REJECTED';
      details = 'Rejection detected. Stage updated to REJECTED.';
    }

    const apps = getStoredApps();
    let matchedApp = null;
    for (const app of apps) {
      if (
        fullText.toLowerCase().includes(app.companyName.toLowerCase()) ||
        sender.toLowerCase().includes(app.companyName.toLowerCase().replace(/\s+/g, ''))
      ) {
        matchedApp = app;
        break;
      }
    }

    if (matchedApp) {
      matchedApp.status = detectedStage;
      if (detectedSalary && !matchedApp.salaryRange) {
        matchedApp.salaryRange = detectedSalary;
      }
      matchedApp.notes = `${matchedApp.notes ? matchedApp.notes + '\n\n' : ''}[Auto-Sync ${new Date().toLocaleDateString()}]: ${subject}`;
      matchedApp.updatedAt = new Date().toISOString();
      saveStoredApps(apps);
    } else {
      let comp = 'Direct Application';
      if (sender.includes('@')) {
        const domain = sender.split('@')[1].split('.')[0];
        if (domain && !['gmail', 'yahoo', 'outlook', 'hotmail', 'protonmail'].includes(domain.toLowerCase())) {
          comp = domain.charAt(0).toUpperCase() + domain.slice(1);
        }
      }
      const newApp = {
        id: Date.now(),
        companyName: comp,
        jobTitle: 'Candidate Position',
        workType: 'REMOTE',
        salaryRange: detectedSalary || '',
        dateApplied: new Date().toISOString().split('T')[0],
        status: detectedStage,
        priority: 'HIGH',
        notes: `Auto-ingested from email: "${subject}"\nSender: ${sender}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        interviews: [],
        documents: [],
      };
      apps.unshift(newApp);
      saveStoredApps(apps);
      matchedApp = newApp;
    }

    notifyDataChanged();

    return {
      data: {
        applicationId: matchedApp.id,
        companyName: matchedApp.companyName,
        jobTitle: matchedApp.jobTitle,
        detectedStage,
        meetingLink,
        detectedSalary,
        actionTaken,
        details,
        interviewBooked: detectedStage === 'INTERVIEW',
      },
    };
  },
};

export default api;

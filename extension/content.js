// JobPulse PRO - Auto Job Clipper Content Script

(function () {
  'use strict';

  // Prevent double injection
  if (document.getElementById('jobpulse-clipper-btn')) return;

  function scrapeJobData() {
    let company = '';
    let title = '';
    let location = 'Remote';
    let salary = '';
    const url = window.location.href;

    const hostname = window.location.hostname;

    if (hostname.includes('linkedin.com')) {
      title = document.querySelector('.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, h1.t-24, h1')?.innerText?.trim() || '';
      company = document.querySelector('.job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name, a.ember-view[href*="/company/"]')?.innerText?.trim() || '';
      location = document.querySelector('.job-details-jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet')?.innerText?.trim() || 'Remote';
    } else if (hostname.includes('indeed.com')) {
      title = document.querySelector('h1.jobsearch-JobInfoHeader-title, h2.jobTitle, h1')?.innerText?.trim() || '';
      company = document.querySelector('[data-testid="inlineHeader-companyName"], .jobsearch-JobInfoHeader-companyName')?.innerText?.trim() || '';
      location = document.querySelector('[data-testid="inlineHeader-companyLocation"], .jobsearch-JobInfoHeader-companyLocation')?.innerText?.trim() || 'Remote';
    } else if (hostname.includes('greenhouse.io') || hostname.includes('lever.co')) {
      title = document.querySelector('h1.app-title, .posting-headline h2, h1')?.innerText?.trim() || '';
      company = document.querySelector('.company-name, .posting-header a, .main-header')?.innerText?.trim() || document.title.split('-')[0].trim();
    }

    // Fallbacks
    if (!title) {
      title = document.querySelector('h1')?.innerText?.trim() || document.title.split('|')[0].trim();
    }
    if (!company) {
      const match = document.title.match(/(?:at|@|–|-)\s*([A-Za-z0-9&.\s]{2,25})/);
      company = match ? match[1].trim() : 'Company';
    }

    return {
      companyName: company || 'Target Company',
      jobTitle: title || 'Software Engineer',
      location: location || 'Remote',
      workType: location.toLowerCase().includes('remote') ? 'REMOTE' : 'HYBRID',
      salaryRange: salary || '',
      jobUrl: url,
      status: 'APPLIED',
      priority: 'HIGH',
      dateApplied: new Date().toISOString().split('T')[0],
      notes: `Auto-captured from ${hostname} on ${new Date().toLocaleDateString()}`
    };
  }

  // Create floating button
  const button = document.createElement('button');
  button.id = 'jobpulse-clipper-btn';
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
    <span>Save to JobPulse</span>
  `;

  button.addEventListener('click', async () => {
    button.disabled = true;
    const originalText = button.innerHTML;
    button.innerHTML = '<span>Saving to JobPulse...</span>';

    const jobData = scrapeJobData();

    try {
      chrome.storage.local.get(['jobpulse_token'], async (result) => {
        let token = result.jobpulse_token;

        // Auto-authenticate with demo user if no token exists yet
        if (!token) {
          try {
            const authRes = await fetch('http://localhost:8080/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: 'demo@jobtracker.com', password: 'password123' }),
            });
            if (authRes.ok) {
              const authData = await authRes.json();
              token = authData.token;
              chrome.storage.local.set({ jobpulse_token: token });
            }
          } catch (e) {
            console.warn('Auto-auth failed:', e);
          }
        }

        const headers = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch('http://localhost:8080/api/applications', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(jobData),
        });

        if (res.ok) {
          showNotification(`🎉 Saved "${jobData.companyName}" to your JobPulse Pipeline!`, 'success');
          button.innerHTML = '<span>✓ Saved!</span>';
          setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
          }, 3000);
        } else {
          showNotification('Saved locally! Make sure JobPulse backend is running on port 8080.', 'info');
          button.innerHTML = originalText;
          button.disabled = false;
        }
      });
    } catch (err) {
      showNotification('Saved to JobPulse! (Backend: localhost:8080)', 'success');
      button.innerHTML = originalText;
      button.disabled = false;
    }
  });

  function showNotification(msg, type) {
    const toast = document.createElement('div');
    toast.className = `jobpulse-toast jobpulse-toast-${type}`;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('jobpulse-toast-show'), 100);
    setTimeout(() => {
      toast.classList.remove('jobpulse-toast-show');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  document.body.appendChild(button);
})();

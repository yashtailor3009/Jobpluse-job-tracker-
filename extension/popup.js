document.getElementById('open-dashboard-btn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:5173/' });
});

document.getElementById('clip-tab-btn').addEventListener('click', async () => {
  const btn = document.getElementById('clip-tab-btn');
  const statusEl = document.getElementById('clip-status');
  btn.disabled = true;
  btn.innerText = 'Clipping...';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let rawTitle = tab?.title || 'Saved Position';
    let title = rawTitle;
    let company = 'Target Company';
    const url = tab?.url || 'https://linkedin.com';

    // Smart heuristic title parsing
    if (rawTitle.includes(' at ')) {
      const parts = rawTitle.split(' at ');
      title = parts[0].trim();
      company = parts[1].split(/[-–|]/)[0].trim();
    } else if (rawTitle.includes(' - ')) {
      const parts = rawTitle.split(' - ');
      company = parts[0].trim();
      title = parts[1].split(/[-–|]/)[0].trim();
    } else if (rawTitle.includes(' | ')) {
      const parts = rawTitle.split(' | ');
      title = parts[0].trim();
      company = parts[1].trim();
    }

    // Auto-login to obtain JWT token
    const authRes = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@jobtracker.com', password: 'password123' })
    });
    const authData = await authRes.json();
    const token = authData.token;

    const payload = {
      companyName: company || 'Target Company',
      jobTitle: title || 'Software Engineer',
      location: 'Remote',
      workType: 'REMOTE',
      salaryRange: '',
      jobUrl: url,
      status: 'APPLIED',
      priority: 'HIGH',
      dateApplied: new Date().toISOString().split('T')[0],
      notes: `Saved via JobPulse Extension on ${new Date().toLocaleDateString()}`
    };

    const res = await fetch('http://localhost:8080/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      statusEl.style.display = 'block';
      statusEl.style.color = '#34d399';
      statusEl.innerText = `✓ Saved "${company}" to Dashboard!`;
      btn.innerText = '✓ Saved!';
    } else {
      statusEl.style.display = 'block';
      statusEl.style.color = '#f87171';
      statusEl.innerText = 'Could not save. Is backend running?';
      btn.innerText = 'Error';
    }
  } catch (err) {
    statusEl.style.display = 'block';
    statusEl.style.color = '#f87171';
    statusEl.innerText = 'Backend offline on port 8080';
    btn.innerText = 'Error';
  }

  setTimeout(() => {
    btn.disabled = false;
    btn.innerText = '⚡ Clip This Page to JobPulse';
  }, 2500);
});

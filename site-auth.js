(() => {
  const form = document.getElementById('loginForm');
  const input = document.getElementById('studentNameInput');
  const profileBar = document.getElementById('profileBar');
  const profileName = document.getElementById('profileName');
  const logoutBtn = document.getElementById('logoutBtn');
  const userKey = 'gesp_user_profile';

  if (!form || !input || !profileBar || !profileName || !logoutBtn) return;

  function getProfile() {
    try {
      const profile = JSON.parse(localStorage.getItem(userKey) || 'null');
      if (profile && typeof profile.name === 'string') return profile;
    } catch (error) {}
    return null;
  }

  function renderTopbarAuth() {
    const profile = getProfile();
    const signedIn = Boolean(profile);
    form.hidden = signedIn;
    profileBar.hidden = !signedIn;
    if (profile) profileName.textContent = profile.name;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = input.value.trim() || '小勇士';
    localStorage.setItem(userKey, JSON.stringify({ name, savedAt: Date.now() }));
    renderTopbarAuth();
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem(userKey);
    renderTopbarAuth();
  });

  renderTopbarAuth();
})();

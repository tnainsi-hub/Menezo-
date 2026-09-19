// ===== Platform definitions (shared across all pages) =====
const PLATFORMS = [
  { key:'YouTube', cls:'yt', icon:'YT' },
  { key:'Instagram', cls:'ig', icon:'IG' },
  { key:'TikTok', cls:'tt', icon:'TT' },
  { key:'Facebook', cls:'fb', icon:'FB' },
  { key:'X', cls:'xx', icon:'X' },
  { key:'LinkedIn', cls:'li', icon:'in' },
  { key:'Pinterest', cls:'pn', icon:'P' },
  { key:'Snapchat', cls:'sc', icon:'SC' },
  { key:'Spotify', cls:'sp', icon:'SP' },
  { key:'Twitch', cls:'tw', icon:'TW' },
  { key:'Threads', cls:'th', icon:'TH' },
];

// ===== Auth helpers =====
function getUser(){
  let user = { name:'Creator', channelId:'@you', platform:'YouTube', niche:'General', followers:'0', score:50 };
  try {
    const saved = localStorage.getItem('menezo_user');
    if (saved) user = { ...user, ...JSON.parse(saved) };
  } catch(e){}
  return user;
}

function requireLogin(){
  if (!localStorage.getItem('menezo_user')) {
    window.location.href = 'login.html';
    return null;
  }
  return getUser();
}

function switchAccount(){ window.location.href = 'login.html'; }

// ===== Sidebar rendering =====
function renderSidebar(activePage, user){
  const mount = document.getElementById('sidebar-mount');
  if (!mount) return;

  const platItems = PLATFORMS.map(p => {
    const connected = p.key === user.platform;
    return `<div class="plat-item ${connected ? 'connected' : 'locked'}">
      <span class="icon-badge ${p.cls}">${p.icon}</span>${p.key}
      <span class="plat-count">${connected ? user.followers : 'Connect'}</span>
    </div>`;
  }).join('');

  mount.innerHTML = `
    <div class="brand">
      <div class="logo">M</div>
      <div class="brand-txt"><div>Menezo</div><div>Create · Build · Grow</div></div>
    </div>
    <nav>
      <a class="dash-link ${activePage==='dashboard' ? 'active' : ''}" href="dashboard.html">🏠&nbsp; Dashboard</a>
    </nav>
    <div class="sec-label">Platforms</div>
    <div id="platList">${platItems}</div>
    <div class="sec-label">Tools</div>
    <nav>
      <a href="ai-studio.html">✨ AI Studio</a>
      <a href="planner.html">📅 Content Planner</a>
      <a href="caption-lab.html">🖼️ Caption Lab</a>
      <a href="analytics.html">📊 Analytics</a>
    </nav>
    <div class="pro-card">
      <b>👑 Menezo Pro</b>
      Connect more platforms and unlock advanced AI tools.
      <button class="pro-btn" onclick="alert('Coming soon!')">Upgrade Now</button>
    </div>
  `;
}

// ===== Topbar / avatar =====
function renderTopbar(user){
  const mount = document.getElementById('topbar-mount');
  if (!mount) return;
  const initial = (user.name || 'C').charAt(0).toUpperCase();
  mount.innerHTML = `
    <input class="search" placeholder="Search tools, projects, scripts...">
    <div class="avatar" onclick="switchAccount()" title="Switch account">${initial}</div>
  `;
}

// ===== Greeting time-of-day =====
function greetingWord(){
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 21) return 'Evening';
  return 'Night';
}

// ===== Simple sparkline generator (for Platform Overview cards) =====
function sparkPath(seed){
  let pts = []; let v = 50;
  for (let i=0; i<12; i++){
    v += (Math.sin(seed+i)*14 + (Math.random()-0.5)*10);
    v = Math.max(10, Math.min(90, v));
    pts.push(v);
  }
  const w=100, h=100, step=w/(pts.length-1);
  return pts.map((p,i)=>`${i===0?'M':'L'} ${i*step} ${h-p}`).join(' ');
}

// ===== AI chat call (shared, used by dashboard) =====
async function askAIManager(message, user){
  try {
    const res = await fetch('/api/ai-manager-chat', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ message, creatorContext:{ name:user.name, handle:user.channelId, platform:user.platform, niche:user.niche } })
    });
    const data = await res.json();
    return data.reply || 'Focus on high-retention hooks and post consistently!';
  } catch(err){
    return 'Focus on high-retention hooks and post consistently!';
  }
}

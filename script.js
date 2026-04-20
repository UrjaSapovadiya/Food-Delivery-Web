let orders = JSON.parse(localStorage.getItem('foodrush_orders') || '[]');
let currentTab = 'all';

if (orders.length === 0) {
  const names = ['Priya Sharma','Rahul Verma','Ananya Patel','Kiran Mehta','Suresh Kumar','Meera Joshi','Amit Singh','Sneha Gupta','Vikram Nair','Pooja Desai'];
  const phones = ['+91 9876543210','+91 9123456780','+91 9988776655','+91 8877665544','+91 7766554433','+91 9090909090','+91 8181818181','+91 9292929292','+91 8383838383','+91 9494949494'];
  const foods = [
    ['Paneer Pizza','Garlic Bread','Coke'],
    ['Veg Burger','French Fries','Lemonade'],
    ['Butter Chicken','Naan','Lassi'],
    ['Masala Dosa','Sambhar','Chutney'],
    ['Veg Biryani','Raita','Papad'],
    ['Pav Bhaji','Butter Pav','Sweet Lassi'],
    ['Hakka Noodles','Manchurian','Spring Roll'],
    ['Margherita Pizza','Pasta','Juice'],
    ['Dal Makhani','Rice','Pickle'],
    ['Chole Bhature','Achar','Chai'],
  ];
  const statuses = ['pending','preparing','out_for_delivery','delivered','delivered','delivered','cancelled','delivered','cancelled','delivered'];
  const addresses = ['Satellite, Ahmedabad','Navrangpura, Ahmedabad','Bopal, Ahmedabad','Maninagar, Ahmedabad','Vastrapur, Ahmedabad','Paldi, Ahmedabad','Gota, Ahmedabad','Chandkheda, Ahmedabad','Naroda, Ahmedabad','Motera, Ahmedabad'];

  const today = new Date();
  for (let i = 0; i < 10; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - Math.floor(i / 2));
    d.setHours(9 + i * 1.3 | 0, Math.floor(Math.random()*60));
    orders.push({
      id: 'FR' + String(1001 + i),
      name: names[i],
      phone: phones[i],
      address: addresses[i],
      items: foods[i],
      amount: 150 + i * 75,
      payment: ['Cash on Delivery','UPI','Card'][i%3],
      status: statuses[i],
      date: d.toISOString(),
      createdAt: Date.now() - i * 3600000
    });
  }
  save();
}

function save() {
  localStorage.setItem('foodrush_orders', JSON.stringify(orders));
  updateStats();
  updateCounts();
}

const avatarColors = ['#ff5533','#22d4a0','#4facfe','#ffd166','#ff4466','#a78bfa','#fb923c','#34d399'];
function avatarColor(name) {
  let h = 0;
  for(let c of name) h += c.charCodeAt(0);
  return avatarColors[h % avatarColors.length];
}
function initials(name) {
  return name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
}

const statusLabels = {
  pending: '⏳ Pending',
  preparing: '👨‍🍳 Preparing',
  out_for_delivery: '🛵 On the Way',
  delivered: '✅ Delivered',
  cancelled: '❌ Cancelled'
};
const statusClass = {
  pending: 'pending',
  preparing: 'preparing',
  out_for_delivery: 'out_for_delivery',
  delivered: 'delivered',
  cancelled: 'cancelled'
};

function updateStats() {
  const total = orders.length;
  const delivered = orders.filter(o=>o.status==='delivered').length;
  const cancelled = orders.filter(o=>o.status==='cancelled').length;
  const revenue = orders.filter(o=>o.status==='delivered').reduce((s,o)=>s+Number(o.amount),0);
  document.getElementById('statTotal').textContent = total;
  document.getElementById('statDelivered').textContent = delivered;
  document.getElementById('statCancelled').textContent = cancelled;
  document.getElementById('statRevenue').textContent = '₹' + revenue.toLocaleString('en-IN');
}

function updateCounts() {
  const active = ['pending','preparing','out_for_delivery'];
  document.getElementById('cAll').textContent = orders.length;
  document.getElementById('cActive').textContent = orders.filter(o=>active.includes(o.status)).length;
  document.getElementById('cDelivered').textContent = orders.filter(o=>o.status==='delivered').length;
  document.getElementById('cCancelled').textContent = orders.filter(o=>o.status==='cancelled').length;
}

function renderTable() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const dateVal = document.getElementById('dateFilter').value; // YYYY-MM-DD
  const active = ['pending','preparing','out_for_delivery'];

  let filtered = orders.filter(o => {
    if (currentTab === 'active' && !active.includes(o.status)) return false;
    if (currentTab === 'delivered' && o.status !== 'delivered') return false;
    if (currentTab === 'cancelled' && o.status !== 'cancelled') return false;

    if (search) {
      const haystack = (o.name + o.phone + o.id + o.items.join(' ') + o.address).toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (dateVal) {
      const oDate = new Date(o.date).toISOString().slice(0,10);
      if (oDate !== dateVal) return false;
    }
    return true;
  });

  // Date banner
  const banner = document.getElementById('dateBanner');
  if (dateVal) {
    const pretty = new Date(dateVal + 'T00:00:00').toLocaleDateString('hi-IN', {day:'2-digit',month:'long',year:'numeric'});
    document.getElementById('dateBannerText').innerHTML = `<strong>${pretty}</strong> Order received from ${filtered.length}`;
    banner.classList.add('show');
  } else {
    banner.classList.remove('show');
  }

  const tbody = document.getElementById('tableBody');
  const empty = document.getElementById('emptyState');

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  // Sort newest first
  filtered.sort((a,b) => new Date(b.date) - new Date(a.date));

  tbody.innerHTML = filtered.map(o => {
    const d = new Date(o.date);
    const dateStr = d.toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'});
    const timeStr = d.toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'});
    const col = avatarColor(o.name);
    const isActive = active.includes(o.status);

    return `<tr>
      <td><span class="order-id">${o.id}</span></td>
      <td>
        <div class="customer-info">
          <div class="avatar" style="background:${col}22;color:${col};">${initials(o.name)}</div>
          <div>
            <div class="customer-name">${o.name}</div>
            <div class="customer-phone">${o.phone}</div>
          </div>
        </div>
      </td>
      <td class="food-items">${o.items.map(i=>`<span class="item">${i}</span>`).join('')}</td>
      <td><span class="price">₹${Number(o.amount).toLocaleString('en-IN')}</span></td>
      <td class="date-col"><span class="time">${timeStr}</span>${dateStr}</td>
      <td><span class="badge ${statusClass[o.status]}">${statusLabels[o.status]}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn-sm btn-view" onclick="viewOrder('${o.id}')">👁</button>
          ${isActive ? `<button class="btn-sm btn-deliver" onclick="updateStatus('${o.id}','delivered')">✓ Deliver</button>` : ''}
          ${isActive ? `<button class="btn-sm btn-cancel" onclick="updateStatus('${o.id}','cancelled')">✗ Cancel</button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');
}

function setTab(tab, el) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderTable();
}


function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('dateFilter').value = '';
  renderTable();
}


function updateStatus(id, status) {
  const o = orders.find(x=>x.id===id);
  if (!o) return;
  o.status = status;
  save();
  renderTable();
  toast(status === 'delivered' ? 'success' : 'error',
    status === 'delivered' ? `Order ${id} delivered! ✅` : `Order ${id} cancelled ❌`);
}

function openAddModal() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  document.getElementById('f_date').value = now.toISOString().slice(0,16);
  document.getElementById('addModal').classList.add('show');
}

function saveOrder() {
  const name = document.getElementById('f_name').value.trim();
  const phone = document.getElementById('f_phone').value.trim();
  const address = document.getElementById('f_address').value.trim();
  const items = document.getElementById('f_items').value.trim();
  const amount = document.getElementById('f_amount').value.trim();
  const payment = document.getElementById('f_payment').value;
  const status = document.getElementById('f_status').value;
  const date = document.getElementById('f_date').value;

  if (!name || !phone || !address || !items || !amount) {
    toast('error', 'fill up all the mandatory field!'); return;
  }

  const id = 'FR' + (1000 + orders.length + 1);
  orders.unshift({
    id, name, phone, address,
    items: items.split(',').map(s=>s.trim()).filter(Boolean),
    amount: Number(amount),
    payment, status,
    date: date ? new Date(date).toISOString() : new Date().toISOString(),
    createdAt: Date.now()
  });

  ['f_name','f_phone','f_address','f_items','f_amount'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('f_status').value = 'pending';

  save();
  renderTable();
  closeModal('addModal');
  toast('success', `Order ${id} is added!🎉`);
}

function viewOrder(id) {
  const o = orders.find(x=>x.id===id);
  if (!o) return;
  const d = new Date(o.date);
  const col = avatarColor(o.name);

  document.getElementById('viewContent').innerHTML = `
    <div style="text-align:center;margin-bottom:1.5rem;">
      <div class="avatar" style="background:${col}22;color:${col};width:64px;height:64px;font-size:1.5rem;margin:0 auto .7rem;">${initials(o.name)}</div>
      <div style="font-family:Syne,sans-serif;font-size:1.2rem;font-weight:700;">${o.name}</div>
      <div style="font-size:.85rem;color:var(--muted);">${o.phone}</div>
    </div>
    <div style="display:flex;flex-direction:column;">
      ${row('Order ID', `<span class="order-id">${o.id}</span>`)}
      ${row('Status', `<span class="badge ${statusClass[o.status]}">${statusLabels[o.status]}</span>`)}
      ${row('Food Items', o.items.map(i=>`<span class="item">${i}</span>`).join(' '))}
      ${row('Amount', `<span class="price">₹${Number(o.amount).toLocaleString('en-IN')}</span>`)}
      ${row('Payment', o.payment)}
      ${row('Address', o.address)}
      ${row('Date & Time', d.toLocaleString('en-IN',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}))}
    </div>
  `;
  document.getElementById('viewModal').classList.add('show');
}
function row(l,v) {
  return `<div class="detail-row"><span class="dl">${l}</span><span class="dv">${v}</span></div>`;
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', function(e) {
    if (e.target === this) closeModal(this.id);
  });
});

let toastTimer;
function toast(type, msg) {
  const t = document.getElementById('toast');
  const msgEl = document.getElementById('toastMsg');
  const iconEl = document.getElementById('toastIcon');
  if(!t || !msgEl || !iconEl) return;
  msgEl.textContent = msg;
  iconEl.textContent = type === 'success' ? '✅' : '❌';
  t.className = 'show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.className = '', 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    save();
    renderTable();
});
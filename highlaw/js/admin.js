const loginPanel = document.getElementById('loginPanel');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const adminMessage = document.getElementById('adminMessage');
const adminCalendarTitle = document.getElementById('adminCalendarTitle');
const adminCalendarGrid = document.getElementById('adminCalendarGrid');
const adminSlotList = document.getElementById('adminSlotList');
const adminSelectedDateText = document.getElementById('adminSelectedDateText');
const adminPrevMonth = document.getElementById('adminPrevMonth');
const adminNextMonth = document.getElementById('adminNextMonth');
const reservationForm = document.getElementById('reservationForm');
const reservationId = document.getElementById('reservationId');
const reservationDate = document.getElementById('reservationDate');
const reservationTime = document.getElementById('reservationTime');
const resetFormBtn = document.getElementById('resetFormBtn');

const adminStatusText = {
  available: '예약 가능',
  booked: '예약 완료',
  closed: '마감',
  consulting: '상담중'
};

let adminViewDate = new Date();
let adminSelectedDate = toDateKey(new Date());
let adminReservations = [];

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function showMessage(text, type = 'info') {
  adminMessage.textContent = text;
  adminMessage.className = `admin-message is-${type}`;
}

async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || '요청을 처리하지 못했습니다.');
  return data;
}

async function checkLogin() {
  try {
    await api('/api/admin/me');
    loginPanel.hidden = true;
    adminPanel.hidden = false;
    await loadAdminReservations();
  } catch (_) {
    loginPanel.hidden = false;
    adminPanel.hidden = true;
  }
}

async function loadAdminReservations() {
  const data = await api(`/api/admin/reservations?month=${monthKey(adminViewDate)}`);
  adminReservations = data.reservations || [];
  renderAdminCalendar();
  renderAdminSlots();
}

function renderAdminCalendar() {
  const year = adminViewDate.getFullYear();
  const month = adminViewDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const todayKey = toDateKey(new Date());
  const byDate = adminReservations.reduce((acc, item) => {
    acc[item.date] = acc[item.date] || [];
    acc[item.date].push(item);
    return acc;
  }, {});

  adminCalendarTitle.textContent = `${year}.${String(month + 1).padStart(2, '0')}`;
  adminCalendarGrid.innerHTML = '';

  ['일', '월', '화', '수', '목', '금', '토'].forEach(day => {
    const el = document.createElement('div');
    el.className = 'booking-weekday';
    el.textContent = day;
    adminCalendarGrid.appendChild(el);
  });

  for (let i = 0; i < first.getDay(); i += 1) {
    const empty = document.createElement('div');
    empty.className = 'booking-day is-empty';
    adminCalendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= last.getDate(); day += 1) {
    const key = toDateKey(new Date(year, month, day));
    const items = byDate[key] || [];
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'booking-day';
    el.classList.toggle('is-selected', key === adminSelectedDate);
    el.classList.toggle('is-today', key === todayKey);
    el.innerHTML = `
      <span class="booking-day__num">${day}</span>
      <span class="booking-day__meta">${items.length ? `${items.length}건` : '비어 있음'}</span>
    `;
    el.addEventListener('click', () => {
      adminSelectedDate = key;
      reservationDate.value = key;
      renderAdminCalendar();
      renderAdminSlots();
    });
    adminCalendarGrid.appendChild(el);
  }
}

function renderAdminSlots() {
  const items = adminReservations.filter(item => item.date === adminSelectedDate);
  const date = new Date(`${adminSelectedDate}T00:00:00`);
  adminSelectedDateText.textContent = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  adminSlotList.innerHTML = '';

  if (!items.length) {
    adminSlotList.innerHTML = '<p class="booking-empty">등록된 시간이 없습니다.</p>';
    return;
  }

  items.forEach(item => {
    const el = document.createElement('div');
    el.className = `admin-slot is-${item.status}`;
    el.innerHTML = `
      <button type="button" class="admin-slot__main">
        <strong>${item.time}</strong>
        <span>${adminStatusText[item.status]}</span>
        <small>${item.client_name || item.matter_type || '고객 정보 없음'}</small>
      </button>
      <button type="button" class="admin-slot__delete">삭제</button>
    `;
    el.querySelector('.admin-slot__main').addEventListener('click', () => fillForm(item));
    el.querySelector('.admin-slot__delete').addEventListener('click', () => deleteReservation(item.id));
    adminSlotList.appendChild(el);
  });
}

function fillForm(item) {
  reservationId.value = item.id;
  reservationDate.value = item.date;
  reservationTime.value = item.time;
  reservationForm.status.value = item.status;
  reservationForm.client_name.value = item.client_name || '';
  reservationForm.client_phone.value = item.client_phone || '';
  reservationForm.matter_type.value = item.matter_type || '';
  reservationForm.memo.value = item.memo || '';
  showMessage('선택한 예약을 수정할 수 있습니다.');
}

function resetForm() {
  reservationForm.reset();
  reservationId.value = '';
  reservationDate.value = adminSelectedDate;
  reservationTime.value = '10:00';
  reservationForm.status.value = 'available';
}

async function deleteReservation(id) {
  if (!confirm('이 예약 시간을 삭제할까요?')) return;
  await api(`/api/admin/reservations/${id}`, { method: 'DELETE' });
  showMessage('삭제했습니다.', 'success');
  await loadAdminReservations();
  resetForm();
}

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  try {
    await api('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(new FormData(loginForm)))
    });
    showMessage('');
    await checkLogin();
  } catch (error) {
    showMessage(error.message, 'error');
  }
});

logoutBtn.addEventListener('click', async () => {
  await api('/api/admin/logout', { method: 'POST', body: '{}' });
  loginPanel.hidden = false;
  adminPanel.hidden = true;
});

reservationForm.addEventListener('submit', async e => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(reservationForm));
  const id = reservationId.value;
  try {
    if (id) {
      await api(`/api/admin/reservations/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      showMessage('예약 시간을 수정했습니다.', 'success');
    } else {
      await api('/api/admin/reservations', { method: 'POST', body: JSON.stringify(payload) });
      showMessage('예약 시간을 추가했습니다.', 'success');
    }
    adminSelectedDate = payload.date;
    adminViewDate = new Date(`${payload.date}T00:00:00`);
    await loadAdminReservations();
    resetForm();
  } catch (error) {
    showMessage(error.message, 'error');
  }
});

resetFormBtn.addEventListener('click', resetForm);

adminPrevMonth.addEventListener('click', () => {
  adminViewDate = new Date(adminViewDate.getFullYear(), adminViewDate.getMonth() - 1, 1);
  adminSelectedDate = toDateKey(new Date(adminViewDate.getFullYear(), adminViewDate.getMonth(), 1));
  reservationDate.value = adminSelectedDate;
  loadAdminReservations().catch(error => showMessage(error.message, 'error'));
});

adminNextMonth.addEventListener('click', () => {
  adminViewDate = new Date(adminViewDate.getFullYear(), adminViewDate.getMonth() + 1, 1);
  adminSelectedDate = toDateKey(new Date(adminViewDate.getFullYear(), adminViewDate.getMonth(), 1));
  reservationDate.value = adminSelectedDate;
  loadAdminReservations().catch(error => showMessage(error.message, 'error'));
});

resetForm();
checkLogin();

const calendarTitle = document.getElementById('calendarTitle');
const calendarGrid = document.getElementById('calendarGrid');
const slotList = document.getElementById('slotList');
const selectedDateText = document.getElementById('selectedDateText');
const prevMonth = document.getElementById('prevMonth');
const nextMonth = document.getElementById('nextMonth');

const statusText = {
  available: '예약 가능',
  booked: '예약 완료',
  closed: '마감',
  consulting: '상담중'
};

let viewDate = new Date();
let selectedDate = toDateKey(new Date());
let reservations = [];

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatKoreanDate(key) {
  const date = new Date(`${key}T00:00:00`);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

async function loadReservations() {
  const res = await fetch(`/api/reservations?month=${monthKey(viewDate)}`);
  const data = await res.json();
  reservations = data.reservations || [];
  renderCalendar();
  renderSlots();
}

function renderCalendar() {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const todayKey = toDateKey(new Date());
  const byDate = reservations.reduce((acc, item) => {
    acc[item.date] = acc[item.date] || [];
    acc[item.date].push(item);
    return acc;
  }, {});

  calendarTitle.textContent = `${year}.${String(month + 1).padStart(2, '0')}`;
  calendarGrid.innerHTML = '';

  ['일', '월', '화', '수', '목', '금', '토'].forEach(day => {
    const el = document.createElement('div');
    el.className = 'booking-weekday';
    el.textContent = day;
    calendarGrid.appendChild(el);
  });

  for (let i = 0; i < first.getDay(); i += 1) {
    const empty = document.createElement('div');
    empty.className = 'booking-day is-empty';
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= last.getDate(); day += 1) {
    const key = toDateKey(new Date(year, month, day));
    const items = byDate[key] || [];
    const available = items.filter(item => item.status === 'available').length;
    const booked = items.length - available;
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'booking-day';
    el.classList.toggle('is-selected', key === selectedDate);
    el.classList.toggle('is-today', key === todayKey);
    el.innerHTML = `
      <span class="booking-day__num">${day}</span>
      <span class="booking-day__meta">${items.length ? `가능 ${available} · 마감 ${booked}` : '일정 없음'}</span>
    `;
    el.addEventListener('click', () => {
      selectedDate = key;
      renderCalendar();
      renderSlots();
    });
    calendarGrid.appendChild(el);
  }
}

function renderSlots() {
  const items = reservations.filter(item => item.date === selectedDate);
  selectedDateText.textContent = formatKoreanDate(selectedDate);
  slotList.innerHTML = '';

  if (!items.length) {
    slotList.innerHTML = '<p class="booking-empty">등록된 상담 가능 시간이 없습니다.</p>';
    return;
  }

  items.forEach(item => {
    const el = document.createElement('a');
    el.href = item.status === 'available' ? `contact.html?date=${item.date}&time=${item.time}` : '#';
    el.className = `booking-slot is-${item.status}`;
    if (item.status !== 'available') el.addEventListener('click', e => e.preventDefault());
    el.innerHTML = `
      <strong>${item.time}</strong>
      <span>${statusText[item.status] || item.status}</span>
    `;
    slotList.appendChild(el);
  });
}

prevMonth.addEventListener('click', () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
  selectedDate = toDateKey(new Date(viewDate.getFullYear(), viewDate.getMonth(), 1));
  loadReservations();
});

nextMonth.addEventListener('click', () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  selectedDate = toDateKey(new Date(viewDate.getFullYear(), viewDate.getMonth(), 1));
  loadReservations();
});

loadReservations().catch(() => {
  reservations = [];
  renderCalendar();
  renderSlots();
});

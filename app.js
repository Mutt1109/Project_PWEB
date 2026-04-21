/* ============================================================
   IKL TICKET HUB — app.js
   Sistem Manajemen Tiket Indonesia Kings League (Honor of Kings)
   ============================================================ */

'use strict';

// ─────────────────────────────────────────────
// DATA: Tim & Pertandingan IKL Nyata 2025
// ─────────────────────────────────────────────
const MATCH_DATA = [
  { id: 'M001', teams: 'Kagendra vs Bigetron by Vitality', date: '2025-05-03', stage: 'Grand Final Spring 2025', tier: 'Mythic' },
  { id: 'M002', teams: 'RRQ vs ONIC Esports', date: '2025-05-01', stage: 'Semi Final Spring 2025', tier: 'Legend' },
  { id: 'M003', teams: 'Alter Ego vs Dominator Esports', date: '2025-04-27', stage: 'Quarter Final', tier: 'Epic' },
  { id: 'M004', teams: 'Talon ID vs Mahadewa', date: '2025-04-27', stage: 'Quarter Final', tier: 'Epic' },
  { id: 'M005', teams: 'Vesakha vs Team Nemesis', date: '2025-04-24', stage: 'Group Stage', tier: 'Epic' },
  { id: 'M006', teams: 'Bigetron by Vitality vs ONIC Esports', date: '2025-10-11', stage: 'Grand Final Fall 2025', tier: 'Mythic' },
  { id: 'M007', teams: 'Kagendra vs RRQ', date: '2025-09-28', stage: 'Semi Final Fall 2025', tier: 'Legend' },
  { id: 'M008', teams: 'Dominator Esports vs Mahadewa', date: '2025-09-21', stage: 'Group Stage Fall 2025', tier: 'Epic' },
];

// Harga per kategori
const PRICES = { Mythic: 500000, Legend: 250000, Epic: 100000 };

// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────
let tickets = [];        // array of ticket objects
let editingId = null;    // ID tiket yang sedang di-edit
let toastTimer = null;

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const formatRupiah = (n) =>
  'Rp ' + Number(n).toLocaleString('id-ID');

const generateId = () =>
  'IKL-' + Date.now().toString(36).toUpperCase().slice(-5);

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─────────────────────────────────────────────
// LOCAL STORAGE
// ─────────────────────────────────────────────
const LS_KEY = 'ikl_tickets_v1';

const saveToStorage = () => {
  localStorage.setItem(LS_KEY, JSON.stringify(tickets));
};

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    tickets = raw ? JSON.parse(raw) : getDefaultTickets();
  } catch {
    tickets = getDefaultTickets();
  }
};

// Data awal contoh agar tabel tidak kosong
const getDefaultTickets = () => [
  { id: 'IKL-A1B2C', code: 'IKL-A1B2C', name: 'LeBron James', match: 'Kagendra vs Bigetron by Vitality', category: 'Mythic', qty: 2, price: 500000, date: '2025-04-20' },
  { id: 'IKL-D3E4F', code: 'IKL-D3E4F', name: 'Luka Dončić', match: 'RRQ vs ONIC Esports', category: 'Legend', qty: 3, price: 250000, date: '2025-04-21' },
  { id: 'IKL-G5H6I', code: 'IKL-G5H6I', name: 'Giannis Antetokounmpo', match: 'Alter Ego vs Dominator Esports', category: 'Epic', qty: 4, price: 100000, date: '2025-04-21' },
  { id: 'IKL-J7K8L', code: 'IKL-J7K8L', name: 'Stephen Curry', match: 'Bigetron by Vitality vs ONIC Esports', category: 'Mythic', qty: 1, price: 500000, date: '2025-04-22' },
  { id: 'IKL-M9N0O', code: 'IKL-M9N0O', name: 'Anthony Edwards', match: 'Kagendra vs RRQ', category: 'Legend', qty: 2, price: 250000, date: '2025-04-22' },
  { id: 'IKL-P2Q3R', code: 'IKL-P2Q3R', name: 'Shai Gilgeous-Alexander', match: 'Talon ID vs Mahadewa', category: 'Epic', qty: 4, price: 100000, date: '2025-04-23' },
  { id: 'IKL-S4T5U', code: 'IKL-S4T5U', name: 'Victor Wembanyama', match: 'Kagendra vs Bigetron by Vitality', category: 'Mythic', qty: 1, price: 500000, date: '2025-04-23' },
  { id: 'IKL-V6W7X', code: 'IKL-V6W7X', name: 'Jayson Tatum', match: 'Vesakha vs Team Nemesis', category: 'Epic', qty: 3, price: 100000, date: '2025-04-24' },
  { id: 'IKL-Y8Z9A', code: 'IKL-Y8Z9A', name: 'Nikola Jokić', match: 'Dominator Esports vs Mahadewa', category: 'Legend', qty: 2, price: 250000, date: '2025-04-24' },
  { id: 'IKL-B0C1D', code: 'IKL-B0C1D', name: 'Devin Booker', match: 'RRQ vs ONIC Esports', category: 'Mythic', qty: 2, price: 500000, date: '2025-04-25' },
];

// ─────────────────────────────────────────────
// RENDER: MATCH CARDS
// ─────────────────────────────────────────────
// SVG paths untuk match card
const icoSwords = `<svg class="ico" viewBox="0 0 24 24"><line x1="14.5" y1="17.5" x2="3" y2="6"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="4" x2="20" y2="8"/><line x1="3.47" y1="12.53" x2="7.97" y2="8.03"/><line x1="6" y1="4" x2="2" y2="8"/><line x1="21" y1="12" x2="13" y2="20"/></svg>`;
const icoCal = `<svg class="ico" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

const renderMatchCards = () => {
  const grid = $('#match-cards');
  grid.innerHTML = MATCH_DATA.map((m, i) => `
    <article class="match-card" style="animation-delay:${i * 0.07}s" data-match-id="${m.id}">
      <h3>${icoSwords} ${m.teams}</h3>
      <p class="match-date">${icoCal} ${formatDate(m.date)}</p>
      <span class="badge ${m.tier.toLowerCase()}">${m.tier}</span>
      <p class="match-stage">${m.stage}</p>
    </article>
  `).join('');
};

// ─────────────────────────────────────────────
// RENDER: STATISTICS
// ─────────────────────────────────────────────
const renderStats = () => {
  const totalTickets = tickets.reduce((sum, t) => sum + Number(t.qty), 0);
  const totalRevenue = tickets.reduce((sum, t) => sum + (Number(t.qty) * Number(t.price)), 0);
  const lowStock = tickets.filter(t => Number(t.qty) < 5).length;
  const totalTx = tickets.length;

  // Animasi angka
  animateCounter('total-tickets', totalTickets);
  $('#total-revenue').textContent = formatRupiah(totalRevenue);
  animateCounter('low-stock-count', lowStock);
  animateCounter('total-matches', totalTx);

  // Quick stats sidebar
  $('#qs-total').textContent = tickets.reduce((s, t) => s + Number(t.qty), 0);
  $('#qs-mythic').textContent = tickets.filter(t => t.category === 'Mythic').reduce((s, t) => s + Number(t.qty), 0);
  $('#qs-legend').textContent = tickets.filter(t => t.category === 'Legend').reduce((s, t) => s + Number(t.qty), 0);
  $('#qs-epic').textContent = tickets.filter(t => t.category === 'Epic').reduce((s, t) => s + Number(t.qty), 0);
};

const animateCounter = (id, target) => {
  const el = document.getElementById(id);
  if (!el) return;
  const current = parseInt(el.textContent) || 0;
  const step = Math.ceil(Math.abs(target - current) / 20) || 1;
  let val = current;
  const interval = setInterval(() => {
    if (val < target) { val = Math.min(val + step, target); }
    else if (val > target) { val = Math.max(val - step, target); }
    el.textContent = val;
    if (val === target) clearInterval(interval);
  }, 30);
};

// ─────────────────────────────────────────────
// RENDER: TICKET TABLE
// ─────────────────────────────────────────────
const getFilteredTickets = () => {
  const query = ($('#search-input').value || '').toLowerCase().trim();
  const checkedCats = [...$$('.filter-cb:checked')].map(cb => cb.value);

  return tickets.filter(t => {
    const matchSearch = !query ||
      t.name.toLowerCase().includes(query) ||
      t.code.toLowerCase().includes(query) ||
      t.match.toLowerCase().includes(query);
    const matchCat = checkedCats.includes(t.category);
    return matchSearch && matchCat;
  });
};

const renderTable = () => {
  const filtered = getFilteredTickets();
  const tbody = $('#ticket-tbody');
  const emptyState = $('#empty-state');
  const rowCountLabel = $('#row-count-label');

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyState.style.display = 'block';
    rowCountLabel.textContent = 'Tidak ada data yang cocok';
    return;
  }

  emptyState.style.display = 'none';
  rowCountLabel.textContent = `Menampilkan ${filtered.length} dari ${tickets.length} data`;

  // SVG icons untuk tombol aksi
  const icoEdit = `<svg class="ico" viewBox="0 0 24 24" style="width:12px;height:12px"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  const icoDel = `<svg class="ico" viewBox="0 0 24 24" style="width:12px;height:12px"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;
  const icoWarn = `<svg class="ico" viewBox="0 0 24 24" style="width:11px;height:11px;stroke:var(--ikl-red)"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

  tbody.innerHTML = filtered.map(t => {
    const total = Number(t.qty) * Number(t.price);
    const isLow = Number(t.qty) < 5;
    return `
      <tr class="${isLow ? 'low-stock-row' : ''}" data-id="${t.id}">
        <td class="ticket-code">${t.code}</td>
        <td>${t.name}</td>
        <td>${t.match}</td>
        <td><span class="badge ${t.category.toLowerCase()}">${t.category}</span></td>
        <td class="${isLow ? 'low-stock' : ''}">${t.qty}${isLow ? ` ${icoWarn}` : ''}</td>
        <td>${formatRupiah(t.price)}</td>
        <td class="ticket-total">${formatRupiah(total)}</td>
        <td>${formatDate(t.date)}</td>
        <td>
          <div class="action-btns">
            <button class="btn-edit" data-action="edit" data-id="${t.id}" aria-label="Edit tiket ${t.code}">${icoEdit} Edit</button>
            <button class="btn-delete" data-action="delete" data-id="${t.id}" aria-label="Hapus tiket ${t.code}">${icoDel} Hapus</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  renderStats();
};

// ─────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────
const clearErrors = () => {
  $$('.error-msg').forEach(el => { el.textContent = ''; });
  $$('.input-error').forEach(el => el.classList.remove('input-error'));
};

const setError = (inputId, errId, message) => {
  const input = document.getElementById(inputId);
  const errEl = document.getElementById(errId);
  if (input) input.classList.add('input-error');
  if (errEl) errEl.textContent = message;
};

const validateForm = () => {
  clearErrors();
  let valid = true;

  const code = $('#ticket-code').value.trim();
  const name = $('#buyer-name').value.trim();
  const match = $('#match-select').value;
  const category = $('#category-select').value;
  const qty = parseInt($('#ticket-qty').value);
  const price = parseFloat($('#ticket-price').value);
  const date = $('#ticket-date').value;

  // Kode tiket
  if (!code) {
    setError('ticket-code', 'err-code', '⚠ Kode tiket wajib diisi.');
    valid = false;
  } else if (!/^IKL-[A-Z0-9\-]{2,}$/i.test(code)) {
    setError('ticket-code', 'err-code', 'Format kode: IKL-XXXXX');
    valid = false;
  } else {
    // Cek duplikat kode (kecuali saat edit tiket yang sama)
    const isDuplicate = tickets.some(t => t.code.toUpperCase() === code.toUpperCase() && t.id !== editingId);
    if (isDuplicate) {
      setError('ticket-code', 'err-code', 'Kode tiket sudah digunakan.');
      valid = false;
    }
  }

  // Nama pembeli
  if (!name) {
    setError('buyer-name', 'err-name', 'Nama pembeli wajib diisi.');
    valid = false;
  } else if (name.length < 3) {
    setError('buyer-name', 'err-name', 'Nama minimal 3 karakter.');
    valid = false;
  }

  // Pertandingan
  if (!match) {
    setError('match-select', 'err-match', 'Pilih pertandingan.');
    valid = false;
  }

  // Kategori
  if (!category) {
    setError('category-select', 'err-category', 'Pilih kategori kursi.');
    valid = false;
  }

  // Jumlah tiket
  if (!$('#ticket-qty').value || isNaN(qty) || qty < 1 || qty > 10) {
    setError('ticket-qty', 'err-qty', 'Jumlah tiket 1 – 10.');
    valid = false;
  }

  // Harga
  if (!$('#ticket-price').value || isNaN(price) || price < 0) {
    setError('ticket-price', 'err-price', 'Harga tidak valid (min: 0).');
    valid = false;
  }

  // Tanggal
  if (!date) {
    setError('ticket-date', 'err-date', 'Tanggal pembelian wajib diisi.');
    valid = false;
  }

  return valid;
};

// ─────────────────────────────────────────────
// FORM: ADD / UPDATE
// ─────────────────────────────────────────────
const handleFormSubmit = (e) => {
  e.preventDefault();
  if (!validateForm()) {
    showToast('Periksa kembali form sebelum menyimpan.', 'error');
    return;
  }

  const data = {
    id: editingId || generateId(),
    code: $('#ticket-code').value.trim().toUpperCase(),
    name: $('#buyer-name').value.trim(),
    match: $('#match-select').value,
    category: $('#category-select').value,
    qty: parseInt($('#ticket-qty').value),
    price: parseFloat($('#ticket-price').value),
    date: $('#ticket-date').value,
  };

  if (editingId) {
    // Update existing
    const idx = tickets.findIndex(t => t.id === editingId);
    if (idx !== -1) tickets[idx] = data;
    showToast('Tiket berhasil diperbarui.', 'success');
    cancelEdit();
  } else {
    // Add new → unshift agar muncul di atas
    tickets.unshift(data);
    showToast('Tiket berhasil ditambahkan.', 'success');
  }

  saveToStorage();
  resetForm();
  renderTable();
};

const resetForm = () => {
  $('#ticket-form').reset();
  clearErrors();
  editingId = null;
};

// ─────────────────────────────────────────────
// EDIT
// ─────────────────────────────────────────────
// helper set submit button content (with SVG)
const setSubmitBtn = (mode) => {
  const btn = $('#submit-btn');
  if (mode === 'edit') {
    btn.innerHTML = `<svg class="ico" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Simpan Perubahan`;
  } else {
    btn.innerHTML = `<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> Tambah Tiket`;
  }
};

const startEdit = (id) => {
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) return;

  editingId = id;

  $('#ticket-code').value = ticket.code;
  $('#buyer-name').value = ticket.name;
  $('#match-select').value = ticket.match;
  $('#category-select').value = ticket.category;
  $('#ticket-qty').value = ticket.qty;
  $('#ticket-price').value = ticket.price;
  $('#ticket-date').value = ticket.date;

  setSubmitBtn('edit');
  $('#cancel-edit-btn').style.display = 'inline-flex';
  $('#form-title').textContent = 'Edit Tiket';
  $('#form-subtitle').textContent = `Mengedit: ${ticket.code}`;

  const bookingSection = $('#booking');
  bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  bookingSection.classList.add('edit-mode');
  setTimeout(() => bookingSection.classList.remove('edit-mode'), 800);

  showToast(`Mode edit aktif — ${ticket.code}`, 'warning');
};

const cancelEdit = () => {
  editingId = null;
  resetForm();
  setSubmitBtn('add');
  $('#cancel-edit-btn').style.display = 'none';
  $('#form-title').textContent = 'Booking Tiket';
  $('#form-subtitle').textContent = 'Isi data pemesanan tiket di bawah ini';
};

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────
const deleteTicket = (id) => {
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) return;

  const confirmed = window.confirm(
    `Konfirmasi Hapus Tiket\n\nKode     : ${ticket.code}\nPembeli  : ${ticket.name}\nMatch    : ${ticket.match}\n\nData tidak dapat dikembalikan. Lanjutkan?`
  );

  if (!confirmed) {
    showToast('Penghapusan dibatalkan.', 'warning');
    return;
  }

  tickets = tickets.filter(t => t.id !== id);
  saveToStorage();
  renderTable();
  showToast(`Tiket ${ticket.code} berhasil dihapus.`, 'success');
};

// ─────────────────────────────────────────────
// EVENT DELEGATION — TABLE ACTIONS
// ─────────────────────────────────────────────
const initTableDelegation = () => {
  $('#ticket-tbody').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === 'edit') startEdit(id);
    if (action === 'delete') deleteTicket(id);
  });
};

// ─────────────────────────────────────────────
// SEARCH — Real-time
// ─────────────────────────────────────────────
const initSearch = () => {
  $('#search-input').addEventListener('input', () => renderTable());
};

// ─────────────────────────────────────────────
// FILTER — Kategori
// ─────────────────────────────────────────────
const initFilter = () => {
  $$('.filter-cb').forEach(cb => {
    cb.addEventListener('change', () => renderTable());
  });

  $('#reset-filter-btn').addEventListener('click', () => {
    $$('.filter-cb').forEach(cb => { cb.checked = true; });
    $('#search-input').value = '';
    renderTable();
    showToast('Filter direset ke semua kategori.', 'success');
  });
};

// ─────────────────────────────────────────────
// AUTO-FILL HARGA berdasar kategori
// ─────────────────────────────────────────────
const initPriceAutoFill = () => {
  $('#category-select').addEventListener('change', (e) => {
    const cat = e.target.value;
    if (cat && PRICES[cat] && !editingId) {
      $('#ticket-price').value = PRICES[cat];
    }
  });
};

// ─────────────────────────────────────────────
// TOAST NOTIFICATION
// ─────────────────────────────────────────────
const showToast = (message, type = 'success') => {
  const toast = $('#toast');
  const msgEl = $('#toast-msg');
  if (msgEl) msgEl.textContent = message;
  else toast.textContent = message;   // fallback
  toast.className = `show ${type}`;

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.className = '';
  }, 3500);
};

// ─────────────────────────────────────────────
// NAV: Active-link on scroll
// ─────────────────────────────────────────────
const initNavScroll = () => {
  const header = $('header');
  const sections = $$('section[id], div[id="home"]');
  const navLinks = $$('.nav-link');

  window.addEventListener('scroll', () => {
    // Header shadow
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');

    // Active nav
    let current = 'home';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }, { passive: true });
};

// ─────────────────────────────────────────────
// MOBILE MENU TOGGLE
// ─────────────────────────────────────────────
const initMobileMenu = () => {
  const toggle = $('#menu-toggle');
  const nav = $('nav');

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
    toggle.textContent = isOpen ? '✕' : '☰';
  });

  // Close on nav link click
  $$('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
      toggle.textContent = '☰';
    });
  });
};

// ─────────────────────────────────────────────
// SET DEFAULT DATE = today
// ─────────────────────────────────────────────
const setDefaultDate = () => {
  const today = new Date().toISOString().split('T')[0];
  $('#ticket-date').value = today;
  $('#ticket-date').max = today;
};

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
const init = () => {
  loadFromStorage();
  renderMatchCards();
  renderTable();
  renderStats();
  setDefaultDate();

  // Form
  $('#ticket-form').addEventListener('submit', handleFormSubmit);
  $('#cancel-edit-btn').addEventListener('click', cancelEdit);

  // Features
  initTableDelegation();
  initSearch();
  initFilter();
  initPriceAutoFill();
  initNavScroll();
  initMobileMenu();

  console.log('%c🎮 IKL Ticket Hub Loaded!', 'color:#E63946; font-weight:bold; font-size:14px;');
  console.log('%cIndonesia Kings League — Honor of Kings Season 2025', 'color:#FF6A00;');
};

document.addEventListener('DOMContentLoaded', init);

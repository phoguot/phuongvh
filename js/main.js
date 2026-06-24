/* =========================================
   VHP CARE – main.js

   CẤU HÌNH EMAIL (Formspree):
   1. Vào https://formspree.io → Đăng ký bằng eros.yun711@gmail.com
   2. Tạo form mới → Copy Form ID (dạng: xpwaoryz)
   3. Thay FORMSPREE_ID bên dưới bằng ID của bạn
   ========================================= */

const TO_EMAIL     = 'eros.yun711@gmail.com';
const FORMSPREE_ID = '';   // ← paste Formspree form ID vào đây

/* =========================================
   HEADER – sticky
   ========================================= */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

/* =========================================
   BURGER MENU
   ========================================= */
const burger = document.getElementById('burger');
const navEl  = document.querySelector('nav');

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  navEl.classList.toggle('open');
});
document.querySelectorAll('.nav-list a').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    navEl.classList.remove('open');
  });
});

/* =========================================
   SCROLL ANIMATION
   ========================================= */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('in'), i * 80);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.fade-up').forEach(el => io.observe(el));

/* =========================================
   HERO SLIDESHOW
   ========================================= */
let heroIdx = 0;
let heroTimer;

function heroGoTo(n) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  slides[heroIdx].classList.remove('active');
  dots[heroIdx].classList.remove('active');
  heroIdx = ((n % slides.length) + slides.length) % slides.length;
  slides[heroIdx].classList.add('active');
  dots[heroIdx].classList.add('active');
}

function heroSlide(dir) {
  clearTimeout(heroTimer);
  heroGoTo(heroIdx + dir);
  startHeroAuto();
}

function startHeroAuto() {
  clearTimeout(heroTimer);
  heroTimer = setTimeout(() => {
    heroGoTo(heroIdx + 1);
    startHeroAuto();
  }, 5000);
}
startHeroAuto();

// Touch support for hero
(function () {
  const slider = document.getElementById('heroSlider');
  let startX = 0;
  slider.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) heroSlide(dx < 0 ? 1 : -1);
  }, { passive: true });
})();

/* =========================================
   GALLERY SLIDESHOW
   ========================================= */
const GALLERY_VISIBLE = () => window.innerWidth <= 480 ? 1 : window.innerWidth <= 768 ? 2 : window.innerWidth <= 1100 ? 3 : 4;
const GALLERY_TOTAL   = 10;
let galleryIdx = 0;
let galleryAutoTimer;

function buildGalleryDots() {
  const dotsEl   = document.getElementById('galleryDots');
  const visible  = GALLERY_VISIBLE();
  const maxIdx   = Math.max(0, GALLERY_TOTAL - visible);
  dotsEl.innerHTML = '';
  for (let i = 0; i <= maxIdx; i++) {
    const d = document.createElement('span');
    d.className = 'gallery-dot' + (i === galleryIdx ? ' active' : '');
    d.onclick   = () => { galleryGoTo(i); };
    dotsEl.appendChild(d);
  }
}

function galleryGoTo(n) {
  const track   = document.getElementById('galleryTrack');
  const visible = GALLERY_VISIBLE();
  const maxIdx  = Math.max(0, GALLERY_TOTAL - visible);
  galleryIdx = Math.max(0, Math.min(n, maxIdx));

  const slideW = track.children[0].offsetWidth + 16; // gap=16
  track.style.transform = `translateX(-${galleryIdx * slideW}px)`;

  document.querySelectorAll('.gallery-dot').forEach((d, i) => d.classList.toggle('active', i === galleryIdx));
}

function gallerySlide(dir) {
  clearTimeout(galleryAutoTimer);
  galleryGoTo(galleryIdx + dir);
  startGalleryAuto();
}

function startGalleryAuto() {
  clearTimeout(galleryAutoTimer);
  galleryAutoTimer = setTimeout(() => {
    const visible = GALLERY_VISIBLE();
    const maxIdx  = Math.max(0, GALLERY_TOTAL - visible);
    galleryGoTo(galleryIdx >= maxIdx ? 0 : galleryIdx + 1);
    startGalleryAuto();
  }, 3500);
}

window.addEventListener('resize', () => {
  galleryGoTo(0);
  buildGalleryDots();
});
buildGalleryDots();
startGalleryAuto();

// Touch support for gallery
(function () {
  const vp = document.getElementById('galleryViewport');
  if (!vp) return;
  let startX = 0;
  vp.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  vp.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) gallerySlide(dx < 0 ? 1 : -1);
  }, { passive: true });
})();

/* =========================================
   CART – dữ liệu & render
   ========================================= */
// items: [{ name, price, img, qty }]
let cartItems = [];

function addToCart(btn, name, price) {
  // Lấy ảnh gần nhất trong card
  const card = btn.closest('.product-card');
  const img  = card ? card.querySelector('img')?.src : 'images/1.webp';

  const existing = cartItems.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cartItems.push({ name, price, img, qty: 1 });
  }

  updateCartBadge();
  btn.classList.add('bounce');
  setTimeout(() => btn.classList.remove('bounce'), 400);

  // Mini flash trên badge
  const badge = document.getElementById('cartCount');
  badge.classList.add('badge-pop');
  setTimeout(() => badge.classList.remove('badge-pop'), 400);
}

function removeFromCart(name) {
  cartItems = cartItems.filter(i => i.name !== name);
  updateCartBadge();
  renderCartList();
}

function changeQtyCart(name, delta) {
  const item = cartItems.find(i => i.name === name);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  updateCartBadge();
  renderCartList();
}

function updateCartBadge() {
  const total = cartItems.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = total;
}

function cartSubtotal() {
  return cartItems.reduce((s, i) => s + i.price * i.qty, 0);
}

function fmtPrice(n) {
  return n.toLocaleString('vi-VN') + 'đ';
}

function renderCartList() {
  const list      = document.getElementById('cart-list');
  const emptyEl   = document.getElementById('cart-empty');
  const hasItemEl = document.getElementById('cart-has-items');
  const countEl   = document.getElementById('cart-item-count');
  const totalEl   = document.getElementById('cart-total');
  const subtotEl  = document.getElementById('cart-subtotal');

  const totalQty = cartItems.reduce((s, i) => s + i.qty, 0);
  countEl.textContent = totalQty + ' sản phẩm';

  if (cartItems.length === 0) {
    emptyEl.style.display   = '';
    hasItemEl.hidden         = true;
    list.innerHTML           = '';
    return;
  }

  emptyEl.style.display = 'none';
  hasItemEl.hidden       = false;

  list.innerHTML = cartItems.map(item => `
    <li class="cart-item">
      <img class="cart-item-img" src="${item.img}" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${fmtPrice(item.price * item.qty)}</div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-ctrl" onclick="changeQtyCart('${item.name.replace(/'/g, "\\'")}', -1)">−</button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-ctrl" onclick="changeQtyCart('${item.name.replace(/'/g, "\\'")}', 1)">+</button>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.name.replace(/'/g, "\\'")}')">
        <i class="fas fa-trash-alt"></i>
      </button>
    </li>
  `).join('');

  const sub = cartSubtotal();
  subtotEl.textContent = fmtPrice(sub);
  totalEl.textContent  = fmtPrice(sub); // phí ship miễn phí
}

function clearCart() {
  cartItems = [];
  updateCartBadge();
  renderCartList();
}

/* =========================================
   CART MODAL
   ========================================= */
const cartModal = document.getElementById('cart-modal');

function openCartModal() {
  renderCartList();
  cartModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCartModal() {
  cartModal.classList.remove('open');
  document.body.style.overflow = '';
}

function overlayClickCart(e) {
  if (e.target === cartModal) closeCartModal();
}

/* =========================================
   CHECKOUT MODAL (từ giỏ hàng)
   ========================================= */
const checkoutModal  = document.getElementById('checkout-modal');
const checkoutFormW  = document.getElementById('checkout-form-wrap');
const checkoutSuccEl = document.getElementById('checkout-success');

function openCheckoutFromCart() {
  closeCartModal();

  // Render order summary
  const summaryEl = document.getElementById('checkout-order-summary');
  const sub = cartSubtotal();
  summaryEl.innerHTML = `
    <h4>Đơn hàng của bạn</h4>
    ${cartItems.map(item => `
      <div class="checkout-order-item">
        <img src="${item.img}" alt="${item.name}">
        <div class="checkout-order-item-info">
          <div class="checkout-order-item-name">${item.name}</div>
          <div class="checkout-order-item-meta">x${item.qty}</div>
        </div>
        <div class="checkout-order-item-price">${fmtPrice(item.price * item.qty)}</div>
      </div>
    `).join('')}
    <div class="checkout-summary-total">
      <span>Tổng thanh toán</span>
      <span>${fmtPrice(sub)}</span>
    </div>
  `;

  checkoutModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
  checkoutModal.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => {
    const form = document.getElementById('checkout-form');
    if (form) form.reset();
    checkoutFormW.style.display = '';
    checkoutSuccEl.hidden = true;
    const btn = document.getElementById('checkout-submit-btn');
    if (btn) { btn.disabled = false; btn.classList.remove('loading'); }
  }, 300);
}

function overlayClickCheckout(e) {
  if (e.target === checkoutModal) closeCheckoutModal();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (checkoutModal.classList.contains('open')) closeCheckoutModal();
    if (cartModal.classList.contains('open'))     closeCartModal();
  }
});

function handleCheckoutSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn  = document.getElementById('checkout-submit-btn');

  const name    = form.querySelector('#ck-name');
  const phone   = form.querySelector('#ck-phone');
  const addr    = form.querySelector('#ck-addr');
  let valid = true;
  [name, phone, addr].forEach(el => el.classList.remove('error'));
  if (!name.value.trim())  { name.classList.add('error');  valid = false; }
  if (!phone.value.trim()) { phone.classList.add('error'); valid = false; }
  if (!addr.value.trim())  { addr.classList.add('error');  valid = false; }
  if (!valid) return;

  btn.disabled = true;
  btn.classList.add('loading');

  const orderLines = cartItems.map(i => `- ${i.name} x${i.qty}: ${fmtPrice(i.price * i.qty)}`).join('\n');
  const params = {
    name:    name.value,
    phone:   phone.value,
    address: addr.value,
    note:    form.querySelector('#ck-note').value || '',
    order:   orderLines,
    total:   fmtPrice(cartSubtotal()),
  };

  if (FORMSPREE_ID) {
    fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(params),
    })
      .then(r => r.ok ? showCheckoutSuccess() : fallbackOrderMailto(params))
      .catch(()  => fallbackOrderMailto(params));
  } else {
    fallbackOrderMailto(params);
  }
}

function fallbackOrderMailto(p) {
  const subject = encodeURIComponent(`[VHP CARE] Đơn hàng từ ${p.name}`);
  const body    = encodeURIComponent(
    `Họ tên:   ${p.name}\nSĐT:      ${p.phone}\nĐịa chỉ:  ${p.address}\n\nĐơn hàng:\n${p.order}\n\nTổng:     ${p.total}\n\nGhi chú:  ${p.note}`
  );
  window.open(`mailto:${TO_EMAIL}?subject=${subject}&body=${body}`);
  showCheckoutSuccess();
}

function showCheckoutSuccess() {
  checkoutFormW.style.display = 'none';
  checkoutSuccEl.hidden = false;
}

/* =========================================
   FAVOURITE TOGGLE
   ========================================= */
function toggleFav(btn) {
  btn.classList.toggle('active');
  const icon = btn.querySelector('i');
  icon.classList.toggle('far');
  icon.classList.toggle('fas');
}

/* =========================================
   CONTACT MODAL
   ========================================= */
const contactModal = document.getElementById('contact-modal');
const contactFormW = document.getElementById('contact-form-wrap');
const contactSucc  = document.getElementById('contact-success');

function openContactModal() {
  contactModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeContactModal() {
  contactModal.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(resetContactForm, 300);
}

function overlayClickContact(e) {
  if (e.target === contactModal) closeContactModal();
}

function resetContactForm() {
  const form = document.getElementById('contact-form');
  if (form) form.reset();
  contactFormW.style.display = '';
  contactSucc.hidden = true;
  const btn = document.getElementById('contact-submit-btn');
  if (btn) { btn.disabled = false; btn.classList.remove('loading'); }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && contactModal.classList.contains('open')) closeContactModal();
});

/* =========================================
   CONTACT FORM SUBMIT
   ========================================= */
function handleContactSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn  = document.getElementById('contact-submit-btn');

  // Validation
  let valid = true;
  const name    = form.querySelector('#cf-name');
  const phone   = form.querySelector('#cf-phone');
  const message = form.querySelector('#cf-message');

  [name, phone, message].forEach(el => el.classList.remove('error'));

  if (!name.value.trim())    { name.classList.add('error');    valid = false; }
  if (!phone.value.trim())   { phone.classList.add('error');   valid = false; }
  if (!message.value.trim()) { message.classList.add('error'); valid = false; }
  if (!valid) return;

  btn.disabled = true;
  btn.classList.add('loading');

  const data = new FormData(form);
  const params = {
    name:    data.get('name')    || '',
    phone:   data.get('phone')   || '',
    email:   data.get('email')   || 'Không cung cấp',
    product: data.get('product') || 'Chưa chọn',
    message: data.get('message') || '',
  };

  if (FORMSPREE_ID) {
    fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(params),
    })
      .then(r => r.ok ? showContactSuccess() : fallbackMailto(params))
      .catch(()  => fallbackMailto(params));
  } else {
    fallbackMailto(params);
  }
}

function fallbackMailto(p) {
  const subject = encodeURIComponent(`[VHP CARE] Yêu cầu tư vấn từ ${p.name}`);
  const body    = encodeURIComponent(
    `Họ tên:   ${p.name}\n` +
    `SĐT:      ${p.phone}\n` +
    `Email:    ${p.email}\n` +
    `Sản phẩm: ${p.product}\n\n` +
    `Nội dung:\n${p.message}`
  );
  window.open(`mailto:${TO_EMAIL}?subject=${subject}&body=${body}`);
  showContactSuccess();
}

function showContactSuccess() {
  contactFormW.style.display = 'none';
  contactSucc.hidden = false;
}

/* =========================================
   SOCIAL PROOF POPUP
   ========================================= */
(function () {
  const buyers = [
    { name: 'Nguyễn T. Hoa',   product: 'Combo 2 Xịt Femini 30ml',       img: 'images/1.webp',   time: '2 phút trước'     },
    { name: 'Trần T. Lan',     product: 'Combo 3 Xịt Phụ Khoa 30ml',     img: 'images/1.2.webp', time: '5 phút trước'     },
    { name: 'Mai T. Hằng',     product: 'Feminner Bọt Vệ Sinh 100ml',     img: 'images/3.webp',   time: 'vài phút trước'   },
    { name: 'Phạm T. Vân',     product: 'Muối Tắm Epsom Salt 500g',       img: 'images/3.1.webp', time: '10 phút trước'    },
    { name: 'Thùy Ngân',       product: 'Dung Dịch Vệ Sinh 200ml',        img: 'images/2.1.webp', time: '15 phút trước'    },
    { name: 'Lê N. Hải',       product: 'Xịt Phụ Khoa Femini 30ml',       img: 'images/2.webp',   time: '20 phút trước'    },
    { name: 'Bích Trâm',       product: 'Combo 2 Xịt Femini 30ml',       img: 'images/1.webp',   time: '30 phút trước'    },
    { name: 'Kim Phương',      product: 'Combo 3 Xịt Phụ Khoa 30ml',     img: 'images/1.3.webp', time: '45 phút trước'    },
    { name: 'Hoàng T. Yến',   product: 'Feminner Bọt Vệ Sinh 100ml',     img: 'images/3.webp',   time: '1 giờ trước'      },
    { name: 'Đinh T. Thu',    product: 'Muối Tắm Epsom Salt 500g',       img: 'images/3.2.webp', time: '1 giờ trước'      },
  ];

  const popup     = document.getElementById('social-popup');
  const nameEl    = document.getElementById('sp-name');
  const productEl = document.getElementById('sp-product-name');
  const timeEl    = document.querySelector('#sp-time span');
  const imgEl     = document.getElementById('sp-product-img');

  let idx = 0;
  let hideTimer, nextTimer;

  function showNext() {
    const b = buyers[idx % buyers.length];
    nameEl.textContent    = b.name;
    productEl.textContent = b.product;
    timeEl.textContent    = b.time;
    imgEl.src             = b.img;
    popup.classList.add('sp-show');
    idx++;

    hideTimer = setTimeout(() => {
      popup.classList.remove('sp-show');
      nextTimer = setTimeout(showNext, 5500);
    }, 4500);
  }

  window.closeSocialPopup = function () {
    clearTimeout(hideTimer);
    clearTimeout(nextTimer);
    popup.classList.remove('sp-show');
    nextTimer = setTimeout(showNext, 8000);
  };

  setTimeout(showNext, 3000);
})();

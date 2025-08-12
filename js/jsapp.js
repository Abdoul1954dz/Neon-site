/*********** CONFIG ***********/
const INSTAGRAM_USERNAME = 'abdelghafournaceri'; // غيّر اسم حساب الإنستجرام هنا
const ADMIN_PASS = 'karak$$moo&a18264827_kool-basterd'; // غيّر كلمة المرور

const PRODUCTS = [
  { id: 1, title: 'Free Fire — 600 Diamonds', price: null },
  { id: 2, title: 'PUBG — 300 UC', price: null },
  { id: 3, title: 'Steam Wallet $10', price: null },
  { id: 4, title: 'PSN Card $20', price: null }
];

const PAYMENT_METHODS = [
  { key: 'skrill', label: 'Skrill' },
  { key: 'cash', label: 'Cash (دفع كاش)' },
  { key: 'baridi', label: 'BaridiMob' },
  { key: 'ccp', label: 'CCP' },
  { key: 'redot', label: 'RedotPay' },
  { key: 'ooredoo', label: 'Ooredoo Flexy' }
];

/*********** app state ***********/
let cart = JSON.parse(localStorage.getItem('cart_v1') || '[]');
const savedPrices = JSON.parse(localStorage.getItem('product_prices_v1') || '{}');

const products = PRODUCTS.map(p => ({
  ...p,
  price: savedPrices[p.id] !== undefined ? savedPrices[p.id] : p.price
}));

/*********** helpers & render ***********/
function formatPrice(p) {
  return '$' + Number(p).toFixed(2);
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = '';
  products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <h3>${p.title}</h3>
      <div class="price">${
        p.price === null
          ? '<span style="color:#ffb3d9;font-weight:700">سعر غير محدد</span><br><small class="note">سيتم تحديد السعر من البائع</small>'
          : formatPrice(p.price)
      }</div>
      <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
        <button class="btn" onclick="addToCart(${p.id})">أضف للسلة</button>
        <button class="btn ghost" onclick="viewDetails(${p.id})">تفاصيل</button>
      </div>
    `;
    grid.appendChild(div);
  });
}

function renderMethods() {
  const m1 = document.getElementById('methods');
  const m2 = document.getElementById('methods-2');
  m1.innerHTML = '';
  m2.innerHTML = '';
  PAYMENT_METHODS.forEach(m => {
    const el = document.createElement('div');
    el.className = 'method';
    el.innerHTML = `<div class="logo">${m.label.charAt(0)}</div><div style="font-weight:700;margin-top:6px">${m.label}</div>`;
    m1.appendChild(el);
    m2.appendChild(el.cloneNode(true));
  });
}

function renderCart() {
  const container = document.getElementById('cart-items');
  container.innerHTML = '';
  if (cart.length === 0) {
    container.innerHTML = '<div class="note">السلة فارغة</div>';
    document.getElementById('cart-total').innerText = '$0.00';
    document.getElementById('cart-note').innerText = '';
    return;
  }
  let allPricesSet = true;
  let total = 0;
  cart.forEach((c, idx) => {
    const prod = products.find(p => p.id === c.id);
    const priceText = prod.price === null ? 'غير محدد' : formatPrice(prod.price);
    if (prod.price === null) allPricesSet = false;
    else total += prod.price * c.qty;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div style="flex:1">
        <div style="font-weight:700">${prod.title}</div>
        <div class="note">${priceText} × <span class="qty">${c.qty}</span></div>
      </div>
      <div><button class="btn ghost" onclick="removeFromCart(${idx})">حذف</button></div>
    `;
    container.appendChild(el);
  });
  document.getElementById('cart-total').innerText = allPricesSet ? formatPrice(total) : '—';
  document.getElementById('cart-note').innerText = allPricesSet ? '' : 'بعض الأسعار غير محددة — سيتم التواصل عبر الإنستجرام لتأكيد السعر.';
}

function addToCart(id) {
  const found = cart.find(c => c.id === id);
  if (found) found.qty++;
  else cart.push({ id, qty: 1 });
  localStorage.setItem('cart_v1', JSON.stringify(cart));
  renderCart();
  flashMessage('أضيف إلى السلة');
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  localStorage.setItem('cart_v1', JSON.stringify(cart));
  renderCart();
}

function viewDetails(id) {
  const p = products.find(x => x.id === id);
  alert(p.title + '\n\n' + (p.price === null ? 'السعر: غير محدد' : 'السعر: ' + formatPrice(p.price)));
}

function flashMessage(txt) {
  const t = document.createElement('div');
  t.style.position = 'fixed';
  t.style.left = '50%';
  t.style.transform = 'translateX(-50%)';
  t.style.bottom = '96px';
  t.style.background = 'rgba(0,0,0,0.6)';
  t.style.padding = '10px 16px';
  t.style.borderRadius = '10px';
  t.style.border = '1px solid rgba(255,255,255,0.04)';
  t.innerText = txt;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1700);
}

/*********** checkout (prepare message + open IG) ***********/
function prepareOrderMessage() {
  if (cart.length === 0) return null;
  let allPricesSet = true;
  let total = 0;
  const lines = [];
  cart.forEach(c => {
    const p = products.find(x => x.id === c.id);
    if (p.price === null) allPricesSet = false;
    else total += p.price * c.qty;
    lines.push(`${p.title} × ${c.qty} — ${p.price === null ? 'السعر غير محدد' : formatPrice(p.price)}`);
  });
  const body = `طلب من موقع GhaTopUp\n\n${lines.join('\n')}\n\nالمجموع: ${
    allPricesSet ? formatPrice(total) : 'سعر غير محدد — أتوقع تواصل لتحديد السعر'
  }\n\nالاسم: \nرقم الهاتف: \nملاحظات:`;
  return { text: body, allPricesSet, total };
}

document.getElementById('checkout').addEventListener

const INSTAGRAM_USERNAME = 'abdelghafournaceri';
const PAYMENT_METHODS = [
  {key:'skrill', label:'Skrill', logo:'assets/skrill.svg'},
  {key:'redot', label:'RedotPay', logo:'assets/redot.svg'},
  {key:'ooredoo', label:'Ooredoo Flexy', logo:'assets/ooredoo.svg'},
  {key:'cash', label:'Cash', logo:''}
];

const PRODUCTS = [
  {id:1,title:'Free Fire — 600 Diamonds',price:0},
  {id:2,title:'PUBG — 300 UC',price:0},
  {id:3,title:'COD Mobile — CP 300',price:0},
  {id:4,title:'Steam Wallet — 10$',price:0},
  {id:5,title:'FIFA Points — 1000',price:0},
  {id:6,title:'Roblox Robux — 1000',price:0}
];

let cart = JSON.parse(localStorage.getItem('gha_cart_v1')||'[]');

function formatDZD(n){ return n + ' DZD'; }
function saveCart(){ localStorage.setItem('gha_cart_v1', JSON.stringify(cart)); updateCartUI(); }
function addToCart(id){ const p = PRODUCTS.find(x=>x.id===id); const found = cart.find(c=>c.id===id); if(found) found.qty++; else cart.push({id,qty:1}); saveCart(); flash('أضيف إلى السلة'); }
function removeFromCart(i){ cart.splice(i,1); saveCart(); }
function clearCart(){ cart=[]; saveCart(); flash('تم تفريغ السلة'); }

function renderProducts(){
  const grid = document.getElementById('products-grid');
  grid.innerHTML='';
  PRODUCTS.forEach(p=>{
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `<h3>${p.title}</h3><div class="price">${formatDZD(p.price)}</div>
      <div class="actions"><button class="btn" onclick="addToCart(${p.id})">أضف للسلة</button><button class="btn ghost" onclick="alert('تفاصيل المنتج: ${p.title}')">تفاصيل</button></div>`;
    grid.appendChild(card);
  });
}

function renderMethods(){
  const m = document.getElementById('methods');
  m.innerHTML='';
  PAYMENT_METHODS.forEach(pm=>{
    const el = document.createElement('div'); el.className='method';
    if(pm.logo){ el.innerHTML = `<img src="${pm.logo}" alt="${pm.label}"><div style="font-weight:700">${pm.label}</div>`; }
    else { el.innerHTML = `<div style="font-weight:700">${pm.label}</div>`; }
    m.appendChild(el);
  });
}

function updateCartUI(){
  const cartItems = document.getElementById('cart-items');
  const cartCount = document.getElementById('cart-count');
  cartItems.innerHTML='';
  if(cart.length===0){ cartItems.innerHTML='<div class="note">السلة فارغة</div>'; document.getElementById('cart-total').innerText='0 DZD'; cartCount.innerText='0'; return; }
  let total=0; cart.forEach((c,i)=>{
    const p = PRODUCTS.find(x=>x.id===c.id);
    total += p.price * c.qty;
    const row = document.createElement('div'); row.className='cart-item';
    row.innerHTML = `<div>${p.title} <div class="note">${formatDZD(p.price)} × ${c.qty}</div></div><div><button class="btn ghost" onclick="removeFromCart(${i})">حذف</button></div>`;
    cartItems.appendChild(row);
  });
  document.getElementById('cart-total').innerText = formatDZD(total);
  cartCount.innerText = cart.reduce((s,x)=>s+x.qty,0);
}

function flash(txt){ const t=document.createElement('div'); t.style.position='fixed'; t.style.left='50%'; t.style.transform='translateX(-50%)'; t.style.bottom='70px'; t.style.padding='10px 16px'; t.style.background='rgba(0,0,0,0.6)'; t.style.border='1px solid rgba(255,255,255,0.04)'; t.style.borderRadius='8px'; t.innerText=txt; document.body.appendChild(t); setTimeout(()=>t.remove(),1600); }

document.getElementById('checkout').addEventListener('click', ()=>{
  const checkoutSection = document.getElementById('checkout-section');
  const orderSummary = document.getElementById('order-summary');
  if(cart.length===0){ flash('السلة فارغة'); return; }
  let all = ''; let total=0;
  cart.forEach(c=>{ const p = PRODUCTS.find(x=>x.id===c.id); all += `${p.title} × ${c.qty} — ${formatDZD(p.price)}\n`; total += p.price*c.qty; });
  orderSummary.innerText = `ملخص الطلب:\n\n${all}\nالمجموع: ${formatDZD(total)}\n`;
  checkoutSection.classList.remove('hidden'); window.scrollTo({top:0,behavior:'smooth'});
});

document.getElementById('back-to-shop').addEventListener('click', ()=>{
  document.getElementById('checkout-section').classList.add('hidden');
});

document.getElementById('clear-cart').addEventListener('click', ()=>{ if(confirm('تفريغ السلة؟')) clearCart(); });

document.getElementById('checkout-form').addEventListener('submit', async function(e){
  e.preventDefault();
  const name = document.getElementById('cust-name').value.trim();
  const phone = document.getElementById('cust-phone').value.trim();
  const note = document.getElementById('cust-note').value.trim();
  const pref = document.getElementById('preferred-pay').value;
  let lines = []; let total=0;
  cart.forEach(c=>{ const p = PRODUCTS.find(x=>x.id===c.id); lines.push(`${p.title} × ${c.qty} — ${formatDZD(p.price)}`); total += p.price*c.qty; });
  const body = `طلب من GhaTopUp\n\n${lines.join('\n')}\n\nالمجموع: ${formatDZD(total)}\nطريقة الدفع: ${pref}\nالاسم: ${name}\nالهاتف: ${phone}\nملاحظات: ${note}`;
  try{ await navigator.clipboard.writeText(body); flash('نُسِخ ملخص الطلب إلى الحافظة'); }catch(e){ flash('النسخ التلقائي فشل — انسخ الملخص يدوياً') }
  window.open('https://instagram.com/' + INSTAGRAM_USERNAME, '_blank');
  alert('تم نسخ ملخص الطلب — الصق الرسالة في رسالة مباشرة على الإنستجرام لإرسال الطلب.');
});

renderProducts(); renderMethods(); updateCartUI();
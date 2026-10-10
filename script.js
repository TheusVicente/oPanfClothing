// ---------- Dados ----------
const SIZES = ['P', 'M', 'G', 'GG', 'XG'];
const COLORS = { 'Marrom': '#6b4423', 'Cinza': '#8a8a8a', 'OFF - WHITE': '#efe9dc', 'Preto': '#111' };

const products = [
    { 
        id: 1, 
        name: 'CAMISETA OVERSIZED - FOGO', 
        price: 119.99, 
        colors: ['Marrom'], 
        size: 'G', 
        images: [
            'OversizedFogo2.jpg',
            'OversizedFogo.jpg',
            
        ]
    },
    { 
        id: 2, 
        name: 'CAMISETA OVERSIZED - CORAGEM', 
        price: 119.99, 
        colors: ['Cinza'], 
        size: 'M', 
        images: [
            'Coragem2.jpg',
            'Coragem.jpg',
        ]
    },
    { 
        id: 3, 
        name: 'CAMISETA OVERSIZED - FULL OF GLORY', 
        price: 119.99, 
        colors: ['OFF - WHITE', 'Preto'], 
        size: 'XG', 
        images: [
            'FullGloryBC2.jpg',
            'FullGloryBC.jpg',
            'FullGloryPT2.jpg',
            'FullGloryPT.jpg'
        ]
    },
    { 
        id: 4, 
        name: 'CAMISETA OVERSIZED - CRUZ', 
        price: 119.99, 
        colors: ['Preto'], 
        size: 'GG', 
        images: [
            'Cruz.jpg',
            'Cruz2.jpg',
         
        ]
    },
    { 
        id: 5, 
        name: 'CAMISETA OVERSIZED - JACÓ', 
        price: 119.99, 
        colors: ['Preto'], 
        size: 'P', 
        images: [
            'Jaco.jpg',
            'Jaco2.jpg',

        ]
    }
];

// Imagem de fundo padrão funcional para o topo (substituindo o arquivo local que faltava)
const SLIDES = ['bg-site.jpg'];

const PIX = 0.97, BULK = 0.05;
let cart = [];

const $ = s => document.querySelector(s); const $$ = s => document.querySelectorAll(s);
const brl = v => 'R$ ' + v.toFixed(2).replace('.', ',');
const parc = p => brl(Math.ceil(p * 100 / 2) / 100);
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };

const grid = $('#products-grid'), drawer = $('#cart-drawer'), overlay = $('#cart-overlay');
const itemsEl = $('#cart-items-container'), countEl = $('#cart-count'), cartBtn = $('#cart-toggle-btn');

const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12 });

function renderProducts() {
    grid.innerHTML = '';
    products.forEach((p, i) => {
        const card = document.createElement('article');
        card.className = 'product-card reveal';
        card.style.setProperty('--d', (i % 4) * .08 + 's');
        card.dataset.id = p.id;
        card.dataset.color = p.colors[0];
        card.dataset.size = p.size;
        card.dataset.imgIdx = 0;

        const dotsHtml = p.images.map((_, idx) => `<span class="img-dot${idx === 0 ? ' on' : ''}"></span>`).join('');

        card.innerHTML = `
            <div class="product-image-wrapper">
                <img src="${p.images[0]}" alt="${p.name}" class="product-image" loading="lazy">
                <button class="img-arrow prev" aria-label="Foto anterior">&#8249;</button>
                <button class="img-arrow next" aria-label="Próxima foto">&#8250;</button>
                <div class="img-dots">${dotsHtml}</div>
                <div class="badges"><span class="badge">5% OFF comprando 2 ou mais</span><span class="badge alt">Frete grátis</span></div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${p.name}</h3>
                <div><span class="opt-label">Cor: <b data-v="color">${p.colors[0]}</b></span>
                    <div class="swatches">${p.colors.map((c, k) => `<button class="swatch${k ? '' : ' on'}" data-color="${c}" title="${c}" aria-label="${c}" style="background:${COLORS[c]}"></button>`).join('')}</div></div>
                <div><span class="opt-label">Tamanho: <b data-v="size">${p.size}</b></span>
                    <div class="sizes">${SIZES.map(s => `<button class="size${s === p.size ? ' on' : ''}" data-size="${s}">${s}</button>`).join('')}</div></div>
                <div class="price">${brl(p.price)}</div>
                <div class="pix">${brl(p.price * PIX)} <small>com Pix</small></div>
                <div class="parc">2 x de ${parc(p.price)} sem juros</div>
                <button class="buy-btn"><span class="label">Comprar</span></button>
            </div>`;
        grid.appendChild(card);
        io.observe(card);
    });
}

function changeProductImage(card, direction) {
    const pId = +card.dataset.id;
    const p = products.find(x => x.id === pId);
    if (!p || !p.images || p.images.length === 0) return;

    let currentIdx = parseInt(card.dataset.imgIdx, 10) || 0;
    if (direction === 'next') {
        currentIdx = (currentIdx + 1) % p.images.length;
    } else {
        currentIdx = (currentIdx - 1 + p.images.length) % p.images.length;
    }

    card.dataset.imgIdx = currentIdx;
    card.querySelector('.product-image').src = p.images[currentIdx];
    card.querySelectorAll('.img-dot').forEach((dot, idx) => dot.classList.toggle('on', idx === currentIdx));
}

grid.addEventListener('click', e => {
    const card = e.target.closest('.product-card');
    if (!card) return;
    const arrowNext = e.target.closest('.img-arrow.next');
    const arrowPrev = e.target.closest('.img-arrow.prev');
    const sw = e.target.closest('.swatch');
    const sz = e.target.closest('.size');
    const buy = e.target.closest('.buy-btn');

    if (arrowNext) { e.preventDefault(); changeProductImage(card, 'next'); }
    else if (arrowPrev) { e.preventDefault(); changeProductImage(card, 'prev'); }
    else if (sw) {
        card.querySelectorAll('.swatch').forEach(b => b.classList.toggle('on', b === sw));
        card.dataset.color = sw.dataset.color;
        card.querySelector('[data-v=color]').textContent = sw.dataset.color;
    } else if (sz) {
        card.querySelectorAll('.size').forEach(b => b.classList.toggle('on', b === sz));
        card.dataset.size = sz.dataset.size;
        card.querySelector('[data-v=size]').textContent = sz.dataset.size;
    } else if (buy) {
        buyAnimation(buy, () => addToCart(+card.dataset.id, card.dataset.color, card.dataset.size));
    }
});

function buyAnimation(btn, action) {
    const label = btn.querySelector('.label');
    const set = t => { label.textContent = t; btn.classList.remove('swap'); void btn.offsetWidth; btn.classList.add('swap'); };
    btn.classList.add('loading');
    setTimeout(() => {
        btn.classList.remove('loading');
        btn.classList.add('done');
        set('✓ Pronto!');
        action();
        setTimeout(() => { btn.classList.remove('done'); set('Comprar'); }, 1500);
    }, calm ? 0 : 650);
}

function addToCart(id, color, size) {
    const p = products.find(x => x.id === id), key = `${id}|${color}|${size}`;
    const found = cart.find(i => i.key === key);
    found ? found.quantity++ : cart.push({ key, id, name: p.name, price: p.price, image: p.images[0], color, size, quantity: 1 });
    updateCartUI();
    cartBtn.classList.remove('bump'); void cartBtn.offsetWidth; cartBtn.classList.add('bump');
    showAdded();
}

function totals() {
    const qty = cart.reduce((a, i) => a + i.quantity, 0);
    const sub = cart.reduce((a, i) => a + i.price * i.quantity, 0);
    const disc = qty >= 2 ? sub * BULK : 0;
    return { qty, sub, disc, total: sub - disc };
}

function updateCartUI() {
    const t = totals();
    countEl.textContent = t.qty;
    $('#cart-subtotal').textContent = brl(t.sub);
    $('#disc-line').hidden = !t.disc;
    $('#cart-discount').textContent = '- ' + brl(t.disc);
    $('#cart-total').textContent = brl(t.total);
    $('#pix-note').textContent = `Ou ${brl(t.total * PIX)} no Pix`;
    itemsEl.innerHTML = cart.length ? cart.map(i => `
        <div class="cart-item">
            <img src="${i.image}" alt="${i.name}" class="cart-item-img">
            <div class="cart-item-details">
                <div class="cart-item-title">${i.name}</div>
                <div class="cart-item-meta">${i.color} · Tam. ${i.size}</div>
                <div class="cart-item-price">${brl(i.price)}</div>
                <div class="cart-item-controls">
                    <button class="qty-btn" data-act="minus" data-key="${i.key}">-</button>
                    <span>${i.quantity}</span>
                    <button class="qty-btn" data-act="plus" data-key="${i.key}">+</button>
                    <button class="remove-item-btn" data-act="remove" data-key="${i.key}">Remover</button>
                </div>
            </div>
        </div>`).join('') : '<p class="empty-cart-msg">O carrinho de compras está vazio.</p>';
}

itemsEl.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const item = cart.find(i => i.key === b.dataset.key);
    if (!item) return;
    if (b.dataset.act === 'plus') item.quantity++;
    if (b.dataset.act === 'minus') item.quantity--;
    if (b.dataset.act === 'remove' || item.quantity <= 0) cart = cart.filter(i => i !== item);
    updateCartUI();
});

let addedTimer;
function showAdded() {
    const t = totals();
    $('#added-total').textContent = `Total (${t.qty} ${t.qty === 1 ? 'produto' : 'produtos'}): ${brl(t.total)}`;
    $('#added').classList.add('show');
    clearTimeout(addedTimer);
    addedTimer = setTimeout(() => $('#added').classList.remove('show'), 4000);
}

function openCart() { $('#added').classList.remove('show'); drawer.classList.add('active'); overlay.classList.add('active'); document.body.classList.add('lock'); }
function closeCart() { drawer.classList.remove('active'); overlay.classList.remove('active'); document.body.classList.remove('lock'); }

cartBtn.addEventListener('click', openCart);
$('#added-view').addEventListener('click', openCart);
$('#close-cart-btn').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
$('#more-btn').addEventListener('click', () => { closeCart(); $('#produtos').scrollIntoView({ behavior: 'smooth' }); });
$('#checkout-btn').addEventListener('click', () => alert(cart.length ? 'Redirecionando para o checkout seguro...' : 'Seu carrinho está vazio!'));

const cep = $('#cep'), cepMsg = $('#cep-msg');
cep.addEventListener('input', () => { const v = cep.value.replace(/\D/g, '').slice(0, 8); cep.value = v.length > 5 ? v.slice(0, 5) + '-' + v.slice(5) : v; });
$('#cep-btn').addEventListener('click', () => {
    if (cep.value.replace(/\D/g, '').length === 8) { cepMsg.textContent = '✓ Frete grátis para este CEP'; }
    else { cepMsg.textContent = 'Digite um CEP válido.'; cep.classList.remove('shake'); void cep.offsetWidth; cep.classList.add('shake'); }
});

const menuBtn = $('#menu-btn'), panel = $('#mobile-panel'), menuOv = $('#menu-overlay');
function toggleMenu(open) {
    menuBtn.classList.toggle('open', open); panel.classList.toggle('active', open);
    menuOv.classList.toggle('active', open); document.body.classList.toggle('lock', open);
}
menuBtn.addEventListener('click', () => toggleMenu(!panel.classList.contains('active')));
menuOv.addEventListener('click', () => toggleMenu(false));
panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
addEventListener('resize', () => { if (innerWidth > 900) toggleMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape') { closeCart(); toggleMenu(false); } });

const slidesEl = $('#slides');
let cur = 0, slideTimer;
SLIDES.forEach((src, i) => {
    const s = document.createElement('div');
    s.className = 'slide' + (i ? '' : ' active');
    s.style.setProperty('--img', `url('${src}')`);
    slidesEl.appendChild(s);
});
function goSlide(n) {
    const all = slidesEl.children;
    cur = (n + all.length) % all.length;
    [...all].forEach((s, i) => s.classList.toggle('active', i === cur));
    $$('.dots button').forEach((d, i) => d.classList.toggle('on', i === cur));
}
if (SLIDES.length > 1) {
    const hero = $('#hero');
    hero.insertAdjacentHTML('beforeend', `<button class="hero-arrow prev" aria-label="Anterior">&#8249;</button><button class="hero-arrow next" aria-label="Próximo">&#8250;</button><div class="dots">${SLIDES.map((_, i) => `<button class="${i ? '' : 'on'}" aria-label="Slide ${i + 1}"></button>`).join('')}</div>`);
    const auto = () => { clearInterval(slideTimer); if (!calm) slideTimer = setInterval(() => goSlide(cur + 1), 6000); };
    hero.querySelector('.prev').onclick = () => { goSlide(cur - 1); auto(); };
    hero.querySelector('.next').onclick = () => { goSlide(cur + 1); auto(); };
    $$('.dots button').forEach((d, i) => d.onclick = () => { goSlide(i); auto(); });
    auto();
}

const navbar = $('#navbar'), progress = $('#progress');
let ticking = false;
function onScroll() {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    navbar.classList.toggle('scrolled', y > 40);
    if (!calm && y < innerHeight) slidesEl.style.transform = `translateY(${y * .22}px)`;
    ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });

const anns = $$('#announcement span');
let ai = 0;
setInterval(() => { anns[ai].classList.remove('on'); ai = (ai + 1) % anns.length; anns[ai].classList.add('on'); }, 3500);

$('#news-form').addEventListener('submit', e => {
    e.preventDefault();
    const inp = $('#news-email'), msg = $('#news-msg');
    if (/^\S+@\S+\.\S+$/.test(inp.value)) { msg.textContent = '✓ Cadastro realizado! Você receberá nossas ofertas.'; inp.value = ''; }
    else { msg.textContent = 'Digite um e-mail válido.'; inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake'); }
});

if (!store.get('panf_cookies')) setTimeout(() => $('#cookies').classList.add('show'), 1200);
$('#cookies-ok').addEventListener('click', () => { $('#cookies').classList.remove('show'); store.set('panf_cookies', '1'); });  renderProducts(); updateCartUI(); $$('.reveal').forEach(el => io.observe(el));
onScroll();
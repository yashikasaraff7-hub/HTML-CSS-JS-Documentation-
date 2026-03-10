const SS = {
credits: parseInt(localStorage.getItem('ss_credits') || '35'),
save() { localStorage.setItem('ss_credits', this.credits); },

addCredits(n) {
    this.credits += n;
    this.save();
    this.renderCredits();
    showToast(`+${n} credits added! 🎉`);
},

spendCredits(n) {
    if (this.credits < n) { showToast('Not enough credits ⚡', 'warn'); return false; }
    this.credits -= n;
    this.save();
    this.renderCredits();
    return true;
},

renderCredits() {
    document.querySelectorAll('.js-credits').forEach(el => {
    el.textContent = this.credits;
    
    el.parentElement?.classList.remove('pulse');
    void el.parentElement?.offsetWidth;
    el.parentElement?.classList.add('pulse');
    });
}
};

function showToast(msg, type = 'success') {
let toast = document.getElementById('toast');
if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.innerHTML = `<span class="toast-icon"></span><span class="toast-msg"></span>`;
    document.body.appendChild(toast);
}
const icon = toast.querySelector('.toast-icon');
const text = toast.querySelector('.toast-msg');
icon.textContent = type === 'success' ? '✅' : type === 'warn' ? '⚠️' : 'ℹ️';
text.textContent = msg;
toast.classList.add('show');
clearTimeout(toast._t);
toast._t = setTimeout(() => toast.classList.remove('show'), 3200);
}

function initStarRating(container, opts = {}) {
if (!container) return;
const { onChange, initial = 0 } = opts;
let current = initial;

const stars = container.querySelectorAll('.star');

function paint(hov) {
    stars.forEach((s, i) => {
    s.classList.toggle('filled', i < (hov ?? current));
    s.classList.toggle('hover',  hov != null && i < hov);
    });
}

stars.forEach((s, i) => {
    s.addEventListener('mouseenter', () => paint(i + 1));
    s.addEventListener('mouseleave', () => paint(null));
    s.addEventListener('click', () => {
    current = i + 1;
    paint(null);
    if (onChange) onChange(current);
    });
});

paint(null);
return { getValue: () => current, setValue: v => { current = v; paint(null); } };
}

function initCategoryFilter(opts = {}) {
const { filterBtns = '.filter-btn', cards = '.skill-card', attr = 'data-cat' } = opts;

const btns  = document.querySelectorAll(filterBtns);
const items = document.querySelectorAll(cards);
const search = document.querySelector('#skillSearch');

function applyFilter() {
    const active = document.querySelector(`${filterBtns}.active`)?.dataset?.cat || 'all';
    const query  = (search?.value || '').toLowerCase().trim();

    items.forEach((card, i) => {
    const cat   = card.getAttribute(attr) || '';
    const text  = card.textContent.toLowerCase();
    const catOk = active === 'all' || cat === active;
    const txtOk = !query || text.includes(query);
    const show  = catOk && txtOk;

    card.style.display = show ? '' : 'none';
    if (show) {
        card.style.animationDelay = `${(i % 6) * 0.07}s`;
        card.classList.remove('fade-up');
        void card.offsetWidth;
        card.classList.add('fade-up');
    }
    });
    const visible = [...items].filter(c => c.style.display !== 'none');
    let empty = document.getElementById('emptyState');
    if (visible.length === 0) {
    if (!empty) {
        empty = document.createElement('div');
        empty.id = 'emptyState';
        empty.style.cssText = 'grid-column:1/-1;text-align:center;padding:3rem;color:var(--muted)';
        empty.innerHTML = `<div style="font-size:2.5rem;margin-bottom:0.5rem">🔍</div><p>No skills match your filter. Try a different category!</p>`;
        items[0]?.parentElement?.appendChild(empty);
    }
    } else {
    empty?.remove();
    }
}
btns.forEach(btn => {
    btn.addEventListener('click', () => {
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter();
    });
});
search?.addEventListener('input', applyFilter);
applyFilter();
}

function openSwapModal(data = {}) {
const overlay = document.getElementById('swapModal');
if (!overlay) return;

if (data.name)     overlay.querySelector('#swapWith').textContent   = data.name || '—';
if (data.offer)    overlay.querySelector('#swapOffering').textContent= data.offer || '—';
if (data.want)     overlay.querySelector('#swapWanting').textContent = data.want  || '—';
if (data.cost)     overlay.querySelector('#swapCost').textContent    = data.cost  || '5';
overlay.classList.add('open');
document.body.style.overflow = 'hidden';
}

function closeSwapModal() {
document.getElementById('swapModal')?.classList.remove('open');
document.body.style.overflow = '';
}
function initSwapModal() {
document.querySelectorAll('[data-close-modal]').forEach(el =>
    el.addEventListener('click', closeSwapModal)
);
document.getElementById('swapModal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeSwapModal();
});

document.getElementById('confirmSwap')?.addEventListener('click', () => {
    const cost = parseInt(document.querySelector('#swapCost')?.textContent || '5');
    const msg  = document.querySelector('#swapMessage')?.value?.trim();

    if (SS.spendCredits(cost)) {
    closeSwapModal();
    showToast('Swap request sent! 🔄 Awaiting confirmation');
    }
});
}
document.addEventListener('DOMContentLoaded', () => {
    SS.renderCredits();
initSwapModal();

const path = location.pathname.split('/').pop();
document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active', href === path || (!path && href === 'skills.html'));
});
document.querySelector('.credit-badge')?.addEventListener('click', () => {
    showToast(`You have ${SS.credits} credits 💰`);
});
});
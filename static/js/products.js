// place in: main/static/main/js/products.js

(function(){
  function getQueryFilter() {
    try { return new URL(window.location.href).searchParams.get('filter') || 'all'; }
    catch(_) { return 'all'; }
  }

  function setState(which) {
    ['state-loading','state-error','state-empty'].forEach(id=>{
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
    if (which) {
      const el = document.getElementById(which);
      if (el) el.classList.remove('hidden');
    }
  }

  function cardHtml(p) {
    return `
    <div class="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div class="aspect-square relative overflow-hidden">
        <a href="${p.detail_url}">
          ${p.thumbnail ? `<img src="${p.thumbnail}" alt="${p.name}" class="w-full h-full object-cover">` : `<div class="w-full h-full bg-gray-200"></div>`}
        </a>
        ${p.discount ? `<div class="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">-${p.discount}%</div>` : ``}
      </div>
      <div class="p-4">
        <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">${p.name}</h3>
        <p class="text-green-600 font-bold text-base mb-1">Rp${Number(p.price).toLocaleString('id-ID')}</p>
        <div class="flex items-center text-xs text-gray-500">⭐ ${p.rating ?? '4.8'} | ${p.sold_count ?? '100+'} terjual</div>
        <p class="text-xs text-gray-500">${p.user ?? ''}</p>
        ${p.is_owner ? `
          <div class="mt-3 flex gap-4 text-sm">
            <button class="text-blue-600 hover:underline js-edit" data-id="${p.id}">Edit</button>
            <button class="text-red-600 hover:underline js-delete" data-id="${p.id}">Delete</button>
          </div>` : ``}
      </div>
    </div>`;
  }

    async function loadProducts() {
    const grid = document.getElementById('product-grid');
    const serverWrap = document.getElementById('server-grid-wrapper');

    if (grid) grid.innerHTML = '';
    setState('state-loading');

    try {
        const resp = await fetch(`/api/products/?filter=${encodeURIComponent(getQueryFilter())}`, { credentials: 'same-origin' });
        if (!resp.ok) throw new Error('bad_status');
        const json = await resp.json();
        const items = (json && json.data) || [];
        
        if (!items.length) {
          // show the server-rendered empty card instead of the plain "No products yet."
          setState(null);
          if (grid) grid.classList.add('hidden');
          if (serverWrap) serverWrap.classList.remove('hidden');
          return;
        }
    
        setState(null);
        if (serverWrap) serverWrap.classList.add('hidden');
        if (grid) {
          grid.classList.remove('hidden');
          grid.innerHTML = items.map(cardHtml).join('');
          wireActions();
        }
        } catch (e) {
          // on error, prefer server fallback instead of a sad red sentence
          setState(null);
          if (grid) grid.classList.add('hidden');
          if (serverWrap) serverWrap.classList.remove('hidden');
        }
    }

  function wireActions() {
    document.querySelectorAll('.js-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = `/product/${btn.dataset.id}/edit/`;
      });
    });
    document.querySelectorAll('.js-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const ok = confirm('Delete this product?'); // temporary until modal iteration
        if (!ok) return;
        const resp = await fetch(`/api/products/${btn.dataset.id}/`, {
          method: 'DELETE',
          headers: { 'X-CSRFToken': getCsrfToken() },
          credentials: 'same-origin'
        });
        if (resp.ok) {
          if (window.showToast) showToast('Deleted', 'Product removed', 'success', 2000);
          loadProducts();
        } else {
          if (window.showToast) showToast('Error', 'Failed to delete', 'error', 2500);
        }
      });
    });
  }

  function enableAjaxMode() {
  const ajaxGrid = document.getElementById('product-grid');
  if (!ajaxGrid) return false;
  ajaxGrid.classList.remove('hidden');
  return true;
 }

  function getCsrfToken() {
    const name = 'csrftoken';
    const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return m ? m[2] : '';
  }

  document.addEventListener('DOMContentLoaded', function () {
  const ajaxActive = enableAjaxMode();

  const btn = document.getElementById('btn-refresh');
  if (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (ajaxActive) loadProducts();
      else window.location.reload();
    });
  }
});
})();

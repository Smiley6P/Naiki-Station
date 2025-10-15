(function(){
  let currentEditId = null;
    let currentDeleteId = null;
    let CATEGORIES = [];
    let lastFocused = null;

    function firstFocusable(root) {
      return root.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    }
    function trapFocus(modal) {
      const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const list = Array.from(focusables);
      function handler(e){
        if (e.key !== 'Tab') return;
        const idx = list.indexOf(document.activeElement);
        if (e.shiftKey && (idx <= 0)) { e.preventDefault(); list[list.length-1]?.focus(); }
        else if (!e.shiftKey && (idx === list.length-1)) { e.preventDefault(); list[0]?.focus(); }
      }
      modal.__trapHandler = handler;
      modal.addEventListener('keydown', handler);
    }
    function untrapFocus(modal) {
      if (modal.__trapHandler) modal.removeEventListener('keydown', modal.__trapHandler);
      modal.__trapHandler = null;
    }

    function setBusy(modalId, busy){
      const modal = document.getElementById(modalId);
      if (!modal) return;
      const btn = modal.querySelector('button[type="submit"], #btn-delete-confirm');
      if (btn) {
        btn.disabled = !!busy;
        btn.classList.toggle('opacity-60', !!busy);
      }
    }


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

    function ensureCategoryOptions() {
      const fill = (sel) => {
        if (!sel) return;
        sel.innerHTML = '';
        CATEGORIES.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c;
          opt.textContent = c;
          sel.appendChild(opt);
        });
      };
      fill(document.getElementById('create-category'));
      fill(document.getElementById('update-category'));
    }

    async function loadCategories() {
      try {
        const resp = await fetch('/api/categories/', { credentials: 'same-origin' });
        if (!resp.ok) throw 0;
        const json = await resp.json();
        CATEGORIES = (json && json.data) || [];
      } catch { CATEGORIES = []; }
      ensureCategoryOptions();
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
      if (!grid) return;
      grid.innerHTML = '';
      setState('state-loading');
      try {
        const resp = await fetch(`/api/products/?filter=${encodeURIComponent(getQueryFilter())}`, { credentials: 'same-origin' });
        if (!resp.ok) throw new Error('bad_status');
        const json = await resp.json();
        const items = (json && json.data) || [];
        if (!items.length) { setState('state-empty'); return; } // shows your pretty block
        setState(null);
        grid.innerHTML = items.map(cardHtml).join('');
        wireActions();
      } catch (e) {
        setState('state-error');
      }
    }


    function wireActions() {
      document.querySelectorAll('.js-edit').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          currentEditId = btn.dataset.id;
          await prefillUpdateFromApi(currentEditId);
          openModal('update');
        });
      });
      document.querySelectorAll('.js-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          currentDeleteId = btn.dataset.id;
          openModal('delete');
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

    function openModal(which) {
        const overlay = document.getElementById('modal-overlay');
        if (!overlay) return;
        lastFocused = document.activeElement;
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
        ['modal-create','modal-update','modal-delete'].forEach(id=>{
          const el = document.getElementById(id); if (el) { el.classList.add('hidden'); untrapFocus(el); }
        });
        const active = document.getElementById(`modal-${which}`);
        if (active) {
          active.classList.remove('hidden');
          const focusEl = firstFocusable(active);
          if (focusEl) focusEl.focus();
          trapFocus(active);
        }
    }

    function closeModal() {
        const overlay = document.getElementById('modal-overlay');
        if (!overlay) return;
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
        ['modal-create','modal-update','modal-delete'].forEach(id=>{
          const el = document.getElementById(id); if (el) { untrapFocus(el); }
        });
        ['create-error','update-error','delete-error'].forEach(id=>{
          const e = document.getElementById(id); if (e) { e.textContent = ''; e.classList.add('hidden'); }
        });
        if (lastFocused) { try { lastFocused.focus(); } catch(_) {} }
    }


    async function prefillUpdateFromApi(id) {
      await loadCategories(); // ensure options are there
      const form = document.getElementById('form-update');
      if (!form) return;
      const resp = await fetch(`/api/products/${id}/`, { credentials: 'same-origin' });
      if (!resp.ok) return;
      const json = await resp.json();
      const p = (json && json.data) || {};
      form.elements['name'].value = p.name ?? '';
      form.elements['price'].value = p.price ?? '';
      form.elements['thumbnail'].value = p.thumbnail ?? '';
      // category
      const sel = document.getElementById('update-category');
      if (sel) {
        ensureCategoryOptions();
        const value = p.category ?? '';
        if ([...sel.options].some(o=>o.value===value)) sel.value = value;
        else if (sel.options.length) sel.selectedIndex = 0;
      }
      form.elements['description'].value = p.description ?? '';
      form.elements['is_featured'].checked = !!p.is_featured;
    }

    async function createProduct(payload) {
      const resp = await fetch('/api/products/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrfToken() },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      return resp;
    }

    async function updateProduct(id, payload) {
      const resp = await fetch(`/api/products/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrfToken() },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      return resp;
    }

    async function deleteProduct(id) {
      const resp = await fetch(`/api/products/${id}/`, {
        method: 'DELETE',
        headers: { 'X-CSRFToken': getCsrfToken() },
        credentials: 'same-origin'
      });
      return resp;
    }

    function formToPayload(form) {
      return {
        name: form.elements['name'].value,
        price: form.elements['price'].value,
        thumbnail: form.elements['thumbnail'].value,
        category: form.elements['category'].value,
        description: form.elements['description'].value,
        is_featured: form.elements['is_featured'].checked
      };
    }

    document.addEventListener('click', function(e){
      if (e.target.matches('#modal-overlay')) closeModal();
      if (e.target.hasAttribute('data-close')) { e.preventDefault(); closeModal(); }
    });

    // CREATE
    document.addEventListener('submit', async function(e){
      if (e.target && e.target.id === 'form-create') {
        e.preventDefault();
        const err = document.getElementById('create-error');
        err.classList.add('hidden'); err.textContent = '';
        setBusy('modal-create', true);
        const resp = await createProduct(formToPayload(e.target));
        setBusy('modal-create', false);
        if (resp.ok) {
          if (window.showToast) showToast('Created', 'Product added', 'success', 2000);
          closeModal(); loadProducts();
        } else {
          const data = await safeJson(resp);
          err.textContent = (data && (data.error || stringifyErrors(data.errors))) || 'Failed to create';
          err.classList.remove('hidden');
          if (window.showToast) showToast('Error', 'Failed to create', 'error', 2500);
        }
      }
    });

    // UPDATE
    document.addEventListener('submit', async function(e){
      if (e.target && e.target.id === 'form-update') {
        e.preventDefault();
        if (!currentEditId) return;
        const err = document.getElementById('update-error');
        err.classList.add('hidden'); err.textContent = '';
        setBusy('modal-update', true);
        const resp = await updateProduct(currentEditId, formToPayload(e.target));
        setBusy('modal-update', false);
        if (resp.ok) {
          if (window.showToast) showToast('Updated', 'Product saved', 'success', 2000);
          closeModal(); loadProducts();
        } else {
          const data = await safeJson(resp);
          err.textContent = (data && (data.error || stringifyErrors(data.errors))) || 'Failed to update';
          err.classList.remove('hidden');
          if (window.showToast) showToast('Error', 'Failed to update', 'error', 2500);
        }
      }
    });

    // DELETE confirm
    document.getElementById('btn-delete-confirm')?.addEventListener('click', async function(e){
      e.preventDefault();
      if (!currentDeleteId) return;
      const err = document.getElementById('delete-error');
      err.classList.add('hidden'); err.textContent = '';
      setBusy('modal-delete', true);
      const resp = await deleteProduct(currentDeleteId);
      setBusy('modal-delete', false);
      if (resp.ok) {
        if (window.showToast) showToast('Deleted', 'Product removed', 'success', 2000);
        closeModal(); loadProducts();
      } else {
        const data = await safeJson(resp);
        err.textContent = (data && (data.error || stringifyErrors(data.errors))) || 'Failed to delete';
        err.classList.remove('hidden');
        if (window.showToast) showToast('Error', 'Failed to delete', 'error', 2500);
      }
    });

    // Add button opens create after categories load
    document.getElementById('btn-add')?.addEventListener('click', async function(e){
      e.preventDefault();
      const form = document.getElementById('form-create');
      if (form) form.reset();
      await loadCategories();
      openModal('create');
    });

    document.addEventListener('DOMContentLoaded', async function () {
      const ajaxActive = enableAjaxMode();
      await loadCategories();
      const btn = document.getElementById('btn-refresh');
      if (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          if (ajaxActive) loadProducts(); else window.location.reload();
        });
      }
      if (ajaxActive) loadProducts();
    });

    document.addEventListener('keydown', function(e){
      const overlay = document.getElementById('modal-overlay');
      if (!overlay) return;
      const visible = !overlay.classList.contains('hidden');
      if (visible && e.key === 'Escape') closeModal();
    });

    document.addEventListener('click', function(e){
      if (e.target.matches('#modal-overlay')) closeModal();
      if (e.target.hasAttribute('data-close')) { e.preventDefault(); closeModal(); }
    });


    async function safeJson(resp) { try { return await resp.json(); } catch { return null; } }
    function stringifyErrors(errors) {
      if (!errors) return '';
      try { return Object.entries(errors).map(([k,v])=>`${k}: ${Array.isArray(v)?v.join(', '):v}`).join('; '); }
      catch { return ''; }
    }
})();

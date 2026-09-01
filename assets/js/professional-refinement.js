(function () {
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'assets/css/professional-refinement.css';
  document.head.appendChild(style);

  function enhanceDays() {
    document.querySelectorAll('.day').forEach(card => {
      const city = card.querySelector('.city-title')?.textContent.trim()
        || card.querySelector('.head small')?.textContent.trim()
        || '';
      if (city) card.dataset.city = city;

      card.querySelectorAll('.slot').forEach(slot => {
        slot.classList.toggle('is-empty', Boolean(slot.querySelector('.empty')));
      });

      const dayNumber = card.querySelector('.day-number');
      const moveDay = Boolean(card.querySelector('.item.transit'));
      if (dayNumber) {
        if (!dayNumber.dataset.baseLabel) dayNumber.dataset.baseLabel = dayNumber.textContent;
        dayNumber.classList.toggle('is-move-day', moveDay);
        const nextLabel = dayNumber.dataset.baseLabel + (moveDay ? ' · 移动日' : '');
        if (dayNumber.textContent !== nextLabel) dayNumber.textContent = nextLabel;
      }
    });
  }

  function enhanceNavigation() {
    const tabs = document.querySelector('.tabs');
    if (!tabs) return;
    const groups = {
      planner: '规划', details: '规划',
      attractions: '了解', guide: '了解', background: '了解',
      confirmations: '准备', memo: '准备'
    };
    tabs.querySelectorAll('.tab').forEach(tab => {
      tab.dataset.group = groups[tab.dataset.panel] || '';
      tab.title = `${tab.dataset.group} · ${tab.textContent}`;
    });
    tabs.querySelector('[data-panel="attractions"]')?.classList.add('group-start');
    tabs.querySelector('[data-panel="confirmations"]')?.classList.add('group-start');
    tabs.addEventListener('click', event => {
      const tab = event.target.closest('.tab');
      if (tab && matchMedia('(max-width:620px)').matches) {
        setTimeout(() => tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }), 0);
      }
    });
  }

  function initFeedback() {
    const toast = document.createElement('div');
    toast.className = 'site-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
    let timer;
    window.showSiteToast = message => {
      toast.textContent = message;
      toast.classList.add('show');
      clearTimeout(timer);
      timer = setTimeout(() => toast.classList.remove('show'), 2200);
    };

    const status = document.querySelector('#status');
    if (status) {
      new MutationObserver(() => {
        status.classList.remove('saved-flash');
        requestAnimationFrame(() => status.classList.add('saved-flash'));
      }).observe(status, { childList: true, characterData: true, subtree: true });
    }

    ['image', 'imageVertical', 'export'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', () => {
        window.showSiteToast(id === 'export' ? '行程数据已开始下载' : '行程图片已开始生成');
      });
    });
    document.querySelector('#confirmations')?.addEventListener('change', event => {
      if (event.target.closest('[data-confirmation]')) window.showSiteToast('确认状态已保存');
    });
    document.querySelector('#memo')?.addEventListener('submit', () => window.showSiteToast('个人备忘已保存'));
  }

  function updateTrustDetails() {
    const footer = document.querySelector('.site-footer');
    if (footer) footer.textContent = '日韩秋日旅行计划 · 最后更新 2026年9月1日 · 动态信息请在临行前复核 · 数据仅保存在你的浏览器中';
  }

  document.addEventListener('DOMContentLoaded', () => {
    enhanceNavigation();
    enhanceDays();
    initFeedback();
    updateTrustDetails();
    const board = document.querySelector('#board');
    if (board) new MutationObserver(enhanceDays).observe(board, { childList: true, subtree: true });
  });
})();

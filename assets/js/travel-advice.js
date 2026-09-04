(function () {
  const advice = {
    busan: {
      title: '釜山｜西面作为主基地',
      stay: '首选西面站步行 5–8 分钟内；备选釜山站。西面兼顾甘川/松岛、海云台和去釜山港。',
      transport: '金海机场 → 机场轻轨 → 沙上 → 地铁 2 号线；市内使用 T-money/Cashbee。9/27 去对马岛前往釜山港国际客运码头，建议提前 60–90 分钟到达。',
      plan: '9/25 松岛缆车＋甘川文化村（落地较晚时二选一）；9/26 龙宫寺 → 松亭 → 海岸列车 → 青沙浦 → 尾浦 → 海云台，体力允许再去广安里看夜景。'
    },
    tsushima: {
      title: '对马岛｜北进南出，分住两晚',
      stay: '9/27 比田胜港附近；9/28 转移后住严原港附近，避免 9/29 赶船。',
      transport: '釜山 → 比田胜；比田胜 → 严原陆路约 2.5 小时，公交班次少且部分需预约，携带行李建议提前安排包车/出租车/租车单程还车；严原 → 博多。',
      plan: '比田胜安排韩国展望所、丰崎神社及北部海岸；9/28 上午北部活动，下午跨岛；9/29 严原港周边轻量游览后乘船。'
    },
    fukuoka: {
      title: '福冈｜博多站作为主基地',
      stay: '住博多站附近，方便从博多港抵达后入住，也方便太宰府、熊本新干线和机场衔接。',
      transport: '市内使用地铁、JR、西铁；太宰府优先西铁；LaLaport 福冈/GUNDAM SIDE-F 单独预留半天至一天。',
      plan: '对马岛抵达日安排栉田神社、博多轻量游；之后安排太宰府、福冈塔，以及大濠公园＋福冈城遗址＋高达夜间演出。'
    },
    kumamoto: {
      title: '熊本｜通町筋/熊本城附近更适合观光',
      stay: '推荐通町筋或熊本城附近；若优先新干线和机场，则住熊本站附近。10/4 晚不要住太偏。',
      transport: '市中心景点用熊本市电；水前寺成趣园乘市电；阿苏火山需单独整日并提前锁定往返班次，火口以当日管制为准。',
      plan: '熊本城、城彩苑、熊本熊广场可放在同一片区；水前寺成趣园另安排半天；阿苏作为天气允许的整日线路。'
    },
    seoul: {
      title: '首尔｜弘大或明洞/乙支路',
      stay: '弘大适合仁川机场铁路和夜生活；明洞/乙支路更适合景福宫、仁寺洞、南山。优先选择距地铁站步行 5–8 分钟内的酒店。',
      transport: '仁川机场优先 AREX 或机场大巴；市内以地铁为主，使用 T-money。10/5 入境后安排弘大，10/6 集中游景福宫、仁寺洞和南山。',
      plan: '跨国转场当天不安排重景点；景福宫＋仁寺洞放上午至中午，南山放下午，按体力调整。'
    }
  };

  function card(city) {
    const a = advice[city];
    return '<article class="travel-advice-card"><h3>' + a.title + '</h3>' +
      '<div class="travel-advice-row"><b>住宿</b><span>' + a.stay + '</span></div>' +
      '<div class="travel-advice-row"><b>交通</b><span>' + a.transport + '</span></div>' +
      '<div class="travel-advice-row"><b>本次安排</b><span>' + a.plan + '</span></div></article>';
  }

  function addAdvice() {
    const guide = document.querySelector('#guide');
    if (!guide || guide.querySelector('.travel-advice-block')) return;
    const block = document.createElement('section');
    block.className = 'travel-advice-block';
    block.innerHTML = '<div class="travel-advice-head"><div><span class="travel-advice-kicker">落地执行建议</span><h2>交通与住宿底稿</h2><p>按当前 A 版本路线整理；酒店和船票地址确定后，可继续写入个人备忘。</p></div><span class="travel-advice-badge">A 方案</span></div><div class="travel-advice-grid">' +
      ['busan', 'tsushima', 'fukuoka', 'kumamoto', 'seoul'].map(card).join('') + '</div>';
    const hero = guide.querySelector('.prep-hero');
    guide.insertBefore(block, hero ? hero.nextSibling : guide.firstChild);
  }

  function addBudget() {
    const panel = document.querySelector('#confirmations');
    if (!panel || panel.querySelector('.cash-budget-card')) return;
    const card = document.createElement('section');
    card.className = 'cash-budget-card';
    card.innerHTML = '<div><span class="travel-advice-kicker">现金准备</span><h2>人均现金储备建议</h2><p>机票、已预订酒店和高额购物不计入；船票若已线上支付，也不计入下列金额。</p></div><div class="cash-budget-grid"><div><b>₩350,000–400,000</b><span>韩国：釜山＋首尔＋交通卡＋备用金</span></div><div><b>¥80,000–100,000</b><span>日本：对马岛＋福冈＋熊本＋临时交通</span></div></div><small>建议同时携带一张可境外支付的 Visa/Mastercard；对马岛小店、公交和出租车优先保留日元现金。</small></section>';
    panel.insertBefore(card, panel.firstChild);
  }

  document.addEventListener('DOMContentLoaded', function () {
    addAdvice();
    addBudget();
  });
})();

(function () {
  const advice = {
    busan: {
      title: '釜山｜西面作为主基地',
      stay: 'Gwangalli Moon Bay Hotel，9/25 17:00 入住，9/28 退房；广安里片区，1间房已确认。',
      transport: '金海机场 → 机场轻轨 → 沙上 → 地铁 2 号线；市内使用 T-money/Cashbee。9/27 去对马岛前往釜山港国际客运码头，建议提前 60–90 分钟到达。',
      plan: '9/25 松岛缆车＋甘川文化村（落地较晚时二选一）；9/26 龙宫寺 → 松亭 → 海岸列车 → 青沙浦 → 尾浦 → 海云台，体力允许再去广安里看夜景。'
    },
    tsushima: {
      title: '对马岛｜比田胜进出，北部慢游',
      stay: 'Toyoko Inn Tsushima Hitakatsu，9/28 15:00 入住，9/29 10:00 退房；比田胜港附近，截图显示2间房。',
      transport: '釜山 → 比田胜直达船优先，抵达后酒店到港口约 5 分钟车程；比田胜 → 博多喷射船约 2 小时 15 分钟、普通渡轮约 5 小时，具体以船班为准。',
      plan: '9/28 安排韩国展望所、三宇田滨、丰崎神社等北部景点；不再跨岛前往严原，减少约 2～2.5 小时陆路转移。'
    },
    fukuoka: {
      title: '福冈｜博多站作为主基地',
      stay: 'HOTEL SOL，9/29 18:00 入住，10/2 11:00 退房；1间房已确认。',
      transport: '市内使用地铁、JR、西铁；太宰府优先西铁；LaLaport 福冈/GUNDAM SIDE-F 单独预留半天至一天。',
      plan: '对马岛抵达日安排栉田神社、博多轻量游；之后安排太宰府、福冈塔，以及大濠公园＋福冈城遗址＋高达夜间演出。'
    },
    kumamoto: {
      title: '熊本｜通町筋/熊本城附近更适合观光',
      stay: 'VIA INN PRIME KUMAMOTO - JR WEST GROUP，10/2 15:00 入住，10/5 10:00 退房；1间房已确认。',
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
    block.innerHTML = '<div class="travel-advice-head"><div><span class="travel-advice-kicker">落地执行建议</span><h2>交通与住宿底稿</h2><p>按最终 B 版本路线整理；酒店和船票地址确定后，可继续写入个人备忘。</p></div><span class="travel-advice-badge">最终行程</span></div><div class="travel-advice-grid">' +
      ['busan', 'tsushima', 'fukuoka', 'kumamoto', 'seoul'].map(card).join('') + '</div>';
    const hero = guide.querySelector('.prep-hero');
    guide.insertBefore(block, hero ? hero.nextSibling : guide.firstChild);
  }

  function addBudget() {
    const panel = document.querySelector('#confirmations');
    if (!panel || panel.querySelector('.cash-budget-card')) return;
    const card = document.createElement('section');
    card.className = 'cash-budget-card';
    card.innerHTML = '<div><span class="travel-advice-kicker">现金准备</span><h2>两人现金储备（已确认）</h2><p>按最终 B 版本准备；这是携带与备用额度，不代表必须全部消费。</p></div><div class="cash-budget-grid"><div><b>₩1,000,000</b><span>韩国两人合计 · 约 ₩500,000/人</span></div><div><b>¥250,000</b><span>日本两人合计 · 约 ¥125,000/人</span></div></div><small>机票、已预订酒店和高额购物不计入。对马岛北进南出涉及跨岛交通，优先保留日元现金；同时携带可境外支付的 Visa/Mastercard，未使用现金可留作下次旅行或回国兑换。</small></section>';
    panel.insertBefore(card, panel.firstChild);
  }

  function addClothing() {
    const guide = document.querySelector('#guide');
    const adviceBlock = guide?.querySelector('.travel-advice-block');
    if (!guide || !adviceBlock || guide.querySelector('.clothing-guide')) return;
    const block = document.createElement('section');
    block.className = 'clothing-guide';
    block.innerHTML = '<div class="travel-advice-head"><div><span class="travel-advice-kicker">9月25日—10月7日</span><h2>国庆前后穿衣指南</h2><p>城市里仍有夏末体感，阿苏、船上和首尔早晚按秋季准备；核心是分层穿着。</p></div><span class="travel-advice-badge">短袖＋中层＋防风层</span></div>' +
      '<div class="climate-strip">' +
        '<article><b>釜山／对马岛</b><strong>约 17–27℃</strong><span>海边与船上风大，短袖外加防风衣</span></article>' +
        '<article><b>福冈</b><strong>约 17–28℃</strong><span>白天短袖为主，早晚加薄外套</span></article>' +
        '<article><b>熊本／阿苏</b><strong>市区 15–27℃</strong><span>阿苏约 8–21℃，需抓绒或卫衣</span></article>' +
        '<article><b>首尔</b><strong>约 10–24℃</strong><span>早晚偏凉，薄长袖与外套叠穿</span></article>' +
      '</div>' +
      '<div class="clothing-bottom"><div><h3>每人装箱建议</h3><ul><li>短袖 4–5 件，薄长袖或衬衫 2 件</li><li>薄卫衣／抓绒 1 件，防风防雨外套 1 件</li><li>长裤 2–3 条，舒适防滑运动鞋 1 双</li><li>速干袜 5–7 双，折叠伞、帽子与防晒</li><li>怕冷者增加轻薄羽绒背心或压缩羽绒服</li></ul></div><div><h3>临行复核</h3><ul><li>9/18–20：查看整体降温与台风趋势</li><li>9/23–24：按城市检查逐日预报</li><li>每次乘船前一天：查风速、海况和停航公告</li><li>阿苏出发前一天：查气温、降雨和火口开放</li></ul><div class="clothing-links"><a href="https://www.data.jma.go.jp/stats/data/en/normal/normal.html" target="_blank" rel="noopener">日本气象厅平年值 ↗</a><a href="https://www.weather.go.kr/w/climate/statistics/region.do" target="_blank" rel="noopener">韩国气象厅气候资料 ↗</a></div></div></div>';
    adviceBlock.insertAdjacentElement('afterend', block);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem('jk-trip-active-plan') !== 'B') {
      localStorage.setItem('jk-trip-active-plan', 'B');
      window.location.reload();
      return;
    }
    document.querySelector('.plan-switch')?.remove();
    addAdvice();
    addClothing();
    addBudget();
  });
})();

/**
 * Action Core
 * © 2026 QWEL.DESIGN (https://qwel.design)
 * Released under the MIT License.
 * See LICENSE file for details.
 */

/**
 * Scroll To Anchor
 */
class ScrollToAnchor {
  constructor(options = {}) {
    // options
    // cssVar: header高さを格納するCSS変数名
    // offset: header高さのフォールバック値
    this.cssVar = options.cssVar || '--scroll-offset';
    this.fallbackOffset = options.offset ?? 0;

    // bind
    this.updateOffset = this.updateOffset.bind(this);
    this.onResize = this.onResize.bind(this);

    // resize throttle
    this.resizeTicking = false;

    // イベント登録
    this.handleEvents();

    // 初期表示
    this.updateOffset();
    this.correctInitialAnchor();
  }

  handleEvents() {
    window.addEventListener('resize', this.onResize, { passive: true });
    window.addEventListener('scroll', this.onResize, { passive: true });
  }
  
  onResize() {
    if (this.resizeTicking) return;

    // requestAnimationFrame でスロットル
    this.resizeTicking = true;
    requestAnimationFrame(() => {
      this.updateOffset();
      this.resizeTicking = false;
    });
  }

  updateOffset() {
    // header高さを取得してCSS変数にセット
    const offset = this.getHeaderOffset();
    document.documentElement.style.setProperty(this.cssVar, `${offset}px`);
  }

  getHeaderOffset() {
    const header = document.querySelector('[data-site-header]');
    return header ? header.offsetHeight : this.fallbackOffset;
  }
  
  // CSS変数反映後にアンカー位置を再計算させるため,
  // hash を一度リセットして再適用する
  correctInitialAnchor() {
    const { hash } = window.location;
    if (!hash) return;

    // history を汚さないため replaceState を使用
    history.replaceState(null, '', window.location.pathname + window.location.search);
    history.replaceState(null, '', window.location.pathname + window.location.search + hash);
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('scroll', this.onResize);
  }
}

/**
 * Scroll Spy
 */
class ScrollSpy {
  constructor(options = {}) {
    this.options = options;
    this.autoInit = options.autoInit ?? true;

    if (this.autoInit) {
      if (document.readyState === 'loading') {
        // DOMContentLoaded を待って初期化
        document.addEventListener('DOMContentLoaded', () => this.init(), { once: true });
      } else {
        this.init();
      }
    }
  }

  init() {
    // 既に初期化されている場合は破棄
    if (this.observer) this.destroy();

    const options = this.options;
    // options
    // rootMargin: 交差判定のマージン
    // currentClass: 閲覧中セクションを示すクラス名
    const rootMargin = options.rootMargin || `-40% 0px -60% 0px`; // ビューポート中央付近で交差判定
    this.currentClass = options.currentClass || 'is-current';

    // 要素取得
    this.sections = Array.from(document.querySelectorAll('[data-spy-section]'));
    this.navItems = Array.from(document.querySelectorAll('[data-spy-nav]'));
    if (!this.sections.length || !this.navItems.length) return;

    // IntersectionObserver 初期化
    this.observer = new IntersectionObserver(this.onIntersect.bind(this), {
      threshold: 0, rootMargin
    });

    // セクション監視開始
    this.sections.forEach(section => this.observer.observe(section));
  }

  onIntersect(entries) {
    // 交差しているセクションを抽出
    const intersectingEntries = entries.filter(entry => entry.isIntersecting);
    if (!intersectingEntries.length) return;

    // 最初に交差したセクションを現在地に設定
    this.setCurrent(intersectingEntries[0].target.id);
  }

  setCurrent(sectionId) {
    this.navItems.forEach(item => {
      // ナビゲーション項目にはハッシュ付きアンカーを含める必要あり
      const anchor = item.querySelector('a');
      const targetId = anchor?.getAttribute('href')?.replace('#', '');
      item.classList.toggle(this.currentClass, targetId === sectionId);
    });
  }

  destroy() {
    this.observer?.disconnect();
  }
}

/**
 * Readable On Scroll
 */
class ReadableOnScroll {
  constructor(options = {}) {
    this.options = options;
    this.autoInit = options.autoInit ?? true;

    if (this.autoInit) {
      if (document.readyState === 'loading') {
        // DOMContentLoaded を待って初期化
        document.addEventListener('DOMContentLoaded', () => this.init(), { once: true });
      } else {
        this.init();
      }
    }
  }

  init() {
    // 既に初期化されている場合は破棄
    if (this.observer) this.destroy();

    const options = this.options;
    // options
    // threshold: 交差判定の閾値
    // rootMargin: 交差判定のマージン
    // inviewClass: 画面内に入った時に付与するクラス名
    // toggle: 画面外に出た時にクラスを外すかどうか
    const threshold = options.threshold ?? 0.15;
    const rootMargin = options.rootMargin || '0px 0px -12% 0px';
    this.inviewClass = options.inviewClass || 'is-inview';
    this.toggle = options.toggle ?? false; // 既定は一度きり

    // 要素取得
    this.readableElems = Array.from(document.querySelectorAll('[data-readable]'));;
    if (!this.readableElems.length) return;

    // IntersectionObserver 初期化
    this.observer = new IntersectionObserver(this.onIntersect.bind(this), {
      threshold, rootMargin
    });

    // 要素監視開始
    this.readableElems.forEach(elem => this.observer.observe(elem));
  }

  onIntersect(entries) {
    for (const entry of entries) {
      const elem = entry.target;

      if (entry.isIntersecting) {
        elem.classList.add(this.inviewClass);
        if (!this.toggle) {
          this.observer.unobserve(elem);
        }
      } else if (this.toggle) {
        elem.classList.remove(this.inviewClass);
      }
    }
  }

  destroy() {
    this.observer?.disconnect();
  }
}

/**
 * Shrink Header
 */
class ShrinkHeader {
  constructor(options = {}) {
    // options
    // shrinkClass: スクロール後に付与するクラス名
    this.shrinkClass = options.shrinkClass ?? 'is-shrunk';

    // 要素取得
    this.header = document.querySelector('[data-site-header]');
    this.target = document.querySelector('[data-scroll-sentinel]');
    if (!this.header || !this.target) return;

    // IntersectionObserver 初期化
    this.observer = new IntersectionObserver(this.onIntersect.bind(this), { threshold: 0 });

    // 監視開始
    this.observer.observe(this.target);
  }

  onIntersect(entries) {
    const entry = entries[0];
    const shouldShrink = !entry.isIntersecting;
    this.header.classList.toggle(this.shrinkClass, shouldShrink);
  }

  destroy() {
    this.observer?.disconnect();
  }
}


/**
 * Back To Top
 */
class BackToTop {
  // options
  // offsetRatio: ボタンが出現する位置 (window.innerHeightの何倍か) を設定可能
  constructor(options = {}) {
    // options
    this.offsetRatio = options.offsetRatio || 0;

    // 状態管理
    this.isShown = false;
    
    // bind
    this.onScroll = this.onScroll.bind(this);
    this.onClick = this.onClick.bind(this);

    // ボタン生成
    this.createButton();

    // イベント登録
    this.handleEvents();

    // 初期表示
    this.updateVisibility();
  }

  createButton() {
    // ボタン要素
    this.btn = document.createElement('div');
    this.btn.classList.add('backToTop');
    this.btn.setAttribute('role', 'button');
    this.btn.setAttribute('tabindex', '0');
    this.btn.setAttribute('aria-label', 'トップへ戻る');

    // アイコン要素
    const icon = document.createElement('div');
    icon.classList.add('icon', 'icon--chevron-up', 'icon--lg');

    // span要素
    const span = document.createElement('span');
    span.classList.add('icon__span');

    // bodyに挿入
    icon.appendChild(span);
    this.btn.appendChild(icon);
    document.body.appendChild(this.btn);
  }

  handleEvents() {
    // ボタン操作
    this.btn.addEventListener('click', this.onClick);

    // ボタン表示制御
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  onClick(event) {
    event.preventDefault();
    this.backToTop();
  }

  onScroll() {
    this.updateVisibility();
  }

  backToTop() {
    window.scroll({ top: 0, behavior: 'smooth' });
  }

  updateVisibility() {
    const shouldShow = window.innerHeight * this.offsetRatio < window.scrollY;
    if (shouldShow !== this.isShown) {
      this.isShown = shouldShow;
      this.btn.classList.toggle('is-active', shouldShow);
    }
  }

  destroy() {
    this.btn.removeEventListener('click', this.onClick);
    this.btn.remove();
    window.removeEventListener('scroll', this.onScroll);
  }
}

// Export modules
const ActionCore = {
  ScrollToAnchor,
  ScrollSpy,
  ReadableOnScroll,
  ShrinkHeader,
  BackToTop
};

export default ActionCore;

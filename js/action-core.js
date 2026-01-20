/**
 * Action Core
 * © 2026 QWEL.DESIGN (https://qwel.design)
 * Released under the MIT License.
 * See LICENSE file for details.
 */

/**
 * Scroll To Anchor
 * header高さをCSS変数にセットし, アンカーリンクのスクロール位置を補正する
 * 
 * 使い方:
 * header要素に [data-site-header] 属性を付与する
 * 
 * オプション:
 * cssVar: header高さを格納するCSS変数名
 * offset: header高さのフォールバック値
 */
class ScrollToAnchor {
  constructor(options = {}) {
    // オプション
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
 * スクロール位置 (セクション) に応じてナビゲーションの状態を更新する
 * 
 * 使い方:
 * 監視対象セクションに [data-spy-section] 属性を付与し,
 * ナビゲーション項目に [data-spy-nav] 属性を付与する
 * 
 * オプション:
 * autoInit: 自動初期化 (規定でON)
 * rootMargin: 交差判定のマージン
 * currentClass: 閲覧中セクションを示すクラス名
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
    // オプション
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
 * 画面内を出入りする要素のクラスを切り替える
 * 
 * 使い方:
 * アニメーションさせたい要素に [data-readable] 属性を付与する
 * 
 * オプション:
 * autoInit: 自動初期化 (規定でON)
 * threshold: 交差判定の閾値
 * rootMargin: 交差判定のマージン
 * inviewClass: 画面内に入った時に付与するクラス名
 * toggle: 画面外に出た時にクラスを外すかどうか (規定でOFF)
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
    // オプション
    const threshold = options.threshold ?? 0.15;
    const rootMargin = options.rootMargin || '0px 0px -12% 0px';
    this.inviewClass = options.inviewClass || 'is-inview';
    this.toggle = options.toggle ?? false;

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
        // 画面内に入った時
        elem.classList.add(this.inviewClass);
        if (!this.toggle) {
          // 既定では監視解除
          this.observer.unobserve(elem);
        }
      } else if (this.toggle) {
        // 画面外に出た時
        elem.classList.remove(this.inviewClass);
      }
    }
  }

  destroy() {
    this.observer?.disconnect();
  }
}

/**
 * Shrink Header:
 * header要素の縮小をスクロールで制御する
 * 
 * 使い方:
 * header要素に [data-site-header] 属性を付与し,
 * body直下に [data-scroll-sentinel] 属性を持つ要素を配置する
 * 
 * オプション:
 * shrinkClass: スクロール後に付与するクラス名
 */
class ShrinkHeader {
  constructor(options = {}) {
    // オプション
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
    // headerクラス切り替え
    this.header.classList.toggle(this.shrinkClass, shouldShrink);
  }

  destroy() {
    this.observer?.disconnect();
  }
}

/**
 * Back To Top:
 * トップへ戻るボタンの生成と制御
 * 
 * 使い方:
 * インスタンス化するだけで自動的にボタンが生成・制御される
 * 
 * オプション:
 * offsetRatio: ボタンが出現する位置 (window.innerHeightの何倍か)
 */
class BackToTop {
  constructor(options = {}) {
    // オプション
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
    this.isShown = false;
    this.btn?.removeEventListener('click', this.onClick);
    this.btn?.remove();
    window.removeEventListener('scroll', this.onScroll);
  }
}

/**
 * Drawer Menu
 * ドロワーメニューの生成と制御
 * 
 * 使い方:
 * インスタンス化するだけで自動的にボタンが生成・制御される
 * 
 * オプション:
 * cloneSiteBrand: SiteBrand をクローンするかどうか (規定でON)
 * clonePrimaryMenu: PrimaryMenu をクローンするかどうか (規定でON)
 * cloneSocialMenu: SocialMenu をクローンするかどうか (規定でON)
 */
class DrawerMenu {
  constructor(options = {}) {
    // オプション
    this.cloneSiteBrand = options.cloneSiteBrand ?? true;
    this.clonePrimaryMenu = options.clonePrimaryMenu ?? true;
    this.cloneSocialMenu = options.cloneSocialMenu ?? true;

    // 状態管理
    this.isShown = false;

    // 各要素生成
    this.createElements();

    // メニューインポート
    this.importMenu();

    // イベント登録
    this.handleEvents();

    // 出現アニメーション
    setTimeout(() => {
      this.drawer.classList.remove('is-ready');
    }, 1000);
  }

  createElements() {
    // .drawer
    this.drawer = document.createElement('button');
    this.drawer.classList.add('drawer', 'is-ready');

    // .drawer__navicon
    this.navicon = document.createElement('div');
    this.navicon.classList.add('drawer__navicon');
    let icon = document.createElement('div');
    icon.classList.add('icon', 'icon--menu', 'icon--lg');
    icon.innerHTML = '<span class="icon__span"></span>';
    this.navicon.appendChild(icon);
    this.drawer.appendChild(this.navicon);

    // .drawer__close
    this.close = document.createElement('div');
    this.close.classList.add('drawer__close');
    icon = document.createElement('div');
    icon.classList.add('icon', 'icon--close', 'icon--lg');
    icon.innerHTML = '<span class="icon__span"></span>';
    this.close.appendChild(icon);
    this.drawer.appendChild(this.close);

    // .drawerMenu
    this.drawerMenu = document.createElement('div');
    this.drawerMenu.classList.add('drawerMenu', 'is-hidden');

    // .drawerMenu__inner
    this.inner = document.createElement('div');
    this.inner.classList.add('drawerMenu__inner', 'is-hidden');
    this.drawerMenu.appendChild(this.inner);

    // .drawerMenuOverlay
    this.overlay = document.createElement('div');
    this.overlay.classList.add('drawerMenuOverlay', 'is-collapsed');

    // body要素に挿入
    const body = document.body;
    body.appendChild(this.drawer);
    body.appendChild(this.drawerMenu);
    body.appendChild(this.overlay);
  }

  importMenu() {
    // クローンする対象
    this.siteBrand = document.querySelector('[data-site-brand]');
    this.primaryMenu = document.querySelector('[data-primary-menu]');
    this.socialMenu = document.querySelector('[data-social-menu]');

    // メニューアイテムをインポート
    if (this.cloneSiteBrand && this.siteBrand) this.importSiteBrand();
    if (this.clonePrimaryMenu && this.primaryMenu) this.importPrimaryMenu();
    if (this.cloneSocialMenu && this.socialMenu) this.importSocialMenu();
  }

  importSiteBrand() {
    // SiteBrand をインポート
    const siteBrand = document.createElement('div');
    siteBrand.classList.add('drawerMenu__item', 'siteBrand');
    siteBrand.innerHTML = this.siteBrand.innerHTML;
    this.inner.appendChild(siteBrand);
  }

  importPrimaryMenu() {
    // PrimaryMenu をインポート
    const primaryMenu = document.createElement('ul');
    primaryMenu.classList.add('drawerMenu__primaryMenu');

    // li要素を順次インポート
    const menuItems = this.primaryMenu.querySelectorAll('li');
    menuItems.forEach((menuItem) => {
      const primaryMenuItem = document.createElement('li');
      primaryMenuItem.classList.add('drawerMenu__item');
      primaryMenuItem.innerHTML = menuItem.innerHTML;
      primaryMenu.appendChild(primaryMenuItem);
    });
    this.inner.appendChild(primaryMenu);
  }

  importSocialMenu() {
    // SocialMenu をインポート
    const socialMenu = document.createElement('ul');
    socialMenu.classList.add('drawerMenu__socialMenu');

    // li要素を順次インポート
    const menuItems = this.socialMenu.querySelectorAll('li');
    menuItems.forEach((menuItem) => {
      const socialMenuItem = document.createElement('li');
      socialMenuItem.classList.add('drawerMenu__item', 'social');
      socialMenuItem.innerHTML = menuItem.innerHTML;
      socialMenu.appendChild(socialMenuItem);
    });
    this.inner.appendChild(socialMenu);
  }

  toggle() {
    // 状態から判別して、表示/非表示を切り替え
    if (this.isShown) this.hide();
    else this.show();
  }

  show() {
    // 表示
    if (!this.isShown) {
      this.transitionEnd(this.drawerMenu, () => {
        this.drawerMenu.classList.remove('is-hidden');
        this.drawer.classList.add('is-active');
        this.inner.classList.remove('is-collapsed');
        this.overlay.classList.remove('is-collapsed');
      }).then(() => {
        this.inner.classList.remove('is-hidden');
      });
    }
    this.isShown = true;
  }

  hide() {
    // 非表示
    if (this.isShown) {
      this.transitionEnd(this.drawerMenu, () => {
        this.drawerMenu.classList.add('is-hidden');
        this.drawer.classList.remove('is-active');
        this.inner.classList.add('is-hidden');
      }).then(() => {
        this.inner.classList.add('is-collapsed');
        this.overlay.classList.add('is-collapsed');
      });
    }
    this.isShown = false;
  }

  handleEvents() {
    // ドロワーのイベント登録
    this.drawer.addEventListener('click', (event) => {
      event.preventDefault();
      this.toggle();
    });

    // オーバーレイのイベント登録
    this.overlay.addEventListener('click', () => {
      this.hide();
    });

    // スクロール時のイベント登録
    window.addEventListener('scroll', () => {
      this.windowScrollHandler();
    });
  }

  windowScrollHandler() {
    // スクロール時にメニューを非表示
    if (this.isShown) this.hide();
  }

  transitionEnd(elem, func) {
    // CSS遷移の完了を監視
    let callback;
    const promise = new Promise((resolve, reject) => {
      callback = () => resolve(elem);
      elem.addEventListener('transitionend', callback);
    });
    func();
    promise.then((elem) => {
      elem.removeEventListener('transitionend', callback);
    });
    return promise;
  }

  destroy() {
    this.isShown = false;
    this.drawer?.removeEventListener('click', this.toggle);
    this.drawer?.remove();
    this.inner?.remove();
    this.drawerMenu?.remove();
    this.overlay?.removeEventListener('click', this.hide);
    this.overlay?.remove();
    window.removeEventListener('scroll', this.windowScrollHandler);
  }
}

// Export modules
const ActionCore = {
  ScrollToAnchor,
  ScrollSpy,
  ReadableOnScroll,
  ShrinkHeader,
  BackToTop,
  DrawerMenu
};

export default ActionCore;

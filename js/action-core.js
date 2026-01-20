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
    window.addEventListener('resize', this.onResize);
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
    window.addEventListener('scroll', this.onScroll);
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
  BackToTop
};

export default ActionCore;

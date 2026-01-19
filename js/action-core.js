/**
 * Action Core
 * © 2026 QWEL.DESIGN (https://qwel.design)
 * Released under the MIT License.
 * See LICENSE file for details.
 */

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
  BackToTop
};

export default ActionCore;

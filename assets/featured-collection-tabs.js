(() => {
    if (customElements.get('featured-tabs')) return;
    const activeTabBySection = new Map(); 
    class FeatureTabs extends HTMLElement {
        connectedCallback() {
            this.tablist = this.querySelector('[role="tablist"]');
            this.tabs = Array.from(this.querySelectorAll('[role="tab"]'));
            this.panels = Array.from(this.querySelectorAll('[role="tabpanel"]'));
            if (!this.tablist || this.tabs.length === 0) return;

            this.controller = new AbortController();
            const { signal } = this.controller;
            this.tablist.addEventListener('click', (e) => this.onClick(e), {signal})
            this.tablist.addEventListener('keydown', (e) => this.onKeydown(e), {signal})

            // this.selectTab(tabs[0]);
            const savedId = activeTabBySection.get(this.dataset.sectionId);
            const initialTab = this.tabs.find((tab) => {
                tab.dataset.blockId = savedId || this.tabs[0];
                this.selectTab(initialTab)
            })
            console.count('fct init');

        }
        disconnectedCallback() {
            if(this.controller !== null && this.controller !== undefined) {
                this.controller.abort();
            }
        }
        onClick(event) {
            const tab = event.target.closest('[role="tab"]');
            if (tab && this.tabs.includes(tab)) this.selectTab(tab)
        }
        selectTab(tab, {focus = false} = {}) {
            if (!tab) return;
            this.tabs.forEach((item) => {
                if (item === tab) {
                    item.setAttribute('aria-selected', 'true');
                    item.tabIndex = 0;
                } else {
                    item.setAttribute('aria-selected', 'false');
                    item.tabIndex = -1;
                }
            })

            const tabId = tab.getAttribute('aria-controls');
            this.panels.forEach((panel) => {
                if (panel.id !== tabId) {
                    panel.hidden = true;
                } else {
                    panel.hidden = false;
                }
            })
            console.log("Dataset:" ,this.dataset)
            activeTabBySection.set(this.dataset.sectionId, tab.dataset.blockId);

            if (focus) tab.focus()

        }
        onKeydown(event) {
            const currentIndex = this.tabs.indexOf(event.target.closest('[role="tab"]'));
            if (currentIndex === -1) return;
            const lastIndex = this.tabs.length - 1;
            let nextIndex;
            switch (event.key) {
                case 'ArrowRight':
                    nextIndex = currentIndex ===  lastIndex ? 0 : currentIndex + 1;
                    break;
                case 'ArrowLeft':
                    nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
                    break;
                case 'Home':
                    nextIndex = 0;
                    break;
                case 'End':
                    nextIndex = lastIndex;
                    break;
                default: return;
            }
            event.preventDefault();
            this.selectTab(this.tabs[nextIndex], {focus: true});
        }
    }
    customElements.define('featured-tabs', FeatureTabs );

    // Theme Editor: chọn block ở sidebar -> mở đúng tab.
    // Gắn trên document đúng 1 lần (nằm trong guard ở đầu file).
    document.addEventListener('shopify:block:select', (event) => {
    const tab = event.target;
    const root = tab.closest?.('featured-tabs');
    if (!root || !root.tabs?.includes(tab)) return;
    root.selectTab(tab);
    tab.scrollIntoView({ block: 'nearest', inline: 'center' });
  });
})()



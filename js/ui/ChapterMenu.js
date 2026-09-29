class ChapterMenu {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'scene';
        this.element.id = 'scene-chapter-menu';
        this.element.style.background = 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)';
        this.render();
    }

    render() {
        this.element.innerHTML = `
            <!-- TOP BAR WITH EXIT BUTTON -->
            <div class="screen-topbar">
                <span class="stage-label" style="color:#aaa; font-size:14px; font-weight:bold; letter-spacing:2px;">CHỌN CHƯƠNG</span>
                <button class="btn-exit" id="btn-exit-chapter">&#x2715; Thoát</button>
            </div>

            <!-- MAIN CHAPTER CONTENT -->
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; padding:20px; width:100%; max-width:480px; margin:0 auto; box-sizing:border-box;">
                <h2 style="color:#FFD700; font-size:32px; letter-spacing:3px; margin:0 0 10px 0; text-align:center;">DANH SÁCH CHƯƠNG</h2>
                
                <div style="width:100%; display:flex; flex-direction:column; gap:14px;">
                    <button class="btn" data-chapter="1" style="width:100%; margin:0; display:flex; align-items:center; justify-content:center; gap:8px;">
                        &#127807; Chương 1: Forest of Words
                    </button>
                </div>
            </div>
        `;

        this.element.querySelectorAll('button[data-chapter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                window.events.emit('CHAPTER_SELECTED', e.currentTarget.dataset.chapter);
            });
        });

        this.element.querySelector('#btn-exit-chapter').addEventListener('click', () => {
            window.events.emit('GOTO_MAIN_MENU');
        });
    }

    getElement() { return this.element; }
    show() { this.element.classList.add('active'); }
    hide() { this.element.classList.remove('active'); }
}

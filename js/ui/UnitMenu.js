class UnitMenu {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'scene';
        this.element.id = 'scene-unit-menu';
        this.element.style.background = 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)';
        this.stages = UnitMenu.buildStages();
        this.render();
        this.bindEvents();
    }

    static buildStages() {
        const bossQuestions = [
            // Quiz type
            { type: 'quiz',  q: "What says meow?",      options: ["cat",    "dog",    "bird"],   a: "cat"    },
            { type: 'quiz',  q: "What barks?",           options: ["dog",    "fish",   "rabbit"], a: "dog"    },
            { type: 'quiz',  q: "What can swim?",        options: ["fish",   "bird",   "cat"],    a: "fish"   },
            { type: 'quiz',  q: "What can fly?",         options: ["bird",   "rabbit", "dog"],    a: "bird"   },
            { type: 'quiz',  q: "What has long ears?",   options: ["rabbit", "cat",    "fish"],   a: "rabbit" },
            { type: 'quiz',  q: "What is a big cat?",    options: ["lion",   "dog",    "fish"],   a: "lion"   },
            // Match Image type
            { type: 'image', word: "CAT",      options: ["\uD83D\uDC36", "\uD83D\uDC31", "\uD83D\uDC30", "\uD83D\uDC2D"], a: "\uD83D\uDC31" },
            { type: 'image', word: "DOG",      options: ["\uD83E\uDD81", "\uD83D\uDC2F", "\uD83D\uDC36", "\uD83D\uDC37"], a: "\uD83D\uDC36" },
            { type: 'image', word: "BIRD",     options: ["\uD83D\uDC1F", "\uD83D\uDC38", "\uD83D\uDC26", "\uD83D\uDC12"], a: "\uD83D\uDC26" },
            { type: 'image', word: "FISH",     options: ["\uD83D\uDC1F", "\uD83D\uDC1B", "\uD83E\uDD8B", "\uD83D\uDC0C"], a: "\uD83D\uDC1F" },
            { type: 'image', word: "RABBIT",   options: ["\uD83D\uDC30", "\uD83D\uDC2D", "\uD83D\uDC39", "\uD83E\uDD8A"], a: "\uD83D\uDC30" },
            // Match Word type
            { type: 'word',  image: "\uD83D\uDC36", options: ["CAT", "DOG",    "BIRD",   "FISH"],     a: "DOG"    },
            { type: 'word',  image: "\uD83D\uDC31", options: ["DOG", "CAT",    "RABBIT", "LION"],     a: "CAT"    },
            { type: 'word',  image: "\uD83D\uDC30", options: ["BIRD","FISH",   "RABBIT", "TIGER"],    a: "RABBIT" },
            { type: 'word',  image: "\uD83D\uDC26", options: ["BIRD","MONKEY", "HORSE",  "DOG"],      a: "BIRD"   },
            { type: 'word',  image: "\uD83D\uDC1F", options: ["CAT", "FISH",   "RABBIT", "ELEPHANT"], a: "FISH"   },
            // Fill Blank type
            { type: 'blank', sentence: "I have a ___.",        options: ["dog",    "apple",  "book"],   a: "dog"    },
            { type: 'blank', sentence: "The ___ says meow.",   options: ["cow",    "cat",    "bird"],   a: "cat"    },
            { type: 'blank', sentence: "A ___ can fly.",       options: ["fish",   "rabbit", "bird"],   a: "bird"   },
            { type: 'blank', sentence: "The ___ can swim.",    options: ["fish",   "dog",    "monkey"], a: "fish"   },
            { type: 'blank', sentence: "A ___ has long ears.", options: ["tiger",  "rabbit", "lion"],   a: "rabbit" },
        ];

        return {
            1: {
                id: 1, name: "Match Image", mechanic: "match-image", isBoss: false, nextStageId: 2,
                questions: [
                    { word: "CAT",    options: ["\uD83D\uDC36", "\uD83D\uDC31", "\uD83D\uDC30", "\uD83D\uDC2D"], a: "\uD83D\uDC31" },
                    { word: "DOG",    options: ["\uD83E\uDD81", "\uD83D\uDC2F", "\uD83D\uDC36", "\uD83D\uDC37"], a: "\uD83D\uDC36" },
                    { word: "BIRD",   options: ["\uD83D\uDC1F", "\uD83D\uDC38", "\uD83D\uDC26", "\uD83D\uDC12"], a: "\uD83D\uDC26" },
                    { word: "FISH",   options: ["\uD83D\uDC1F", "\uD83D\uDC1B", "\uD83E\uDD8B", "\uD83D\uDC0C"], a: "\uD83D\uDC1F" },
                    { word: "RABBIT", options: ["\uD83D\uDC30", "\uD83D\uDC2D", "\uD83D\uDC39", "\uD83E\uDD8A"], a: "\uD83D\uDC30" }
                ]
            },
            2: {
                id: 2, name: "Match Word", mechanic: "match-word", isBoss: false, nextStageId: 3,
                questions: [
                    { image: "\uD83D\uDC36", options: ["CAT", "DOG",    "BIRD",   "FISH"],     a: "DOG"    },
                    { image: "\uD83D\uDC31", options: ["DOG", "CAT",    "RABBIT", "LION"],     a: "CAT"    },
                    { image: "\uD83D\uDC30", options: ["BIRD","FISH",   "RABBIT", "TIGER"],    a: "RABBIT" },
                    { image: "\uD83D\uDC26", options: ["BIRD","MONKEY", "HORSE",  "DOG"],      a: "BIRD"   },
                    { image: "\uD83D\uDC1F", options: ["CAT", "FISH",   "RABBIT", "ELEPHANT"], a: "FISH"   }
                ]
            },
            3: {
                id: 3, name: "Fill Blank", mechanic: "fill-blank", isBoss: false, nextStageId: 4,
                questions: [
                    { sentence: "I have a ___.",        options: ["dog",   "apple",  "book"],   a: "dog"    },
                    { sentence: "The ___ says meow.",   options: ["cow",   "cat",    "bird"],   a: "cat"    },
                    { sentence: "A ___ can fly.",       options: ["fish",  "rabbit", "bird"],   a: "bird"   },
                    { sentence: "The ___ can swim.",    options: ["fish",  "dog",    "monkey"], a: "fish"   },
                    { sentence: "A ___ has long ears.", options: ["tiger", "rabbit", "lion"],   a: "rabbit" }
                ]
            },
            4: {
                id: 4, name: "Quiz Battle", mechanic: "quiz-battle", isBoss: false, nextStageId: 5,
                questions: [
                    { q: "What says meow?",    options: ["cat",    "dog",    "bird"],   a: "cat"    },
                    { q: "What barks?",        options: ["dog",    "fish",   "rabbit"], a: "dog"    },
                    { q: "What can swim?",     options: ["fish",   "bird",   "cat"],    a: "fish"   },
                    { q: "What can fly?",      options: ["bird",   "rabbit", "dog"],    a: "bird"   },
                    { q: "What has long ears?",options: ["rabbit", "cat",    "fish"],   a: "rabbit" }
                ]
            },
            5: {
                id: 5, name: "Connect Word", mechanic: "connect-match", isBoss: false, nextStageId: 6,
                leftLabel: "WORDS", rightLabel: "IMAGES",
                pairs: [
                    { left: "CAT",    right: "\uD83D\uDC31" },
                    { left: "DOG",    right: "\uD83D\uDC36" },
                    { left: "BIRD",   right: "\uD83D\uDC26" },
                    { left: "FISH",   right: "\uD83D\uDC1F" },
                    { left: "RABBIT", right: "\uD83D\uDC30" }
                ]
            },
            6: {
                id: 6, name: "Connect Image", mechanic: "connect-match", isBoss: false, nextStageId: 7,
                leftLabel: "IMAGES", rightLabel: "WORDS",
                pairs: [
                    { left: "\uD83D\uDC31", right: "CAT"    },
                    { left: "\uD83D\uDC36", right: "DOG"    },
                    { left: "\uD83D\uDC26", right: "BIRD"   },
                    { left: "\uD83D\uDC1F", right: "FISH"   },
                    { left: "\uD83D\uDC30", right: "RABBIT" }
                ]
            },
            7: {
                id: 7,
                name: "Animal Master",
                mechanic: "boss-mixed",
                isBoss: true,
                nextStageId: null,
                questions: bossQuestions
            }
        };
    }

    renderStars(stageId) {
        const stars = window.playerManager ? window.playerManager.getStageStars(stageId) : 0;
        let html = '<div class="stage-stars-row">';
        for (let i = 1; i <= 3; i++) {
            if (i <= stars) {
                html += '<span class="star-badge star-filled">&#9733;</span>';
            } else {
                html += '<span class="star-badge star-empty">&#9734;</span>';
            }
        }
        html += '</div>';
        return html;
    }

    render() {
        const totalStars = window.playerManager ? window.playerManager.getTotalStars() : 0;
        const maxStars = 7 * 3;

        this.element.innerHTML = `
            <!-- TOP BAR WITH EXIT BUTTON -->
            <div class="screen-topbar">
                <span class="stage-label" style="color:#aaa; font-size:14px; font-weight:bold; letter-spacing:2px;">CHƯƠNG 1 &bull; UNIT 1</span>
                <button class="btn-exit" id="btn-exit-unit">&#x2715; Thoát</button>
            </div>

            <!-- SCROLLABLE STAGES CONTENT -->
            <div class="unit-menu-scroll" style="
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
                padding: 16px 20px 30px;
                width: 100%;
                max-width: 500px;
                margin: 0 auto;
                overflow-x: hidden;
                overflow-y: auto;
                box-sizing: border-box;
            ">
                <div style="text-align:center;">
                    <h2 style="color:#FFD700;font-size:30px;letter-spacing:3px;margin:0 0 2px 0;">CHAPTER 1</h2>
                    <h3 style="color:#88aacc;font-size:18px;margin:0 0 8px 0;">Forest of Words</h3>
                    <div style="background:rgba(0,0,0,0.4);border:1px solid #ffffff22;border-radius:20px;padding:4px 16px;display:inline-block;color:#FFD700;font-weight:bold;font-size:14px;">
                        &#11088; Tiến Trình: ${totalStars}/${maxStars} Sao
                    </div>
                </div>

                <div style="width:100%;border-top:1px solid #ffffff22;padding-top:12px;display:flex;flex-direction:column;gap:10px;box-sizing:border-box;">
                    <p style="color:#aaa;font-size:13px;letter-spacing:2px;text-align:center;margin:0 0 4px 0;">UNIT 1 — ANIMALS</p>

                    <button class="btn stage-btn" data-stage="1" style="width:100%;margin:0;display:flex;align-items:center;justify-content:space-between;padding:12px 20px;">
                        <span>Stage 1 — Match Image</span>
                        ${this.renderStars(1)}
                    </button>
                    <button class="btn stage-btn" data-stage="2" style="width:100%;margin:0;display:flex;align-items:center;justify-content:space-between;padding:12px 20px;">
                        <span>Stage 2 — Match Word</span>
                        ${this.renderStars(2)}
                    </button>
                    <button class="btn stage-btn" data-stage="3" style="width:100%;margin:0;display:flex;align-items:center;justify-content:space-between;padding:12px 20px;">
                        <span>Stage 3 — Fill Blank</span>
                        ${this.renderStars(3)}
                    </button>
                    <button class="btn stage-btn" data-stage="4" style="width:100%;margin:0;display:flex;align-items:center;justify-content:space-between;padding:12px 20px;">
                        <span>Stage 4 — Quiz Battle</span>
                        ${this.renderStars(4)}
                    </button>
                    <button class="btn stage-btn" data-stage="5" style="width:100%;margin:0;display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:linear-gradient(180deg,#AB47BC,#7B1FA2);border-color:#6A1B9A;">
                        <span>Stage 5 — &#128279; Nối Từ (Word \u2192 Image)</span>
                        ${this.renderStars(5)}
                    </button>
                    <button class="btn stage-btn" data-stage="6" style="width:100%;margin:0;display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:linear-gradient(180deg,#AB47BC,#7B1FA2);border-color:#6A1B9A;">
                        <span>Stage 6 — &#128279; Nối Hình (Image \u2192 Word)</span>
                        ${this.renderStars(6)}
                    </button>
                    <button class="btn stage-btn" data-stage="7" style="width:100%;margin:0;display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:linear-gradient(180deg,#E53935,#B71C1C);border-color:#7f0000;box-shadow:0 5px 0 #7f0000,0 0 20px #E5393588;">
                        <span>&#128293; BOSS — Animal Master</span>
                        ${this.renderStars(7)}
                    </button>
                </div>
            </div>
        `;

        this.element.querySelectorAll('.stage-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const stageId   = parseInt(e.currentTarget.dataset.stage);
                const stageData = this.stages[stageId];
                if (stageData) window.events.emit('STAGE_SELECTED', stageData);
            });
        });

        this.element.querySelector('#btn-exit-unit').addEventListener('click', () => {
            window.events.emit('PLAY_CLICKED');
        });
    }

    bindEvents() {
        window.events.on('PLAYER_CHANGED', () => this.render());
        window.events.on('PLAYER_PROGRESS_UPDATED', () => this.render());
    }

    getElement() { return this.element; }
    show(data) {
        this.render();
        this.element.classList.add('active');
    }
    hide() { this.element.classList.remove('active'); }
}

/**
 * MobSprite — loads a sprite via <img> (no fetch, works with file://)
 * Accepts inline JSON data from SPRITE_DATA.
 *
 * Config:
 *   pngPath    {string}   - path to spritesheet PNG
 *   jsonData   {object}   - pre-loaded Aseprite JSON
 *   scale      {number}   - CSS pixel scale factor
 *   idleAnim   {string}   - tag name for idle loop
 *   attackAnim {string}   - tag name for attack
 *   hitAnim    {string}   - tag name for when hit
 *   deadAnim   {string}   - tag name for death
 *   flipped    {boolean}  - mirror the sprite
 */
class MobSprite {
    constructor(container, config) {
        this.container = container;
        this.config = Object.assign({
            scale:       3,
            idleAnim:   'idle',
            walkAnim:   'walk',
            attackAnim: 'attack',
            hitAnim:    'hit',
            deadAnim:   'dead',
            flipped:    false,
        }, config);

        this.animator = null;
        this.canvas   = null;
        this.ready    = false;

        this._load();
    }

    _load() {
        const json = this.config.jsonData;
        if (!json) { console.error('MobSprite: no jsonData provided'); return; }

        const img = new Image();
        img.onload = () => {
            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.style.imageRendering = 'pixelated';
            this.canvas = canvas;

            // Clear container and add canvas
            this.container.innerHTML = '';
            this.container.appendChild(canvas);

            // Build animator
            this.animator = new SpriteAnimator(canvas, json, img);

            // Scale up via CSS
            const scale = this.config.scale;
            canvas.style.width  = Math.round(this.animator.frameW * scale) + 'px';
            canvas.style.height = Math.round(this.animator.frameH * scale) + 'px';
            canvas.style.display = 'block';

            this.ready = true;
            this.idle();
        };
        img.onerror = () => console.error('MobSprite: failed to load image', this.config.pngPath);
        img.src = this.config.pngPath;
    }

    play(name, opts = {}) {
        if (!this.ready || !this.animator) return;
        const finalOpts = Object.assign({
            flipped: this.config.flipped
        }, opts);
        this.animator.play(name, finalOpts);
    }

    idle() {
        this.play(this.config.idleAnim, { loop: true });
    }

    walk() {
        this.play(this.config.walkAnim, { loop: true });
    }

    hit(onDone) {
        this.play(this.config.hitAnim, {
            loop: false,
            onEnd: () => { this.idle(); if (onDone) onDone(); }
        });
    }

    attack(onDone) {
        this.play(this.config.attackAnim, {
            loop: false,
            onEnd: () => { this.idle(); if (onDone) onDone(); }
        });
    }

    dead(onDone) {
        this.play(this.config.deadAnim, {
            loop: false,
            onEnd: onDone || null
        });
    }

    destroy() {
        if (this.animator) this.animator.destroy();
        this.ready = false;
        if (this.container) this.container.innerHTML = '';
    }
}

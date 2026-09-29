/**
 * SpriteAnimator
 * Reads Aseprite-exported JSON (hash format with frameTags) and animates
 * a <canvas> element by cycling through the correct frames.
 *
 * Usage:
 *   const anim = new SpriteAnimator(canvas, jsonData, imageElement);
 *   anim.play('idle', { loop: true, flipped: true });
 *   anim.play('hit',  { loop: false, flipped: true, onEnd: () => anim.play('idle', { loop: true, flipped: true }) });
 *   anim.destroy();
 */
class SpriteAnimator {
    constructor(canvas, jsonData, image) {
        this.canvas  = canvas;
        this.ctx     = canvas.getContext('2d');
        this.image   = image;
        this.json    = jsonData;

        // Build flat frame array from the frames object
        this.frames = Object.values(jsonData.frames);
        this.tags   = {};
        for (const tag of jsonData.meta.frameTags) {
            this.tags[tag.name] = tag;   // { name, from, to, direction }
        }

        // Set canvas to the sourceSize of the first frame
        const first = this.frames[0];
        this.frameW = first.sourceSize.w;
        this.frameH = first.sourceSize.h;
        canvas.width  = this.frameW;
        canvas.height = this.frameH;

        this._raf       = null;
        this._lastTime  = null;
        this._elapsed   = 0;
        this._tagFrames = [];   // subset of frames for current animation
        this._cursor    = 0;
        this._loop      = true;
        this._onEnd     = null;
        this._flipped   = false;
    }

    /**
     * Play a named animation.
     * @param {string} name       - animation tag name (e.g. 'idle', 'hit', 'dead')
     * @param {object} opts
     *   loop    {boolean}   – loop forever (default true)
     *   onEnd   {function}  – callback when animation finishes (non-loop)
     *   flipped {boolean}   – mirror horizontally
     */
    play(name, opts = {}) {
        const tag = this.tags[name];
        if (!tag) { console.warn('SpriteAnimator: unknown tag', name); return; }

        this._loop     = opts.loop !== undefined ? opts.loop : true;
        this._onEnd    = opts.onEnd || null;
        this._flipped  = opts.flipped !== undefined ? opts.flipped : false;
        this._cursor   = 0;
        this._elapsed  = 0;
        this._lastTime = null;

        // Slice the frames for this tag (from → to inclusive)
        this._tagFrames = this.frames.slice(tag.from, tag.to + 1);

        cancelAnimationFrame(this._raf);
        this._raf = requestAnimationFrame(ts => this._tick(ts));
    }

    _tick(timestamp) {
        if (!this._lastTime) this._lastTime = timestamp;
        this._elapsed += timestamp - this._lastTime;
        this._lastTime = timestamp;

        const frameMeta = this._tagFrames[this._cursor];
        if (!frameMeta) {
            this._raf = requestAnimationFrame(ts => this._tick(ts));
            return;
        }

        if (this._elapsed >= frameMeta.duration) {
            this._elapsed = 0;
            this._cursor++;

            if (this._cursor >= this._tagFrames.length) {
                if (this._loop) {
                    this._cursor = 0;
                } else {
                    this._drawFrame(this._tagFrames[this._tagFrames.length - 1]);
                    if (this._onEnd) this._onEnd();
                    return;
                }
            }
        }

        this._drawFrame(this._tagFrames[this._cursor]);
        this._raf = requestAnimationFrame(ts => this._tick(ts));
    }

    _drawFrame(frameMeta) {
        if (!frameMeta) return;
        const ctx = this.ctx;
        const f   = frameMeta.frame;
        const ss  = frameMeta.spriteSourceSize;
        const sw  = this.frameW;
        const sh  = this.frameH;

        ctx.clearRect(0, 0, sw, sh);
        ctx.save();
        if (this._flipped) {
            ctx.translate(sw, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(
            this.image,
            f.x, f.y, f.w, f.h,           // source rect on spritesheet
            ss.x, ss.y, f.w, f.h           // dest position
        );
        ctx.restore();
    }

    /** Stop and clean up. */
    destroy() {
        cancelAnimationFrame(this._raf);
    }
}

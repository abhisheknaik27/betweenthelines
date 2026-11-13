'use client';

export type GamePhase = 'LOADING' | 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
export type FrameHandler = (dt: number, elapsed: number) => void;

type ScheduledTask = { id: number; remaining: number; callback: () => void };

/** One clock for animation, physics, countdowns and delayed actions. */
class GameRuntime {
  private handlers = new Set<FrameHandler>();
  private tasks: ScheduledTask[] = [];
  private frame = 0;
  private last = 0;
  private elapsed = 0;
  private taskId = 0;
  phase: GamePhase = 'LOADING';

  subscribe(handler: FrameHandler) {
    this.handlers.add(handler);
    this.ensureRunning();
    return () => { this.handlers.delete(handler); };
  }

  schedule(delaySeconds: number, callback: () => void) {
    const id = ++this.taskId;
    this.tasks.push({ id, remaining: delaySeconds, callback });
    this.ensureRunning();
    return () => { this.tasks = this.tasks.filter(task => task.id !== id); };
  }

  setPhase(phase: GamePhase) {
    this.phase = phase;
    this.last = 0;
    this.ensureRunning();
  }

  reset() {
    this.tasks.length = 0;
    this.elapsed = 0;
    this.last = 0;
  }

  private ensureRunning() {
    if (!this.frame && typeof window !== 'undefined') this.frame = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    const rawDt = this.last ? (now - this.last) / 1000 : 0;
    this.last = now;
    // Prevent tab restoration from injecting a huge physics step.
    const dt = Math.min(rawDt, 1 / 20);
    if (this.phase !== 'PAUSED' && this.phase !== 'LOADING') {
      this.elapsed += dt;
      for (const handler of this.handlers) handler(dt, this.elapsed);
      for (const task of this.tasks) task.remaining -= dt;
      const ready = this.tasks.filter(task => task.remaining <= 0);
      this.tasks = this.tasks.filter(task => task.remaining > 0);
      for (const task of ready) task.callback();
    }
    if (this.handlers.size || this.tasks.length) this.frame = requestAnimationFrame(this.tick);
    else this.frame = 0;
  };
}

export const gameRuntime = new GameRuntime();

export interface AABB { x: number; y: number; width: number; height: number; }
export function intersectsAABB(a: AABB, b: AABB, padding = 0) {
  return a.x + padding < b.x + b.width - padding &&
    a.x + a.width - padding > b.x + padding &&
    a.y + padding < b.y + b.height - padding &&
    a.y + a.height - padding > b.y + padding;
}

export class ObjectPool<T> {
  private active: T[] = [];
  private inactive: T[] = [];
  constructor(private create: () => T, private resetItem: (item: T) => void, private max = 80) {}
  acquire() {
    const item = this.inactive.pop() || (this.active.length < this.max ? this.create() : this.active.shift()!);
    this.resetItem(item); this.active.push(item); return item;
  }
  release(item: T) { const i = this.active.indexOf(item); if (i >= 0) this.active.splice(i, 1); this.inactive.push(item); }
  releaseWhere(predicate: (item: T) => boolean) { [...this.active].filter(predicate).forEach(item => this.release(item)); }
  values() { return this.active; }
  clear() { this.inactive.push(...this.active); this.active.length = 0; }
}

export class AssetLoader {
  private images = new Map<string, HTMLImageElement>();
  async preload(urls: string[]) {
    await Promise.all(urls.map(url => new Promise<void>(resolve => {
      const image = new Image();
      image.onload = image.onerror = () => resolve();
      image.src = url; this.images.set(url, image);
    })));
  }
  get(url: string) { return this.images.get(url); }
}

export class SpriteAnimator {
  frame = 0; private accumulator = 0;
  constructor(readonly frames: number, readonly fps = 12) {}
  update(dt: number) { this.accumulator += dt; const step = 1 / this.fps; while (this.accumulator >= step) { this.frame = (this.frame + 1) % this.frames; this.accumulator -= step; } }
  reset() { this.frame = 0; this.accumulator = 0; }
}

export const GAME_ASSETS = ['/assets/miso-hero-sticker.png', '/assets/miso-happy-sticker.png', '/assets/funfair-hero.png', '/assets/funfair-hero-sticker.png', '/assets/vet-doctor-sticker.png'];

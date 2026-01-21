/**
 * Particle system for visual effects
 */
export class Particle {
  constructor(x, y, vx, vy, color, size, lifetime) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.lifetime = lifetime;
    this.age = 0;
    this.alpha = 1;
  }

  update(deltaTime) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.age += deltaTime;
    this.alpha = 1 - (this.age / this.lifetime);
    
    // Apply gravity/friction
    this.vy += 0.2 * deltaTime;
    this.vx *= 0.98;
    this.vy *= 0.98;
    
    return this.age < this.lifetime;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  /**
   * Create an explosion of particles
   */
  createExplosion(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = 2 + Math.random() * 3;
      const lifetime = 0.5 + Math.random() * 0.5;
      
      this.particles.push(new Particle(x, y, vx, vy, color, size, lifetime));
    }
  }

  /**
   * Create trail particles
   */
  createTrail(x, y, color, count = 3) {
    for (let i = 0; i < count; i++) {
      const vx = (Math.random() - 0.5) * 1;
      const vy = (Math.random() - 0.5) * 1;
      const size = 1 + Math.random() * 2;
      const lifetime = 0.3 + Math.random() * 0.2;
      
      this.particles.push(new Particle(x, y, vx, vy, color, size, lifetime));
    }
  }

  /**
   * Update all particles
   */
  update(deltaTime) {
    this.particles = this.particles.filter(particle => particle.update(deltaTime));
  }

  /**
   * Draw all particles
   */
  draw(ctx) {
    this.particles.forEach(particle => particle.draw(ctx));
  }

  /**
   * Clear all particles
   */
  clear() {
    this.particles = [];
  }
}

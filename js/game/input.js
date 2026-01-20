/**
 * Input Manager for handling keyboard input
 */
export class InputManager {
  constructor(ws) {
    this.ws = ws;
    this.currentDirection = 0;
    this.keys = {
      up: false,
      down: false
    };
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Key down
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        this.keys.up = true;
        e.preventDefault();
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        this.keys.down = true;
        e.preventDefault();
      }
      
      this.updateDirection();
    });

    // Key up
    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        this.keys.up = false;
        e.preventDefault();
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        this.keys.down = false;
        e.preventDefault();
      }
      
      this.updateDirection();
    });
  }

  updateDirection() {
    let newDirection = 0;
    
    if (this.keys.up && !this.keys.down) {
      newDirection = -1;
    } else if (this.keys.down && !this.keys.up) {
      newDirection = 1;
    }

    // Only send if direction changed
    if (newDirection !== this.currentDirection) {
      this.currentDirection = newDirection;
      this.sendInput(newDirection);
    }
  }

  sendInput(direction) {
    if (this.ws && this.ws.isConnected) {
      this.ws.send({
        type: 'player_input',
        data: {
          direction: direction
        }
      });
    }
  }
}

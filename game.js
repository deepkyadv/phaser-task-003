export let sessionID;
export let countdown;
export let startTime;
export let endTime;
export let sessionActive = false; // Track session status
let ball;
let timerEvent;
let mainScene;

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('back', 'assets/cloudWithSea.png');
    this.load.audio('clock', 'assets/audio/oldClock.mp3');
    this.load.image('ball', 'assets/ball.png');
  }

  create() {
    mainScene = this; // Reference to the current scene

    this.add.image(0, 0, 'back').setOrigin(0, 0);
    this.clockSound = this.sound.add('clock');

    ball = this.physics.add.image(500, 600, 'ball').setCollideWorldBounds(true).setBounce(1, 1);
    ball.setDisplaySize(100, 100);
    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height, true, true, true, true);

    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  startSession() {
    sessionActive = true;
    sessionID = Phaser.Math.Between(1000, 9999).toString();
    countdown = Phaser.Math.Between(10, 20);
    startTime = new Date().toLocaleTimeString();
    this.clockSound.play({ loop: true });

    const velocityX = Phaser.Math.Between(-600, 600);
    const velocityY = Phaser.Math.Between(-600, 600);
    ball.setVelocity(velocityX, velocityY);

    timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateCountdown,
      callbackScope: this,
      loop: true
    });

    // Update DOM immediately after starting the session
    updateDOMSessionInfo();
  }

  updateCountdown() {
    if (countdown > 0) {
      countdown--;
      document.getElementById('counterValue').innerText = countdown;
    } else {
      this.endSession();
    }
  }

  endSession() {
    endTime = new Date().toLocaleTimeString();
    this.clockSound.stop();
    timerEvent.remove();
    ball.setVelocity(0, 0);
    sessionActive = false;

    // Update DOM with end time
    document.getElementById('endTime').innerText = endTime;

    this.events.emit('sessionEnd'); // Emit session end event
  }

  checkBallPosition() {
    if (ball.y < 325) {
      ball.setVelocityY(Math.abs(ball.body.velocity.y));
    }
  }

  handleVisibilityChange() {
    // Do nothing; the game should continue running as usual
  }

  update(time, delta) {
    this.checkBallPosition();
  }
}

const config = {
  type: Phaser.CANVAS,
  width: 1000,
  height: 650,
  scene: MainScene,
  parent: 'gameContainer',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  disableVisibilityChange: false,
};

const game = new Phaser.Game(config);

// Listen to the event when the session ends
game.events.on('ready', () => {
  game.scene.scenes[0].events.on('sessionEnd', () => {
    updateSessionList(); // Call DOM function on session end
  });
});

export function startPhaserSession() {
  mainScene.startSession(); // Reference the scene directly
}

function updateDOMSessionInfo() {
  document.getElementById('sessionId').innerText = sessionID;
  document.getElementById('startTime').innerText = startTime;
  document.getElementById('counterValue').innerText = countdown;
}

export function updateSessionList() {
  const sessionList = document.getElementById('sessionList');
  sessionList.innerHTML = '';
  sessionData.push({ sessionID, startTime, endTime });
  sessionData.forEach(session => {
    const li = document.createElement('li');
  });
}

const sessionData = [];

document.getElementById('startSessionBtn').addEventListener('click', () => {
  if (!sessionActive) {
    startPhaserSession();
  }
});

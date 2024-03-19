import { Scene } from 'phaser';

var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var fondo;
var scoreTime;
var tiempo = 0;
var corazones;
var corazon1;
var corazon2;
var corazon3;
export class Game extends Scene {
  constructor() {
    super('Game');
  }

  ///////////// CREATE ///////////
  create() {
    //  A simple background for our game
    fondo = this.add.image(this.scale.gameSize.width / 2, this.scale.gameSize.height / 2, 'sky');
    fondo.setDisplaySize(this.scale.gameSize.width, this.scale.gameSize.height);

    //  The platforms group contains the ground and the 2 ledges we can jump on

    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(450, 725, 'ground').setScale(4).refreshBody();

    //  Now let's create some ledges
    platforms.create(600, 550, 'ground');
    platforms.create(50, 450, 'ground');
    platforms.create(750, 380, 'ground');

    // The player and its settings
    player = this.physics.add.sprite(100, 450, 'dude');

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //  Animaciones de caminar //
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    // Animaciones de Explocion //
    this.anims.create({
      key: 'bum',
      frames: this.anims.generateFrameNumbers('explocion', { start: 0, end: 15 }),
      frameRate: 10,
    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();
    cursors.A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    cursors.D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    stars.children.iterate(function (child) {
      //  Give each star a slightly different bounce
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    bombs = this.physics.add.group();

    //  The score
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
    scoreTime = this.add.text(16, 50, 'Tiempo: 00:00:00', { fontSize: '32px', fill: '#000' });

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, this.collectStar, null, this);

    this.physics.add.collider(player, bombs, this.hitBomb, null, this);

    // Añadimos los corazones

    corazones = this.add.group();
    corazones.create(this.scale.gameSize.width - 40, 20, 'heart').setOrigin(1, 0);
    corazones.create(this.scale.gameSize.width - 70, 20, 'heart').setOrigin(1, 0);
    corazones.create(this.scale.gameSize.width - 100, 20, 'heart').setOrigin(1, 0);
  }
  ///////////// UPDATE ///////////
  update(time, deltaTime) {
    if (gameOver) {
      return;
    }

    if (cursors.left.isDown || cursors.A.isDown) {
      player.setVelocityX(-160);

      player.anims.play('left', true);
    } else if (cursors.right.isDown || cursors.D.isDown) {
      player.setVelocityX(160);

      player.anims.play('right', true);
    } else {
      player.setVelocityX(0);

      player.anims.play('turn');
    }

    if ((cursors.up.isDown || cursors.space.isDown) && player.body.touching.down) {
      player.setVelocityY(-330);
    }

    this.tiempoReal(deltaTime);
  }

  ///////////// OTHER FUNCTION ///////////
  ///////////// COLLECT START ///////////

  collectStar(player, star) {
    star.disableBody(true, true);

    //  Add and update the score
    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0) {
      //  A new batch of stars to collect
      stars.children.iterate(function (child) {
        child.enableBody(true, child.x, 0, true, true);
      });

      var x = player.x < 400 ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

      var bomb = bombs.create(x, 16, 'bomb');
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
      bomb.allowGravity = false;
    }
  }
  ///////////// HIT BOMB ///////////

  hitBomb(player, bomb) {
    // Obtener todos los corazones visibles
    var visibleHearts = corazones.getChildren().filter((child) => child.visible);
    console.log(visibleHearts);

    // Restar un corazón independientemente de si hay corazones visibles
    if (visibleHearts.length > 0) {
      // Obtener el último corazón visible
      var lastVisibleHeart = visibleHearts[visibleHearts.length - 1];

      // Ocultar y destruir el último corazón visible
      lastVisibleHeart.setVisible(false);
      lastVisibleHeart.destroy();

      //congelar bomba cuando toca al jugador
      bomb.body.setVelocity(0, 0);
      bomb.body.enable = false;
      //explocion
      bomb.anims.play('bum', true).on('animationcomplete', function () {
        bomb.destroy();
      });
    }

    // Verificar si no quedan más corazones
    if (corazones.countActive(true) === 0) {
      // Si no quedan corazones, el juego termina
      this.physics.pause();
      player.setTint(0xff0000);
      player.anims.play('turn');
      gameOver = true;
    }
  }

  ////////////// TIEMPO//////////
  tiempoReal(deltaTime) {
    tiempo += deltaTime / 1000;

    var horas = Math.floor(tiempo / 3600);
    var minutos = Math.floor((tiempo % 3600) / 60);
    var segundos = tiempo % 60;

    var tiempoFormateado = (horas < 10 ? '0' : '') + horas + ':' + (minutos < 10 ? '0' : '') + minutos + ':' + Math.floor(segundos).toString().padStart(2, '0');

    return scoreTime.setText('Tiempo: ' + tiempoFormateado);
  }
}

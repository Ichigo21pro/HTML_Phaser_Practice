import { Scene } from "phaser";

var player;
var stars;
var bombs;
var bombs2;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var fondo;
var scoreTime;
var tiempo = 0;
var corazones;
var nextBombTime = 0;
var invulnerable = false;
//
var backgroundMusic;
var musicaActivada = true;
//
export class Game extends Scene {
  constructor() {
    super("Game");
  }

  ///////////// CREATE ///////////
  create() {
    //  A simple background for our game
    fondo = this.add.image(
      this.scale.gameSize.width / 2,
      this.scale.gameSize.height / 2,
      "sky"
    );
    fondo.setDisplaySize(this.scale.gameSize.width, this.scale.gameSize.height);

    //  The platforms group contains the ground and the 2 ledges we can jump on

    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms
      .create(450, 725, "atlas", "platform.png")
      .setScale(4)
      .refreshBody();

    //  Now let's create some ledges
    platforms.create(600, 550, "atlas", "platform.png");
    platforms.create(50, 450, "atlas", "platform.png");
    platforms.create(750, 380, "atlas", "platform.png");

    //botones
    //boton silenciar sonido
    // Agrega un botón
    var button = this.add
      .text(820, 710, "Stop music", { fill: "#FFFFFF" })
      .setInteractive();

    // Obtén las dimensiones del texto
    var textBounds = button.getBounds();

    // Dibuja un rectángulo alrededor del texto
    var graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff);
    graphics.strokeRect(
      textBounds.x - 5,
      textBounds.y - 5,
      textBounds.width + 10,
      textBounds.height + 10
    );

    // Agrega un evento de clic al botón
    button.on("pointerdown", function () {
      // Aquí puedes especificar qué acción deseas que ocurra cuando se haga clic en el botón
      if (musicaActivada) {
        // Si la música está activada, desactívala
        backgroundMusic.stop();
        // Actualiza el estado de la música
        musicaActivada = false;
      } else {
        // Si la música está desactivada, actívala
        backgroundMusic.play();
        // Actualiza el estado de la música
        musicaActivada = true;
      }
    });

    // The player and its settings
    player = this.physics.add.sprite(100, 450, "dude");

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //  Animaciones de caminar //
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    // Animaciones de Explocion //
    this.anims.create({
      key: "bum",
      frames: this.anims.generateFrameNumbers("explocion", {
        start: 0,
        end: 15,
      }),
      frameRate: 10,
    });

    // Animacion segunda Bomba //
    this.anims.create({
      key: "bum2",
      frames: this.anims.generateFrameNumbers("explocion2", {
        start: 0,
        end: 8,
      }),
      frameRate: 0.9,
    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();
    cursors.A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    cursors.D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    cursors.B = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    stars = this.physics.add.group({
      key: "atlas",
      frame: "star.png",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    stars.children.iterate(function (child) {
      //  Give each star a slightly different bounce
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    bombs = this.physics.add.group();
    bombs2 = this.physics.add.group();

    //  The score
    scoreText = this.add.text(16, 16, "score: 0", {
      fontSize: "32px",
      fill: "#000",
    });
    scoreTime = this.add.text(16, 50, "Time: 00:00:00", {
      fontSize: "32px",
      fill: "#000",
    });

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(bombs2, platforms);
    this.physics.add.collider(bombs2, player);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, this.collectStar, null, this);

    this.physics.add.collider(player, bombs, this.hitBomb, null, this);

    // Añadimos los corazones

    corazones = this.add.group();
    corazones
      .create(this.scale.gameSize.width - 40, 20, "atlas", "heart.png")
      .setOrigin(1, 0);
    corazones
      .create(this.scale.gameSize.width - 70, 20, "atlas", "heart.png")
      .setOrigin(1, 0);
    corazones
      .create(this.scale.gameSize.width - 100, 20, "atlas", "heart.png")
      .setOrigin(1, 0);

    //tiempo en aparecer la segunda bomba
    nextBombTime = this.time.now + 20000;

    // Cargar y reproducir música de fondo en bucle con un volumen reducido
    backgroundMusic = this.sound.add("backmusic", {
      loop: true,
      volume: 0.5,
    });
    backgroundMusic.play();
    musicaActivada = true;

    /////////////////
    // Añadir un evento de clic del ratón para cambiar a la escena de Gameover
    this.input.on("pointerdown", () => {
      //this.gameOver();
    });
    ////////////////
  }
  ///////////// UPDATE ///////////
  update(time, deltaTime) {
    if (gameOver) {
      return;
    }

    if (cursors.left.isDown || cursors.A.isDown) {
      player.setVelocityX(-160);

      player.anims.play("left", true);
    } else if (cursors.right.isDown || cursors.D.isDown) {
      player.setVelocityX(160);

      player.anims.play("right", true);
    } else {
      player.setVelocityX(0);

      player.anims.play("turn");
    }

    if (
      (cursors.up.isDown || cursors.space.isDown) &&
      player.body.touching.down
    ) {
      player.setVelocityY(-330);
      //sound saltar
      this.sound.playAudioSprite("audiosprite", "jump");
    }

    if (cursors.B.isDown) {
      //this.create2Bomb();
    }

    this.tiempoReal(deltaTime);

    // Lanzar la función para crear una bomba cada 20 segundos
    if (this.time.now > nextBombTime) {
      // Generar un número aleatorio entre 1 y 3 para determinar cuántas bombas crear
      var numBombsToCreate = Phaser.Math.Between(1, 3);

      // Crear el número aleatorio de bombas
      for (var i = 0; i < numBombsToCreate; i++) {
        // Crear una bomba
        this.create2Bomb();
      }
      nextBombTime = this.time.now + 10000; // Establecer el próximo tiempo para la siguiente bomba
    }
  }

  ///////////// OTHER FUNCTION ///////////
  ///////////// COLLECT START ///////////

  collectStar(player, star) {
    var x = star.x;
    var y = star.y;
    star.disableBody(false, false);
    //////////////
    // Crear el sistema de partículas
    const emitter = this.add.particles(0, 0, "atlas", {
      frame: ["sparkle.png"],
      lifespan: 4000,
      speed: { min: 150, max: 250 },
      scale: { start: 0.8, end: 0 },
      gravityY: 150,
      blendMode: "ADD",
      emitting: false,
      x: x,
      y: y,
    });

    //añadir particulas
    emitter.explode(16, x, y);
    //añadir sonido de recolectar estrellas
    this.sound.playAudioSprite("audiosprite", "start");
    //////////////
    // Animar la opacidad de la estrella recogida a 0 (transparente)
    this.tweens.add({
      targets: star,
      alpha: 0, // Opacidad a 0
      duration: 500, // Duración de la animación en milisegundos
      onComplete: function () {
        // Una vez que se complete la animación
        // Deshabilitar el cuerpo de la estrella para que desaparezca
        star.disableBody(true, true);

        // Añadir puntos al puntaje
        score += 10;
        scoreText.setText("Score: " + score);

        // Crear nuevas estrellas si no quedan estrellas activas
        if (stars.countActive(true) === 0) {
          // Activar el cuerpo de todas las estrellas para que aparezcan nuevamente
          stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
            child.setAlpha(1);
          });

          // Generar una nueva posición en el eje X para la próxima estrella
          var x =
            player.x < 400
              ? Phaser.Math.Between(400, 800)
              : Phaser.Math.Between(0, 400);

          // Crear una nueva bomba en la posición generada
          var bomb = bombs.create(x, 16, "atlas", "bomb.png");
          bomb.setBounce(1);
          bomb.setCollideWorldBounds(true);
          bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
          bomb.allowGravity = false;
        }
      },
    });
  }

  ///////////// HIT BOMB ///////////

  hitBomb(player, bomb) {
    this.hitPlayer(player, bomb);

    this.sound.playAudioSprite("audiosprite", "explosion", {
      volume: 0.3, // Ajusta el volumen según sea necesario (0.0 - 1.0)
    });

    //congelar bomba cuando toca al jugador
    bomb.body.setVelocity(0, 0);
    bomb.body.enable = false;

    //explocion
    bomb.anims.play("bum", true).on("animationcomplete", function () {
      bomb.destroy();
    });
  }

  ////////////// TIEMPO//////////
  tiempoReal(deltaTime) {
    tiempo += deltaTime / 1000;

    var horas = Math.floor(tiempo / 3600);
    var minutos = Math.floor((tiempo % 3600) / 60);
    var segundos = tiempo % 60;

    this.tiempoFormateado =
      (horas < 10 ? "0" : "") +
      horas +
      ":" +
      (minutos < 10 ? "0" : "") +
      minutos +
      ":" +
      Math.floor(segundos).toString().padStart(2, "0");

    return scoreTime.setText("Time: " + this.tiempoFormateado);
  }

  /////////// SEGUNDA BOMBA ////////
  create2Bomb() {
    var x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);
    var bomb = bombs2.create(x, 16, "explosion2");
    bomb.setBounce(0.8);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.allowGravity = false;

    // Iniciar la animación al rebotar
    bomb.anims.play("bum2", true);

    // Establecer el tamaño del collider
    // Refresh del cuerpo para aplicar el cambio en el tamaño del collider
    bomb.setSize(40, 40);

    // Programar la explosión después de un cierto tiempo
    this.time.delayedCall(10000, () => this.explodeBomb(bomb), [], this);
  }

  ////

  explodeBomb(bomb) {
    // Verificar si bomb es un objeto válido
    if (!bomb) {
      console.error("El objeto bomba es indefinido.");
      return;
    }

    // Ajustar el tamaño del sprite de la bomba
    bomb.setScale(3); // Ajusta el valor según lo necesario

    // Detener la animación de rebote
    if (bomb.anims) {
      bomb.anims.stop("bum2");
    }

    // Detener el movimiento de la bomba
    if (bomb.body) {
      bomb.body.setVelocity(0, 0);
      bomb.body.enable = false /*true*/;
      bomb.setImmovable(true);
      bomb.body.allowGravity = false;
    }

    // Cambiar a la animación de explosión
    if (bomb.anims) {
      bomb.anims.play("bum", true).on("animationcomplete", function () {
        // Una vez que la animación de explosión esté completa, destruir la bomba
        bomb.destroy();
      });
      //sound explocion
      this.sound.playAudioSprite("audiosprite", "largeExplosion", {
        volume: 0.3, // Ajusta el volumen según sea necesario (0.0 - 1.0)
      });
    }

    // Ajustar el collider del jugador a la posición de la explosión de la bomba
    // bomb.body.setCircle(25); // Ajusta el tamaño según sea necesario
    // bomb.body.setOffset(-5.5, -1.5); // Ajusta el offset para centrar el collider
    // Configurar el cuerpo físico de la bomba para que no tenga colisión

    // Detectar colisión entre el jugador y la explosión
    // this.physics.add.overlap(player, bomb, this.hitPlayer, null, this);

    const bodiesInCircle = this.physics.overlapCirc(
      bomb.x + 12,
      bomb.y + 12,
      65,
      true,
      true
    );

    if (bodiesInCircle.includes(player.body)) {
      this.hitPlayer(player, bomb);
    }
  }
  hitPlayer(player, bomb) {
    // Verificar si el jugador está invulnerable
    if (invulnerable) {
      return;
    }

    // Reproducir el sonido al recibir daño
    this.damageSound();

    // Obtener todos los corazones visibles
    var visibleHearts = corazones
      .getChildren()
      .filter((child) => child.visible);

    // Restar un corazón independientemente de si hay corazones visibles
    if (visibleHearts.length > 0) {
      // Obtener el último corazón visible
      var lastVisibleHeart = visibleHearts[visibleHearts.length - 1];

      // Animar la escala del corazón a 0
      this.tweens.add({
        targets: lastVisibleHeart,
        scaleX: 0,
        scaleY: 0,
        duration: 200, // Duración de la animación en milisegundos
        onComplete: () => {
          // Una vez que se complete la animación, ocultar y destruir el corazón
          lastVisibleHeart.setVisible(false);
          lastVisibleHeart.destroy();
        },
      });
      //cambiar el color de player cuando recibe daño
      player.setTint(0xff0000);
      this.time.delayedCall(
        100,
        () => {
          player.clearTint();
        },
        [],
        this
      );
      ///
      // Realizar el efecto de screen shake
      var shakeIntensity = 0.02; // Intensidad del shake
      var shakeDuration = 2000; // Duración del shake en milisegundos
      this.cameras.main.shake(shakeDuration, shakeIntensity);

      // Marcar al jugador como invulnerable durante un período de tiempo
      invulnerable = true;
      this.time.delayedCall(2000, () => {
        invulnerable = false; // El jugador ya no es invulnerable después de 2 segundos
      });
    }

    // Verificar si no quedan más corazones
    if (corazones.countActive(true) === 0) {
      // Si no quedan corazones, el juego termina
      this.physics.pause();
      player.setTint(0xff0000);
      player.anims.play("turn");
      gameOver = true;

      // Esperar 5 segundos antes de cambiar a la pantalla de Gameover
      this.time.delayedCall(
        5000,
        () => {
          this.gameOver();
        },
        [],
        this
      );
      gameOver = false;
    }
  }

  //////////////////// GAME OVER /////////////////
  gameOver() {
    // Cambiar a la escena de Gameover y pasar la puntuación y el tiempo como datos
    this.scene.start("GameOver", {
      score: score,
      tiempo: this.tiempoFormateado,
    });
    backgroundMusic.stop();
    musicaActivada = false;
    tiempo = 0;
    score = 0;
  }
  //////////////////// DAMAGE SOUND ///////////////
  damageSound() {
    this.sound.playAudioSprite("audiosprite", "damage");
  }
}

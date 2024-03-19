import { Scene } from 'phaser';

export class GameOver extends Scene {
  constructor() {
    super('GameOver');
  }

  create(data) {
    // Obtener la puntuación y el tiempo de los datos pasados desde la escena anterior
    const { score, tiempo } = data;
    this.cameras.main.setBackgroundColor(0xff0000);

    this.add.image(512, 384, 'background').setAlpha(0.5);

    // Mostrar la puntuación y el tiempo
    this.add.text(400, 200, 'Game Over', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
    this.add.text(400, 300, 'Score: ' + score, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    this.add.text(400, 350, 'Tiempo: ' + tiempo, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

    // Crear un rectángulo como borde del botón
    const buttonBorder = this.add.rectangle(400, 450, 200, 50, 0xffffff).setStrokeStyle(3, 0x000000);

    // Crear el texto del botón "Play Again"
    const playAgainText = this.add.text(400, 450, 'Play Again', { fontSize: '32px', fill: '#000' }).setOrigin(0.5);

    // Hacer que el botón sea interactivo
    buttonBorder.setInteractive();

    // Agregar evento de clic al botón
    buttonBorder.on('pointerdown', () => {
      this.scene.start('Game'); // Vuelve a iniciar el juego al hacer clic en "Play Again"
    });
  }
}

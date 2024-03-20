import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
    this.add.image(512, 384, 'background');

    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on('progress', (progress) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath('assets');

    //this.load.image('logo', 'logo.png');

    this.load.image('sky', 'sky.png');
    //this.load.image('ground', 'platform.png');
    //this.load.image('star', 'star.png');
    //this.load.image('bomb', 'bomb.png');
    //this.load.image('heart', 'heart.png');
    this.load.spritesheet('dude', 'dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('explocion', 'explosion_scaled_down.png', { frameWidth: 36, frameHeight: 36 });
    this.load.spritesheet('explocion2', 'secondBomb.png', { frameWidth: 80, frameHeight: 80 });
    this.load.atlas('atlas', 'atlas.png', 'atlas.json');
    //music
    /*this.load.audio('botton', 'botton.mp3');
    this.load.audio('damage', 'damage.mp3');
    this.load.audio('explosion', 'explosion.mp3');
    this.load.audio('largeExplosion', 'largeExplosion.mp3');
    this.load.audio('jump', 'jump.mp3');
    
    this.load.audio('start', 'start.mp3');*/
    this.load.audioSprite('audiosprite', 'audiosprite.json', ['audiosprite.mp3']);
    this.load.audio('backmusic', 'BackMusic.mp3');
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start('MainMenu');
  }
}

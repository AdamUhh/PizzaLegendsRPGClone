class Sprite {
  constructor(config) {
    // ? Setup the image
    this.image = new Image();
    this.image.src = config.src;
    this.image.onload = () => {
      this.isLoaded = true;
    };

    // ? Shadow
    this.shadow = new Image();
    this.useShadow = true;
    if (this.useShadow) {
      this.shadow.src = "/images/characters/shadow.png";
    }
    this.shadow.onload = () => {
      this.isShadowLoaded = true;
    };

    // ? Configure Animation and Initial State
    this.animations = config.animations || {
      "idle-down": [[0, 0]],
    };
    this.currentAnimation = config.currentAnimation || "idle-down";
    this.currentAnimationFrame = 0; // ? which animation (frame) to show

    // ? Reference game object
    this.gameObject = config.gameObject;
  }

  draw(ctx) {
    const x = this.gameObject.x - 8;
    const y = this.gameObject.y - 18;

    this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);

    this.isLoaded &&
      ctx.drawImage(
        this.image,
        0, // ? left side of image
        0, // ? top side of image
        32, // ? width of cut
        32, // ? height of cut
        x,
        y,
        32,
        32
      );
  }
}

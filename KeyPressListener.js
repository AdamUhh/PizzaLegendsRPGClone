class KeyPressListener {
    // ? Only allows a single press at a time (cannot hold down and spam a key)
    // ? ex: if you hold 'Enter' for the dialogue box, it will not spam through 
    // ? the text message until you release and press 'Enter' again
  constructor(keyCode, callback) {
    let keySafe = true;
    // ? these callback functions ('keydownFunction','keyupFunction') is saved to
    // ? the class like this is to be able to unbind them later
    this.keydownFunction = function (event) {
    if (event.code === keyCode) {
        if (keySafe) {
          keySafe = false;
          callback();
        }
      }
    };
    this.keyupFunction = function (event) {
      if (event.code === keyCode) {
        keySafe = true;
      }
    };

    document.addEventListener("keydown", this.keydownFunction);
    document.addEventListener("keyup", this.keyupFunction);
  }

  unbind() {
    document.removeEventListener("keydown", this.keydownFunction);
    document.removeEventListener("keyup", this.keyupFunction);
  }
}

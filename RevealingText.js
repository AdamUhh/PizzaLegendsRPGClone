class RevealingText {
  constructor(config) {
    this.element = config.element; // ? existing  element that we want to fill with the span tags
    this.text = config.text;
    this.speed = config.speed || 60;

    this.timeout = null;
    this.isDone = false;
  }

  warpToDone() {
    clearTimeout(this.timeout);
    this.isDone = true;
    this.element.querySelectorAll("span").forEach((s) => {
      s.classList.add("revealed");
    });
  }

  revealOneCharacter(list) {
    const next = list.splice(0, 1)[0];
    next.span.classList.add("revealed");

    if (list.length > 0) {
      this.timeout = setTimeout(() => {
        this.revealOneCharacter(list);
      }, next.delayAfter);
    } else {
      this.isDone = true;
    }
  }

  init() {
    let characters = [];
    this.text.split("").forEach((character) => {
      // ? Create each span, add it to DOM
      let span = document.createElement("span");
      span.textContent = character;
      this.element.appendChild(span);

      // ? Add span to internal state array
      characters.push({
        span,
        delayAfter: character === " " ? 0 : this.speed,
      });
    });

    this.revealOneCharacter(characters);
  }
}

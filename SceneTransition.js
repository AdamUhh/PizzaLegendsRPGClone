class SceneTransition {
  constructor() {
    this.element = null;
  }
  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("SceneTransition");
  }

  fadeOut(element) {
    // ? used to fade-out animation for smoothness
    this.element.classList.add("fade-out");

    this.element.addEventListener(
      "animationstart",
      () => {
        if (element) {
          element.remove();
        }
      },
      { once: true }
    );

    this.element.addEventListener(
      "animationend",
      () => {
        this.element.remove();
      },
      { once: true }
    );
  }

  init(container, callback) {
    this.createElement();
    container.appendChild(this.element);

    this.element.addEventListener(
      "animationend",
      () => {
        callback();
      },
      { once: true }
    );
  }
}

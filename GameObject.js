// ? anything that can be interacted with is considered a game object
class GameObject {
  constructor(config) {
    this.id = null;
    this.isMounted = false;
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.direction = config.direction || "down";
    this.sprite = new Sprite({
      gameObject: this,
      src: config.src || "/images/characters/people/hero.png",
    });

    this.behaviourLoop = config.behaviourLoop || [];
    this.behaviourLoopIndex = 0; // ? keep track of which behaviour we're on

    this.talking = config.talking || [];
  }
  mount(map) {
    this.isMounted = true;
    map.addWall(this.x, this.y);

    // ? If we gave a behaviour, kick off after a short delay
    // ? Leave a short timing gap for global overworld cutscreen loop
    // ? can come in first
    setTimeout(() => {
      this.doBehaviourEvent(map);
    }, 10);
  }
  update() {}

  async doBehaviourEvent(map) {
    // ? Don't do anything if there is a more important cutscene
    // ? Or if there is no config/behaviour to do anything
    // ? or if they are standing
    if (map.isCutscenePlaying || this.behaviourLoop.length === 0 || this.isStanding) return;

    // ? Setting up our event with relevant info
    let eventConfig = this.behaviourLoop[this.behaviourLoopIndex];
    eventConfig.who = this.id;

    // ? Create an event instance out of our next event config
    // ? OverworldEvent will contain the code that instructs the events
    // ? (e.g. people, dialogues, etc.) to do their behaviour
    const eventHandler = new OverworldEvent({ map, event: eventConfig });
    await eventHandler.init();

    // ? Setting next event to fire
    this.behaviourLoopIndex += 1;
    if (this.behaviourLoopIndex === this.behaviourLoop.length) this.behaviourLoopIndex = 0;

    // ? Do it again
    this.doBehaviourEvent(map);
  }
}

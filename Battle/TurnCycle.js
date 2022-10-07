class TurnCycle {
  constructor({ battle, onNewEvent }) {
    this.battle = battle;
    this.onNewEvent = onNewEvent;
    this.currentTeam = "player";
  }

  async turn() {
    // ? Get the caster
    const casterId = this.battle.activeCombatants[this.currentTeam];
    const caster = this.battle.combatants[casterId];

    // ? Get the enemy
    const enemyId = this.battle.activeCombatants[caster.team === "player" ? "enemy" : "player"];
    const enemy = this.battle.combatants[enemyId];

    // ? which action do you want to use and who do you want to use it on
    const submission = await this.onNewEvent({
      type: "submissionMenu",
      enemy,
      caster,
    });
    const resultingEvents = submission.action.success;

    for (let i = 0; i < resultingEvents.length; i++) {
      const event = {
        ...resultingEvents[i],
        submission,
        action: submission.action,
        caster,
        target: submission.target,
      };
      await this.onNewEvent(event);
    }

    this.currentTeam = this.currentTeam === "player" ? "enemy" : "player";
    this.turn();
  }

  async init() {
    await this.onNewEvent({
      type: "textMessage",
      text: "The battle is starting!",
    });

    // ? Start the first turn!
    this.turn();
  }
}

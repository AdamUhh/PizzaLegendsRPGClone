class TurnCycle {
  // ? handles each turn (between player and enemy)
  constructor({ battle, onNewEvent, onWinner }) {
    this.battle = battle;
    this.onNewEvent = onNewEvent; // ? every event, such as dialogue, is run inside BattleEvent.js
    this.onWinner = onWinner;
    this.currentTeam = "player"; // ? player starts first
  }

  // ? this is run on every turn
  async turn() {
    // ? caster and enemy are from Combatant.js

    // ? Get the caster (which is basically the one going to attack)
    // ? can be the player or enemy
    const casterId = this.battle.activeCombatants[this.currentTeam];
    // ? combatants is all of the pizzas from both player and enemy
    const caster = this.battle.combatants[casterId];
    // ? Get the opponent (basically, if the "enemy" is the player, "caster" is the enemy)
    const enemyId = this.battle.activeCombatants[caster.team === "player" ? "enemy" : "player"];
    const enemy = this.battle.combatants[enemyId];

    // ? Essentially, this creates a menu that the player can control
    // ? and returns what the player wants to do
    const submission = await this.onNewEvent({
      type: "submissionMenu",
      enemy,
      caster,
    });

    // ? Stop here player wants to replace a pizza
    if (submission.replacement) {
      await this.onNewEvent({
        type: "replace",
        replacement: submission.replacement,
      });
      await this.onNewEvent({
        type: "textMessage",
        text: `Go get em', ${submission.replacement.name}`,
      });
      this.nextTurn();
      return;
    }

    // ? if player used an item
    // ? note: instanceId is basically a uuid for that item
    if (submission.instanceId) {
      // ? Add to usedInstance list to remove from playerState later (ONLY IF PLAYER WINS)
      this.battle.usedInstanceIds[submission.instanceId] = true;

      // ? Removing item from current battle state
      this.battle.items = this.battle.items.filter((i) => i.instanceId !== submission.instanceId);
    }

    // ? if the action has a success sub object, execute it
    // ? these could be a list of animations, dialogue and stateChanges
    // ? getReplacedEvents() is inside Combatant.js
    const resultingEvents = caster.getReplacedEvents(submission.action.success);

    // ? if the attack/item has a success/resultingEvent, run them all one by one
    for (let i = 0; i < resultingEvents.length; i++) {
      const event = {
        ...resultingEvents[i],
        submission,
        action: submission.action,
        caster,
        target: submission.target,
      };
      // ? remember, submission: action, target, instanceId
      // ? so action can be to use an item: "Healing Lamp", or to attack: "Whomp"
      await this.onNewEvent(event);
    }

    // ? Did the target die?
    const targetDead = submission.target.hp <= 0;
    if (targetDead) {
      await this.onNewEvent({
        type: "textMessage",
        text: `${submission.target.name} is ruined!`,
      });
      if (submission.target.team === "enemy") {
        // ? get the active pizza of the player team
        const playerActivePizzaId = this.battle.activeCombatants.player;
        const xp = submission.target.givesXp;

        await this.onNewEvent({
          type: "textMessage",
          text: `Gained ${xp} xp`,
        });
        await this.onNewEvent({
          type: "giveXp",
          xp,
          combatant: this.battle.combatants[playerActivePizzaId],
        });
      }
    }
    // ? Do we have a winning team
    const winner = this.getWinningTeam();
    if (winner) {
      await this.onNewEvent({
        type: "textMessage",
        text: "We have a winner!",
      });
      this.onWinner(winner);
      return;
    }

    // ? Dead target but no winner, so display the submissionMenu for the
    // ? player to choose his next active pizza
    if (targetDead) {
      const replacement = await this.onNewEvent({
        type: "replacementMenu",
        team: submission.target.team,
      });
      await this.onNewEvent({
        type: "replace",
        replacement,
      });
      await this.onNewEvent({
        type: "textMessage",
        text: `${replacement.name} appears!`,
      });
    }

    // ? Check for post events
    // ? Do things after your original turn submission
    const postEvents = caster.getPostEvents();

    for (let i = 0; i < postEvents.length; i++) {
      const event = {
        ...postEvents[i],
        submission,
        action: submission.action,
        caster,
        target: submission.target,
      };
      await this.onNewEvent(event);
    }

    // ? Check for status expire
    const expiredEvent = caster.decrementStatus();
    if (expiredEvent) {
      await this.onNewEvent(expiredEvent);
    }

    this.nextTurn();
  }

  nextTurn() {
    this.currentTeam = this.currentTeam === "player" ? "enemy" : "player";
    this.turn();
  }
  getWinningTeam() {
    let aliveTeams = {};
    // ? check all combatants, and if any are alive on each team, report it as true
    Object.values(this.battle.combatants).forEach((c) => {
      // ? if any pizza is still alive, set team alive status to true
      if (c.hp > 0) {
        aliveTeams[c.team] = true;
      }
    });
    // ? if the player/enemy team has no alive pizza, return opposite team
    if (!aliveTeams["player"]) {
      return "enemy";
    }
    if (!aliveTeams["enemy"]) {
      return "player";
    }
    return null;
  }

  async init() {
    await this.onNewEvent({
      type: "textMessage",
      text: `${this.battle.enemy.name} ${this.battle.enemy.battleText}`,
    });

    // ? Start the first turn!
    this.turn();
  }
}

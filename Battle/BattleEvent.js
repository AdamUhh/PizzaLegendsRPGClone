class BattleEvent {
  constructor(event, battle) {
    this.event = event;
    this.battle = battle;
  }

  textMessage(resolve) {
    const text = this.event.text
      .replace("{CASTER}", this.event.caster?.name)
      .replace("{TARGET}", this.event.target?.name)
      .replace("{ACTION}", this.event.action?.name);

    const message = new TextMessage({
      text,
      onComplete: () => {
        resolve();
      },
    });
    message.init(this.battle.element);
  }

  async stateChange(resolve) {
    const { caster, target, damage, recover, status } = this.event;
    // ? when player attacks, caster: player, target: enemy
    // ? when enemy atatcks, caster: enemy, target: player
    // ? unless onCaster is specified (like using a healing item)
    // ? who will always be the opponent
    let who = this.event.onCaster ? caster : target;

    if (damage) {
      // ? modify the target to have less hp
      target.update({
        hp: target.hp - damage,
      });

      // ? start blinking
      target.pizzaElement.classList.add("battle-damage-blink");
    }

    if (recover) {
      let newHp = who.hp + recover;
      if (newHp > who.maxHp) {
        newHp = who.maxHp;
      }

      who.update({ hp: newHp });
    }

    if (status) {
      who.update({
        status: { ...status },
      });
    }

    if (status === null) {
      who.update({ status: null });
    }

    // ? Wait a little bit
    await utils.wait(600);

    this.battle.playerTeam.update();
    this.battle.enemyTeam.update();

    // ? stop blinking
    target.pizzaElement.classList.remove("battle-damage-blink");

    resolve();
  }

  submissionMenu(resolve) {
    const { caster, enemy } = this.event; // ? caster and enemy are both Combatant.js
    const menu = new SubmissionMenu({
      caster,
      enemy,
      items: this.battle.items,
      replacements: Object.values(this.battle.combatants).filter((c) => {
        // ? return not the current combatant and the combatants that
        // ? are on the same team and are alive
        return c.id !== caster.id && c.team === caster.team && c.hp > 0;
      }),
      onComplete: (submission) => {
        // ? submission -> this is basically the action.
        // ? It tells us what to do after player chooses
        // ? submission.replacement -> replaces current pizza with selected/replacement pizza
        // ? submission.action -> player chooses to use an attack
        // ? submission.action AND submission.instanceId -> player chooses to use an item
        resolve(submission); // ? this is resolved inside the TurnCycle.js (turn())
      },
    });
    menu.init(this.battle.element);
  }

  async replace(resolve) {
    // ? replace the current pizza with the replacement pizza
    const { replacement } = this.event;

    // ? Clear our the old combatant
    const prevCombatant = this.battle.combatants[this.battle.activeCombatants[replacement.team]];
    this.battle.activeCombatants[replacement.team] = null;
    prevCombatant.update();
    await utils.wait(400);

    // ? In with the new
    this.battle.activeCombatants[replacement.team] = replacement.id;
    replacement.update();
    await utils.wait(400);

    this.battle.playerTeam.update();
    this.battle.enemyTeam.update();

    resolve();
  }

  replacementMenu(resolve) {
    const menu = new ReplacementMenu({
      // ? list of combatants that can be chosen
      // ? must be from same team and be alive
      replacements: Object.values(this.battle.combatants).filter((c) => {
        return c.team === this.event.team && c.hp > 0;
      }),
      onComplete: (replacement) => {
        resolve(replacement);
      },
    });
    menu.init(this.battle.element);
  }

  giveXp(resolve) {
    let amount = this.event.xp;
    const { combatant } = this.event;
    const step = () => {
      if (amount > 0) {
        amount -= 1;
        combatant.xp += 1;

        // ? Check if we've hit level up point
        if (combatant.xp === combatant.maxXp) {
          combatant.xp = 0;
          combatant.maxXp += 20;
          combatant.level += 1;
        }

        combatant.update();
        requestAnimationFrame(step);
        return;
      }
      resolve();
    };
    requestAnimationFrame(step);
  }

  animation(resolve) {
    const fn = BattleAnimations[this.event.animation];
    fn(this.event, resolve);
  }

  init(resolve) {
    this[this.event.type](resolve);
  }
}

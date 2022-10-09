window.Actions = {
  damage1: {
    name: "Whomp",
    description: "Pillowy punch of dough",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
      { type: "animation", animation: "spin" },
      { type: "stateChange", damage: 10 },
    ],
  },
  saucyStatus: {
    name: "Tomato Squeeze",
    description: "Applies the Saucy status",
    targetType: "friendly",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
      { type: "stateChange", status: { type: "saucy", expiresIn: 3 } },
    ],
  },
  clumsyStatus: {
    name: "Olive Oil",
    description: "Replaces enemy status",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
      { type: "animation", animation: "glob", color: "#dafd2a" },
      { type: "stateChange", status: { type: "clumsy", expiresIn: 3 } },
      { type: "textMessage", text: "{TARGET} is slipping all around!" },
    ],
  },
  // ? Items
  item_recoverStatus: {
    name: "Healing Lamp",
    description: "Feeling fresh and warm",
    targetType: "friendly",
    success: [
      { type: "textMessage", text: "{CASTER} sprinkles on some {ACTION}!" },
      { type: "stateChange", recover: 5 },
      { type: "textMessage", text: "{CASTER} recovers +5 HP!" },
    ],
  },
  item_recoverHp: {
    name: "Parmasan",
    description: "Feeling better",
    targetType: "friendly",
    success: [
      { type: "textMessage", text: "{CASTER} drinks some {ACTION}!" },
      { type: "stateChange", recover: 10 },
      { type: "textMessage", text: "{CASTER} recovers +10 HP!" },
    ],
  },
};

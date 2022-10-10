window.Actions = {
  damage1: {
    name: "Whomp!",
    description: "Pillowy punch of dough, +10 Damage",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
      { type: "animation", animation: "spin"},
      { type: "stateChange", damage: 10}
    ]
  },
  saucyStatus: {
    name: "Tomato Squeeze",
    description: "Applies the Saucy status, +5 HP every player turn",
    targetType: "friendly",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
      { type: "stateChange", status: { type: "saucy", expiresIn: 3 } }
    ]
  },
  clumsyStatus: {
    name: "Olive Oil",
    description: "Slippery mess of deliciousness, has a change to nullify opponents attack",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
      { type: "animation", animation: "glob", color: "#dafd2a" },
      { type: "stateChange", status: { type: "clumsy", expiresIn: 3 } },
      { type: "textMessage", text: "{TARGET} is slipping all around!"},
    ]
  },
  //Items
  item_recoverStatus: {
    name: "Heating Lamp",
    description: "Feeling fresh and warm",
    targetType: "friendly",
    success: [
      { type: "textMessage", text: "{CASTER} uses a {ACTION}!"},
      { type: "stateChange", recover: 5, },
      { type: "textMessage", text: "Feeling fresh! +5 HP", },
    ]
  },
  item_recoverHp: {
    name: "Parmesan",
    description: "Smells great!",
    targetType: "friendly",
    success: [
      { type:"textMessage", text: "{CASTER} sprinkles on some {ACTION}!", },
      { type:"stateChange", recover: 10, },
      { type:"textMessage", text: "{CASTER} recovers +10 HP!", },
    ]
  },
}
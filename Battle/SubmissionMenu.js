class SubmissionMenu {
  constructor({ caster, enemy, onComplete, items, replacements }) {
    this.caster = caster;
    this.enemy = enemy;
    this.replacements = replacements;
    this.onComplete = onComplete;

    let quantityMap = {};
    items.forEach((item) => {
      // ? if an item belongs to the player (or enemy) team,
      // ? check if it exists in the quantityMap
      // ? if it does, add one to the quantity of that item
      // ? if not, create a new object for that item, with a quantity of 1
      if (item.team === caster.team) {
        let existing = quantityMap[item.actionId];
        if (existing) {
          existing.quantity += 1;
        } else {
          quantityMap[item.actionId] = {
            actionId: item.actionId,
            quantity: 1,
            instanceId: item.instanceId, // ? instanceId is basically a uuid
            // ? instanceId is needed to filter/remove the item from playerState later on
          };
        }
      }
    });
    // ? items are only those that are in the players inventory
    this.items = Object.values(quantityMap);
  }

  getPages() {
    const backOption = {
      label: "Go Back",
      description: "Return to previous page",
      handler: () => {
        // ? since the menu is small, it just goes back to the root page
        this.keyboardMenu.setOptions(this.getPages().root);
      },
    };

    return {
      root: [
        {
          label: "Attack",
          description: "Choose an attack",
          handler: () => {
            // ? Go to attacks page
            this.keyboardMenu.setOptions(this.getPages().attacks);
          },
        },
        {
          label: "Items",
          description: "Choose an item",
          handler: () => {
            // ? Go to items page
            this.keyboardMenu.setOptions(this.getPages().items);
          },
        },
        {
          label: "Swap",
          description: "Change to another pizza",
          handler: () => {
            // ? See all other pizzas on player team to replace current pizza
            this.keyboardMenu.setOptions(this.getPages().replacements);
          },
        },
      ],
      attacks: [
        ...this.caster.actions.map((key) => {
          const action = Actions[key];
          return {
            label: action.name,
            description: action.description,
            handler: () => {
              this.menuSubmit(action);
            },
          };
        }),
        backOption,
      ],
      items: [
        // ? items will go here

        ...this.items.map((item) => {
          const action = Actions[item.actionId];
          return {
            label: action.name,
            description: action.description,
            right: () => {
              // ? show quantity along with each item
              return "x" + item.quantity;
            },
            handler: () => {
              this.menuSubmit(action, item.instanceId);
            },
          };
        }),

        backOption,
      ],
      replacements: [
        ...this.replacements.map((replacement) => {
          return {
            label: replacement.name,
            description: replacement.description,
            handler: () => {
              // ? Swap in the current pizza with the replacement pizza
              this.menuSubmitReplacement(replacement);
            },
          };
        }),
        backOption,
      ],
    };
  }

  menuSubmitReplacement(replacement) {
    this.keyboardMenu?.end();
    this.onComplete({
      replacement,
    });
  }

  menuSubmit(action, instanceId = null) {
    this.keyboardMenu?.end();

    this.onComplete({
      action, // ? either attack or use an item
      target: action.targetType === "friendly" ? this.caster : this.enemy,
      instanceId, // ? required only if its an item
    });
  }
  decide() {
    // ? this.caster.actions only contains attacks.
    // ? this means that npcs cannot use items (to heal)
    const rand = Math.floor(Math.random() * this.caster.actions.length);
    this.menuSubmit(Actions[this.caster.actions[rand]]);
  }

  showMenu(container) {
    this.keyboardMenu = new KeyboardMenu(); // ? used to control menu via mouse and keyboard arrows
    this.keyboardMenu.init(container);
    this.keyboardMenu.setOptions(this.getPages().root);
  }

  init(container) {
    // ? is player the one who initialized the menu
    if (this.caster.isPlayerControlled) {
      // ? Show UI
      this.showMenu(container);
    } else {
      // ? automatically decide what the npc should do
      this.decide();
    }
  }
}

const MENU_BUTTONS = [
  {
    id: "start",
    text: "Play",
    callback: (menu: Menu) => {
      window.dispatchEvent(new Event("GAME_START"));
      menu.close();
    },
  },
  {
    id: "resume",
    text: "Resume",
    callback: (menu: Menu) => {
      window.dispatchEvent(new Event("GAME_RESUME"));
      menu.close();
    },
  },
  {
    id: "restart",
    text: "Restart",
    callback: (menu: Menu) => {
      window.dispatchEvent(new Event("GAME_RESTART"));
      menu.close();
    },
  },
  {
    id: "musicControl",
    text: "Toggle Music",
    callback: (menu: Menu) => {
      if (!menu.musicState) {
        window.dispatchEvent(new Event("MUSIC_PAUSE"));
      } else {
        window.dispatchEvent(new Event("MUSIC_PLAY"));
      }
      menu.toggleMusicState();
    },
  },
];

export class Menu {
  #id = "menu";
  #name = "menu";
  #state = false;
  #musicState = false;
  #mainContainer: HTMLDivElement;
  #menuContainer: HTMLDivElement;
  #mainHeadingElement: HTMLHeadingElement;
  #submenus: Menu[] = [];
  constructor(id: string, name: string, musicState: boolean) {
    this.#id = id;
    this.#name = name;
    this.#musicState = musicState;
    this.#mainContainer = this.addMainContainer();
    this.#menuContainer = this.addMenuContainer();
    this.#mainHeadingElement = this.addMainHeadingElement();
    MENU_BUTTONS.forEach((button) => {
      this.createActionButton(button.text, button.id, button.callback);
    });
  }

  get musicState() {
    return this.#musicState;
  }
  get state() {
    return this.#state;
  }
  get id() {
    return this.#id;
  }
  get name() {
    return this.#name;
  }

  setMusicState(state: boolean) {
    this.#musicState = state;
  }
  toggleMusicState() {
    this.#musicState = !this.#musicState;
  }

  toggle(message: string, buttons: string[] = MENU_BUTTONS.map((e) => e.id)) {
    if (this.#state) this.close();
    else this.open(message, buttons);
  }
  open(message: string, buttons: string[]) {
    this.#mainHeadingElement.innerText = message;
    Array.from(
      this.#menuContainer.children as HTMLCollectionOf<HTMLElement>
    ).forEach((e) => {
      if (e.tagName === "BUTTON" && buttons.includes(e.id)) {
        e.style.display = "block";
      } else if (e.tagName === "BUTTON") {
        e.style.display = "none";
      }
    });
    this.#mainContainer.style.display = "flex";
    this.#state = true;
  }
  close() {
    this.#mainContainer.style.display = "none";
    this.#state = false;
  }

  addMainContainer() {
    const divContainer = document.createElement("div");
    divContainer.id = "menu";
    divContainer.style.position = "absolute";
    divContainer.style.top = "0px";
    divContainer.style.left = "0px";
    divContainer.style.width = "100%";
    divContainer.style.height = "100%";
    divContainer.style.backgroundColor = "rgba(0,0,0,0.5)";
    divContainer.style.display = "block";
    divContainer.style.justifyContent = "center";
    divContainer.style.alignItems = "center";
    divContainer.style.zIndex = "1000";
    document.body.appendChild(divContainer);
    this.#mainContainer = divContainer;
    return divContainer;
  }
  addMenuContainer() {
    const div = document.createElement("div");
    div.style.margin = "10px";
    div.style.padding = "10px";
    div.style.backgroundColor = "white";
    div.style.borderRadius = "10px";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.justifyContent = "center";
    div.style.alignItems = "center";
    this.#mainContainer.appendChild(div);
    this.#menuContainer = div;
    return div;
  }
  addMainHeadingElement() {
    const h1 = document.createElement("h1");
    h1.style.padding = "10px";
    h1.style.margin = "10px";
    h1.innerText = "Game Paused";
    this.#menuContainer.appendChild(h1);
    this.#mainHeadingElement = h1;
    return h1;
  }
  createActionButton(
    text: string,
    id: string,
    callback: (menu: Menu) => void
  ): void {
    const button = document.createElement("button");
    button.innerText = text;
    button.id = id;
    button.style.margin = "10px";
    button.style.padding = "10px";
    button.style.borderRadius = "10px";
    button.style.backgroundColor = "green";
    button.style.color = "white";
    button.style.fontSize = "20px";
    button.style.cursor = "pointer";
    this.addActionButton(button, callback);
  }
  addActionButton(
    button: HTMLButtonElement,
    callback: (menu: Menu) => void
  ): void {
    button.addEventListener("click", () => callback(this));
    this.#menuContainer.appendChild(button);
  }

  removeActionButton(id: string) {
    const button = Array.from(
      this.#menuContainer.children as HTMLCollectionOf<HTMLElement>
    ).filter((e) => e.id === id)[0];
    this.#menuContainer.removeChild(button);
  }

  addSubmenu(menu: Menu) {
    this.#submenus.push(menu);
    this.createActionButton(menu.name, menu.id, (menu: Menu) => {
      menu.toggle(menu.name);
    });
  }
  removeSubmenu(menuId: string) {
    this.#submenus = this.#submenus.filter((e) => e.id !== menuId);
    this.removeActionButton(menuId);
  }
}

export interface Text {
  value: string;
}

export interface Password {
  value: string;
}

export class Text {
  value: string;
  constructor(value: string) {
    this.value = value;
  }
}

export class Password {
  value: string;
  constructor(value: string) {
    this.value = value;
  }
}

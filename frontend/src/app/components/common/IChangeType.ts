export enum IChangeType {
  Added,
  Modified,
  Deleted,
  None,
}

export class ChangeTracker {
  changeType: IChangeType = IChangeType.None;
  label: string = '';
  context: string = '';

  constructor(changeType: IChangeType, label: string, context?: string) {
    this.changeType = changeType;
    this.label = label;
    this.context = context || '';
  }

  toPlainObject() {
    return {
      changeType: this.changeType,
      label: this.label,
      context: this.context,
    };
  }

  getDisplayLabel(): string {
    return this.context ? `${this.context}: ${this.label}` : this.label;
  }
}

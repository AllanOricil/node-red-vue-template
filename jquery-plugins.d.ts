import "jquery";

declare module "jquery" {
  interface JQuery {
    typedInput(options: any): JQuery;
    typedInput(method: string, ...args: any[]): any;
    editableList(options: any): JQuery;
    editableList(method: string, ...args: any[]): any;
  }
}

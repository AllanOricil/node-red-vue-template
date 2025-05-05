// global.d.ts
import "jquery";

// Declare global variables
declare const RED: any;
declare const $: typeof import("jquery");

// Extend jQuery with Node-RED plugins
declare module "jquery" {
  interface JQuery {
    typedInput(options: any): JQuery;
    typedInput(method: string, ...args: any[]): any;

    editableList(options: any): JQuery;
    editableList(method: string, ...args: any[]): any;

    // Add other Node-RED plugin methods as needed
  }
}

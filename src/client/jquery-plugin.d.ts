// TODO: properly define jquery augumentations for Node-RED widgets
// NOTE: the following line is a way to augument global jquery types.

/// <reference types="jquery" />

interface JQuery {
  typedInput(options: any): JQuery;
  typedInput(method: string, ...args: any[]): any;
}

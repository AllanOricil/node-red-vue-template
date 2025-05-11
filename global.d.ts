// TODO: change this by the official editor and runtime node-red types
// NOTE: I wrote the minimum definitions to allow tsc to transpile the code with no errors
declare const RED: {
  nodes: {
    registerType: (type: string, def: any) => void;
    node: (id: string) => {
      _def: { category: string };
      users: { id: string }[];
    };
    dirty: () => boolean;
  };
};
declare const $: typeof import("jquery");

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
  editor: {
    createEditor: (id: string, mode: string, value?: string) => void;
    prepareConfigNodeSelect: (
      obj: Record<any, any>,
      value?: string,
      type: number,
      prefix: string
    ) => void;
  };
};
declare const $: typeof import("jquery");

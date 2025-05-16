// TODO: change this by the official editor and runtime node-red types
// TODO: have server and client definitions separately
// NOTE: I wrote the minimum definitions to allow tsc to transpile the code with no errors
declare const RED: {
  nodes: {
    registerType: (type: string, def: any) => void;
    node: (id: string) => {
      _def: { category: string };
      // TODO: this must be an array of node definitions
      users: any[];
    };
    dirty: () => boolean;
  };
  editor: {
    createEditor: (id: string, mode: string, value: string) => void;
    prepareConfigNodeSelect: (
      obj: Record<any, any>,
      value: string,
      type: number,
      prefix: string
    ) => void;
  };
};

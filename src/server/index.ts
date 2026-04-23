import YourNode from "./nodes/your-node";
import RemoteServerConfigNode from "./nodes/remote-server";
import AutoWiredNode from "./nodes/auto-wired-node";
import DynamicOutputs from "./nodes/dynamic-outputs";
import Splitter from "./nodes/splitter";

export default {
  nodes: [
    YourNode,
    RemoteServerConfigNode,
    AutoWiredNode,
    DynamicOutputs,
    Splitter,
  ],
};

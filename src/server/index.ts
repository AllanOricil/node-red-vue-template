import { defineModule } from "@bonsae/nrg/server";
import YourNode from "./nodes/your-node";
import RemoteServerConfigNode from "./nodes/remote-server";
import AutoWiredNode from "./nodes/auto-wired-node";
import DynamicOutputs from "./nodes/dynamic-outputs";
import Splitter from "./nodes/splitter";
import HttpRequest from "./nodes/http-request";
import MyBroker from "./nodes/my-broker";
import MySubscriber from "./nodes/my-subscriber";

export default defineModule({
  nodes: [
    YourNode,
    RemoteServerConfigNode,
    AutoWiredNode,
    DynamicOutputs,
    Splitter,
    HttpRequest,
    MyBroker,
    MySubscriber,
  ],
});

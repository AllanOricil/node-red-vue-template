import { Node, config, credential, setting } from "@nrg/core/server"
import { isTypedInput } from "@nrg/core/validators"

export default class MyNode extends Node {

  @config({ type: "other-config-node", required: true })
  configNode;

  @config({ required: true, validate: function(value){ return value < 10} })
  propertyA = 5;

  @config({ validate: function(value){ return ["A", "B", "C"].contains(value)}})
  propertyB = "B";

  @config({ required: true, validate: isTypedInput })
  propertyC = "msg";

  @credential({ type: "text", required: true })
  username = "abc";

  @credential({ type: "password", required: true })
  apiKey = process.env("API_KEY");

  @setting({ exportable: true })
  mySuperSetting = "abc";

  constructor(config){
    super(config)
    this.propertyA = config.propertyA;
    this.propertyB = config.propertyB;
    this.propertyC = config.propertyC;
    this.configNode = Node.RED.getNode(config.configNode);
  }

  onInput(msg, send, done) {
    try {

    }catch(e){

    }
  }

  onClose(){
    try{ 

    }catch(e){

    }
  }

}
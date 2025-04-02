module.exports = function (RED) {
  function RemoteServerNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.host = config.host;
  }
  RED.nodes.registerType("remote-server", RemoteServerNode);
};

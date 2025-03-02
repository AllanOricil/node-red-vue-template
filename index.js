module.exports = function (RED) {
  function YourNode(config) {
    RED.nodes.createNode(this, config);
    this.myProperty = config.myProperty || "";
    this.myPropertyType = config.myPropertyType || "msg";
    const node = this;

    async function evaluateProperty(value, type, msg) {
      return new Promise((resolve, reject) => {
        RED.util.evaluateNodeProperty(value, type, node, msg, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
    }

    node.on("input", async function (msg, send, done) {
      try {
        const value = await evaluateProperty(
          node.myProperty,
          node.myPropertyType,
          msg
        );

        msg.payload = value;
        send(msg);
        if (done) done();
      } catch (error) {
        node.error(`Failed to evaluate property: ${error.message}`, msg);
        if (done) done(error);
      }
    });
  }

  RED.nodes.registerType("your-node", YourNode);
};

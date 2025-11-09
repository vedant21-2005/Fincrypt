const path = require("path");

module.exports = {
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    development: {
      host: "127.0.0.1",      // Match Ganache RPC Host
      network_id: "1337",     // Must match Ganache network ID (from your screenshot)
      port: 7545,
      // network_id: "*",
      // host: "127.0.0.1",
      port: 7545,
      gas: 6721975,
      gasPrice: 20000000000,
    },
  },
  compilers: {
    solc: {
      version: "0.5.16",      // Your contract version
    },
  },
};

// Example Configuration File
// Make sure to configure the options below before renaming it
// to config.js!
//
// The client key for the bot to connect and authorize
let clientKey = '<keygoeshere>';
// Name of the server to operate on
let guildName = "Server Name";
// The prefix symbol (or word) to use before commands.
let prefix = ".";
// Name of the channel that the bot will announce to for live streams.
let streamChannel = "streams";
// For development purposes. Includes extra verbose logging.
let debug = false;
// Don't touch unless you know what you're doing!
let streamerFile = './config/streamers.json';
// Don't touch unless you know what you're doing!
let refreshRate = 30000;
module.exports = {clientKey, guildName, prefix, streamChannel, debug, streamerFile, refreshRate};

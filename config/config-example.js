// Example Configuration File
// Make sure to configure the options below before renaming it
// to config.js!
//
// The client key for the bot to connect and authorize
let clientKey = 'YOUR CLIENT KEY HERE';
// The roles for permissions
let permRoles = ['Admin', 'Moderator'];
// Name of the server to operate on
let guildName = "My Server Name";
// The prefix symbol (or word) to use before commands.
let cmdPrefix = "!";
// Name of the channel that the bot will announce to for live streams.
let announceChannel = "streams";
// Name of the channel the bot operates on. Set it to "" for all channels.
let activeChannel = "";
// For development purposes. Includes extra verbose logging.
let debug = false;
// Don't touch unless you know what you're doing!
let configFile = './config/streamers.json';
// Don't touch unless you know what you're doing!
let refreshRate = 25000;
module.exports = {clientKey, guildName, cmdPrefix, announceChannel, activeChannel, permRoles, debug, configFile, refreshRate};

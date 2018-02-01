global.__basedir = __dirname;
global.__strings = require(__basedir + '/strings.js');

const Discord = require("discord.js");
const client = new Discord.Client();
const config = require(__basedir + '/config/config.js');
const jsonfile = require('jsonfile');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  configCheck();
});
client.on('message', message => {
  if (message.author.bot) return;
  if (message.content.indexOf(config.prefix) !== 0) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  const prefix = config.prefix;

  // Start of commands
  if (command == "adduser") {
    var adduser = require(__basedir + '/commands/adduser.js');
    adduser.exec(client, message, args);
  }
  if (command == "deluser") {
    var deluser = require(__basedir + '/commands/deluser.js');
    deluser.exec(client, message, args);
  }
  if (command == "info") {
    var info = require(__basedir + '/commands/info.js');
    info.exec(client, message, args);
  }
  return;
});

function configCheck() {
  jsonfile.readFile(config.streamerFile, function(err) {
    if (err) {
      console.log(`Couldn't locate the streamer storage file. Setting it up for the first time...`);
      var arr = [];
      jsonfile.writeFile(config.streamerFile, arr, function(err) {
        if (err) {
          console.log(`FATAL ERROR: Unable to create streamer storage file: ${err}`);
          process.exit(1);
        }
        return console.log(`Streamer storage file successfully generated.`);
      });
    }
    return console.log(`Streamer storage file found.`);
  });
}
client.login(config.clientKey);

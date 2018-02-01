const Discord = require("discord.js");
const Client = new Discord.Client();
const Settings = require('./config/config.js');
const Request = require('request');
const JsonFile = require('jsonfile');

let GlobalScheduler;
let Guild;
let Channel;
let StreamUsers = [];
let AlreadyLive = [];
let roles = [];

function StartScheduler() {
  GlobalScheduler = setInterval(function() {
      if (Settings.debug) console.log(`Processing all user information...`);
      for (var i = 0; i < StreamUsers.length; i++) {
        let user = StreamUsers[i];
        if (Settings.debug) console.log(`Processing information for ${user.username}`);
        let userOnline = false;
        Request(`https://api.picarto.tv/v1/channel/name/${user.username}`, function(err, resp, body) {
          var data = JSON.parse(body);
          if (data.online) userOnline = true;
          // User started streaming
          if (userOnline) {
            var found = AlreadyLive.filter(function(val) {
              return val.username.toLowerCase() === user.username.toLowerCase();
            });
            if (AlreadyLive.length == 0) found = false;
            if (!found) {
              Channel.send(`${user.username} just went live on Picarto.tv! Watch now: https://picarto.tv/${user.username}`);
              AlreadyLive.push(user);
            }
          }
          // User stopped streaming
          else {
            var found = AlreadyLive.filter(function(val) {
              return val.username.toLowerCase() === user.username.toLowerCase();
            });
            if (AlreadyLive.length == 0) found = false;
            if (found) {
              AlreadyLive = AlreadyLive.filter(function(val){return val.username.toLowerCase() != user.username.toLowerCase();});
              Channel.send(`${user.username} just stopped streaming.`);
            }
          }
        });
      }
      if (Settings.debug) console.log(`All user information processed.`);
  }, Settings.refreshRate);
}


Client.on('ready', () => {
  console.log(`Logged in as ${Client.user.tag}!`);
  loadConfig();
});
Client.on('message', message => {
  if (message.channel.name.toLowerCase() != Settings.activeChannel && Settings.activeChannel != "") return;
  if (message.author === Client.user) return;
  //if (Settings.debug) console.log(`[DEBUG] '${message.author.tag}' said '${message.content}' in '${message.channel.name}'`);
  let content = message.content.split(" ");
  //if (Settings.debug) console.log(`[DEBUG] The length of the message is ${content.length}`);
  // Start of commands
  if (content[0] == Settings.cmdPrefix + "adduser") {
    if (!hasPermission(message.member)) return message.channel.send("Error - You do not have permission to use this command.");
    if (content.length < 2) return message.channel.send("Error - Invalid command syntax.");
    var found = StreamUsers.filter(function(val) {
      return val.username.toLowerCase() === content[1].toLowerCase();
    });
    if (StreamUsers.length == 0) found = false;
    if (found) return message.channel.send(`Error - ${content[1]} was already found in the auto-announcements list.`);
    Request(`https://api.picarto.tv/v1/channel/name/${content[1]}`, function(err, resp, body) {
      if (body != "Account does not exist" && !err) {
        var data = JSON.parse(body);
        StreamUsers.push({"username":data.username});
        var file = Settings.configFile;
        JsonFile.writeFile(file, StreamUsers, function (err) {
          if (err) return message.channel.send(`Error - ${err}`);
          message.channel.send(`Added ${data.username} to the list of auto-announcements for streams going live.`);
        });
      }
      else
        return message.channel.send("Error - User does not exist.");
    });
  }
  //TODO: deluser
  if (content[0] == Settings.cmdPrefix + "deluser") {
    if (!hasPermission(message.member)) return message.channel.send("Error - You do not have permission to use this command.");
    if (content.length < 2) return message.channel.send("Error - Invalid command syntax.");
    var found = StreamUsers.filter(function(val) {
      return val.username.toLowerCase() == content[1].toLowerCase();
    });
    if (!found) return message.channel.send(`${content[1]} was not found in the auto-announcements list.`);
    var arr = StreamUsers.filter(function(val){return val.username.toLowerCase() != content[1].toLowerCase()});
    StreamUsers = arr;
    message.channel.send(`Removed ${content[1]} from the auto-announcements list.`);
    var file = Settings.configFile;
    JsonFile.writeFile(file, StreamUsers,function(err) {
      if (err) {
        message.channel.send("Error - Could not save to configuration file. Please report this to the administrator.");
        console.log(`Error - ${err}`);
      }
    });
  }
  if (content[0] == Settings.cmdPrefix + "lookup") {
    if (content.length < 2) {
      message.channel.send("Error - Invalid command syntax.");
      return;
    }
    Request(`https://api.picarto.tv/v1/channel/name/${content[1]}`, function(err, resp, body) {
      if (err)
        return message.channel.send(`Error: ${error}`);
        if (body == "Account does not exist")
          return message.channel.send(`Error - User does not exist.`);
      var data = JSON.parse(body);
      var embed = new Discord.RichEmbed()
        .setTitle(`https://picarto.tv/${data.name}`)
        .setImage(data.thumbnails.web_large)
        .setAuthor(data.name)
        .setThumbnail(data.avatar)
        .setColor((data.online) ? [0,255,0] : [255,0,0])
        .setDescription(data.title)
        .addField("Live", (data.online) ? "Yes" : "No");
      if (data.online)
        embed.addField("Current Viewers", data.viewers);
      embed.addField("Lifetime Views", data.viewers_total)
        .addField("Followers", data.followers);
      if (data.subscribers > 0)
        embed.addField("Subscribers", data.subscribers);
      embed.addField("Commissions", (data.commissions) ? "Yes" : "No")
        .addField("Category", data.category)
        .addField("Tags", data.tags.join(", "));
      message.channel.send(embed);
    });
  }
});
function hasPermission(user) {
  for (var i = 0, len = roles.length; i < len; i++) {
    if (user.roles.has(roles[i].id))
      return true;
  }
  return false;
}
function loadConfig() {
  console.log("Loading auto-announcement file...");
  var file = Settings.configFile;
  JsonFile.readFile(file, function(err, obj) {
    if (err){
      console.log(`There was an error loading the configuration file. It may not yet exist.`);
      if (Settings.debug) console.log(`[DEBUG] Detailed error information - ${err}`);
    }
    else {
      StreamUsers = obj;
      console.log("Auto-announcement file loaded successfully.");
      StartScheduler();
    }
  });
  console.log("Setting up server roles...");
  Guild = Client.guilds.find("name", Settings.guildName);
  if (!Guild) { console.log("Error - Guild not found. Please double check the name of it in config.js"); process.exit(); }
  Channel = Guild.channels.find("name", Settings.announceChannel);
  if (!Channel) { console.log("Error - Main channel not found. Please double check the name of it in config.js"); process.exit(); }
  for (var i = 0; i < Settings.permRoles.length; i++) {
    let role = Guild.roles.find("name", Settings.permRoles[i]);
    if (role) {
      roles.push(role);
      console.log(`Found role '${role.name}' - Added to permission role database.`);
    }
    else
      console.log(`Skipping role '${Settings.permRoles[i]}' - The role was not found in the server's roles.`);
  }
  console.log("All server permission roles set up succesfully!");
}
Client.login(Settings.clientKey);

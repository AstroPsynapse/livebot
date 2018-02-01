const request = require('request');
const jsonfile = require('jsonfile');
const config = require(__basedir + '/config/config.js');

module.exports = {
  info: "Deletes a streamer to the auto-announcements list.",
  exec: function(client, message, args) {
    if (args.length == 0) return message.channel.send(__strings.commandSyntaxError);
    jsonfile.readFile(config.streamerFile, function(err, obj) {
      if (err) return message.channel.send(__strings.readError);
      else {
        var found = false;
        if (obj.length > 0) found = obj.filter(function(val) {return val.name.toLowerCase() == args[0].toLowerCase();});
        if (!found) return message.channel.send(`**${args[0]}** was not found on the auto-announcements list.`);
        var arr = obj.filter(function(val){return val.name.toLowerCase() != args[0].toLowerCase();});
        jsonfile.writeFile(config.streamerFile, arr, function(err) {
          if (err) return message.channel.send(__strings.writeError);
        });
        message.channel.send(`**${args[0]}** was removed from the auto-announcements list.`);
      }
    });
  }
}

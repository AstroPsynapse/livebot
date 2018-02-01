const request = require('request');
const jsonfile = require('jsonfile');
const config = require(__basedir + '/config/config.js');


module.exports = {
  info: "Adds a streamer to the auto-announcements list.",
  exec: function(client, message, args) {
    if (args.length == 0) return message.channel.send(__strings.commandSyntaxError);
    request(`https://api.picarto.tv/v1/channel/name/${args[0]}`, function(err, resp, body) {
      if (err) return message.channel.send(`Error - ${err}`);
      if (body == "Account does not exist") return message.channel.send(`I couldn't find a user by the name of **${args[0]}**`);
      var json = JSON.parse(body);
      jsonfile.readFile(config.streamerFile, function(err, obj) {
        if (err) {
          return message.channel.send(__strings.readError);
        }
        else {
          var arr = obj;
          for (var i = 0; i < arr.length; i++) {
            if (arr[i].hasOwnProperty("name"))
              if (arr[i].name.toLowerCase() == args[0].toLowerCase())
                return message.channel.send(`**${args[0]}** is already on the auto-announcement list.`);
          }
          arr.push({"name":json.name});
          jsonfile.writeFile(config.streamerFile, arr, function(err) {
            if (err) return message.channel.send(__strings.writeError);
            return message.channel.send(`**${json.name}** was added to the auto-announcement list for streams going live.`);
          });
        }
      });
    });
  }
}

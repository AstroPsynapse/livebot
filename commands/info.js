const request = require('request');
const Discord = require("discord.js");

module.exports = {
  info: "Deletes a streamer to the auto-announcements list.",
  exec: function(client, message, args) {
    if (args.length == 0) return message.channel.send(__strings.commandSyntaxError);
    request(`https://api.picarto.tv/v1/channel/name/${args[0]}`, function(err, resp, body) {
      if (err) return message.channel.send(`Error: ${error}`);
      if (body == "Account does not exist") return message.channel.send(`I couldn't find a user by the name of **${args[0]}**`);
      var data = JSON.parse(body);
      var embed = new Discord.RichEmbed()
        .setDescription(`https://picarto.tv/${data.name}`)
        .setImage(data.thumbnails.web_large)
        .setAuthor(data.name + " - " + ((data.online) ? "Live Now" : "Offline"))
        .setThumbnail(data.avatar)
        .setColor((data.online) ? [0,255,0] : [255,0,0])
        .setTitle(data.title)
        .addBlankField(false)
        .addField("Category", data.category, true);
      if (data.online)
        embed.addField("Current Viewers", data.viewers, true);
      embed.addField("Lifetime Views", data.viewers_total, true)
        .addField("Followers", data.followers, true);
      if (data.subscribers > 0)
        embed.addField("Subscribers", data.subscribers, true);
      embed.addField("Commissions", (data.commissions) ? "Yes" : "No", true)
        .addField("Tags", (data.tags.length > 0) ? data.tags.join(", ") : "none")
      message.channel.send(embed);
    });
  }
}

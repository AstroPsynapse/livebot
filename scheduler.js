const jsonfile = require('jsonfile');
const request = require('request');
const config = require(__basedir + '/config/config.js');

module.exports = {
  exec: function(channel, timeout) {
    console.log(`Scheduler spawned with a refresh interval of ${timeout}ms`);
    function save(obj) {
      jsonfile.writeFile(config.streamerFile, obj, function(err) {
        if (err) {
          console.log(__strings.schedulerFatalError);
          process.exit();
        }
      });
    }
    return setInterval(function() {
      jsonfile.readFile(config.streamerFile, function(err, obj) {
        if (err) {
          console.log(__strings.schedulerFatalError);
          process.exit(1);
        }
        if (obj.length == 0) return console.log(__strings.noStreamersFoundError);
        var changed = false;
        var x = 0;
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].hasOwnProperty("name"))
            request(`https://api.picarto.tv/v1/channel/name/${obj[i].name}`, function(err, resp, body) {
              if (err) console.log(`Scheduler Error - Could not request from Picarto API for user ${obj[this.i].name}`);
              else {
                var data = JSON.parse(body);
                if (!obj[this.i].hasOwnProperty("live")) {
                  obj[this.i].live = false;
                }
                if (obj[this.i].live != data.online) {
                  changed = true;
                  obj[this.i].live = data.online;
                  if (obj[this.i].live == true)
                    channel.send(`${data.name} just went live on Picarto.tv! Watch live here: https://picarto.tv/${data.name}`);
                  else
                    channel.send(`${data.name} stopped streaming on Picarto.tv`);
                }
                x++;
                if (x == obj.length && changed)
                  save(obj);
              }
            }.bind({i: i}));
        }
      });
    }, config.refreshRate);
  }
};

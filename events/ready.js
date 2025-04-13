const { Events, ActivityType } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Ready! Bot is ready! Logged as ${client.user.tag}`);
    client.user.setActivity(" The outside world", {
      type: ActivityType.Watching,
    });
  },
};

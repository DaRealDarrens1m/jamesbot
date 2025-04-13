const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Gets the information of the bot"),
  async execute(interaction) {
    await interaction.reply("I am ready for commands! Send em' to me!");
  },
};

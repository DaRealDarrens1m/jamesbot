const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Gets user's balance"),
  async execute(interaction, profileData) {
    const { balance } = profileData;
    const username = interaction.user.id;

    await interaction.reply(
      `<@${username}> has ${balance} trash in their pocket`
    );
  },
};

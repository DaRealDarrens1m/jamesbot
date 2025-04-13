const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("@discordjs/builders");
const profileModel = require("../../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Shows the top 10 user that has the most coins"),
  async execute(interaction, profileData) {
    await interaction.deferReply();

    const { username, id } = interaction.user;
    const { balance } = profileData;

    let leaderboardEmbed = new EmbedBuilder()
      .setTitle("**Top 10 Trash Collector**")
      .setColor(0x45d6fd)
      .setFooter({ text: "You are not in the leaderboard!" });

    const members = await profileModel
      .find()
      .sort({ balance: -1 })
      .catch((err) => console.log(err));

    const memberIdx = members.findIndex((member) => member.userId === id);

    leaderboardEmbed.setFooter({
      text: `${username}, you are #${
        memberIdx + 1
      } on the leaderboard! You balance ${balance}`,
    });

    const topTen = members.slice(0, 10);

    let desc = "";
    for (let i = 0; i < topTen.length; i++) {
      let { user } = await interaction.guild.members.fetch(topTen[i].userId);
      if (!user) return;
      let userBalance = topTen[i].balance;
      desc += `**${i + 1}. ${username}:** has ${userBalance} Trash!\n`;
    }
    if (desc !== "") {
      leaderboardEmbed.setDescription(desc);
    }

    await interaction.editReply({ embeds: [leaderboardEmbed] });
  },
};

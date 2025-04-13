const { SlashCommandBuilder } = require("discord.js");
const { coinFlipReward } = require("../../globalValues.json");
const profileModel = require("../../models/profileSchema");
const parseMilliseconds = require("parse-ms-2");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Flips a coin! Could land on 'Head' or maybe 'Tails'?")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("How many you want to bet?")
        .setRequired(true)
        .setMinValue(1)
    )
    .addStringOption((option) =>
      option
        .setName("choice")
        .setDescription("Head or Tails?")
        .setRequired(true)
        .addChoices(
          { name: "Heads", value: "Heads" },
          { name: "Tails", value: "Tails" }
        )
    ),

  async execute(interaction, profileData) {
    const { id } = interaction.user;
    const { coinFlipLastUsed } = profileData;

    const cooldown = 300000;
    const timeLeft = cooldown - (Date.now() - coinFlipLastUsed);

    if (timeLeft > 0) {
      await interaction.deferReply({ ephemral: true });
      const { minutes, seconds } = parseMilliseconds(timeLeft);
      return await interaction.editReply(
        `Cooldown! You can use this in the next ${minutes} minutes and ${seconds} second!`
      );
    }

    await interaction.deferReply();

    await profileModel.findOneAndUpdate(
      {
        userId: id,
      },
      {
        $set: {
          coinFlipLastUsed: Date.now(),
        },
      }
    );

    const randomNum = Math.round(Math.random());
    const result = randomNum ? "Heads" : "Tails";
    const choice = interaction.options.getString("choice");
    const amount = interaction.options.getInteger("amount");
    const wonAmt = Math.floor(amount * coinFlipReward + 0);

    if (balance < amount) {
      await interaction.deferReply();
      return await interaction.editReply(
        `Hey brokie! You don't have ${amount} trash to coinflip!`
      );
    }

    if (choice === result) {
      await profileModel.findOneAndUpdate(
        {
          userId: id,
        },
        {
          $inc: {
            balance: wonAmt,
          },
        }
      );

      await interaction.editReply(
        `Winner! You won ${Math.floor(
          amount * coinFlipReward
        )} trash with **${choice}!**`
      );
    } else {
      await profileModel.findOneAndUpdate(
        {
          userId: id,
        },
        {
          $inc: {
            balance: -amount,
          },
        }
      );

      await interaction.editReply(
        `You lost ${amount} ! You picked **${choice}** but it was **${result}**!`
      );
    }
  },
};

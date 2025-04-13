const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const profileModel = require("../../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admins")
    .setDescription("Access to all the admin commands")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add coins to a user balance")
        .addUserOption((Option) =>
          Option.setName("user")
            .setDescription("The user that you want to add 'Trash' to")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("The amount that you want to add to the user")
            .setRequired(true)
            .setMinValue(1)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("removes coins to a user balance")
        .addUserOption((Option) =>
          Option.setName("user")
            .setDescription("The user that you want to remove 'Trash' to")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("The amount thhat you want to remove to the user")
            .setRequired(true)
            .setMinValue(1)
        )
    ),
  async execute(interaction, profileData) {
    const { balance } = profileData;
    const username = interaction.user.id;
    await interaction.deferReply();
    const adminSubCommand = interaction.options.getSubcommand();

    if (adminSubCommand === "add") {
      const user = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");

      await profileModel.findOneAndUpdate(
        {
          userId: user.id,
        },
        {
          $inc: {
            balance: amount,
          },
        }
      );

      await interaction.editReply(
        `Added ${amount} Trash to <@${
          user.id
        }>'s balance, They have ${Math.floor(amount + balance)} as of now!`
      );
    }
    if (adminSubCommand === "remove") {
      const user = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");

      await profileModel.findOneAndUpdate(
        {
          userId: user.id,
        },
        {
          $inc: {
            balance: -amount,
          },
        }
      );

      await interaction.editReply(
        `Removed ${amount} Trash to <@${
          user.id
        }>'s balance, They have ${Math.floor(balance - amount)} as of now!`
      );
    }
  },
};

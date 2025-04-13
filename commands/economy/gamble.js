const {
  SlashCommandBuilder,
  ButtonStyle,
  embedLength,
  Embed,
  Component,
} = require("discord.js");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("@discordjs/builders");
const profileModel = require("../../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gamble")
    .setDescription("Casino but online!")
    .addSubcommand((subcommands) =>
      subcommands
        .setName("three-doors-game")
        .setDescription(
          "Pick a door, any door, you could win? Lose half? or be broken!"
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription(
              "The amount that you want to gamble. Come on be a rice or a brokie!"
            )
            .setMaxValue(1500)
            .setMinValue(2)
            .setRequired(true)
        )
    ),
  async execute(interaction, profileData) {
    const { username, id } = interaction.user;
    const { balance } = profileData;

    const gambleCommand = interaction.options.getSubcommand();

    const gambleEmbed = new EmbedBuilder().setColor(0x00aa6d);

    if (gambleCommand === "three-doors-game") {
      const amount = interaction.options.getInteger("amount");

      if (balance < amount) {
        await interaction.deferReply();
        return await interaction.editReply(
          `Hey brokie! You don't have ${amount} trash to gamble!`
        );
      }

      await interaction.deferReply();

      const Button1 = new ButtonBuilder()
        .setCustomId("one")
        .setLabel("Door 1")
        .setStyle(ButtonStyle.Primary);

      const Button2 = new ButtonBuilder()
        .setCustomId("two")
        .setLabel("Door 2")
        .setStyle(ButtonStyle.Primary);

      const Button3 = new ButtonBuilder()
        .setCustomId("three")
        .setLabel("Door 3")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(
        Button1,
        Button2,
        Button3
      );

      gambleEmbed
        .setTitle(`Playing three doors with ${amount} trash!`)
        .setFooter({
          text: "One of these door have differnt rewards! they can be Double or Lose half or Be broke",
        });

      await interaction.editReply({ embeds: [gambleEmbed], components: [row] });

      const message = await interaction.fetchReply();

      const filter = (i) => i.user.id === interaction.user.id;

      const collector = message.createMessageComponentCollector({
        filter,
        time: 60000,
      });

      const double = "x2 Trash (double)";
      const half = "1/2 trash (half)";
      const lose = "x0 trash (none)";

      const getAmount = (lable, gamble) => {
        let amount = -gamble;
        if (lable === double) {
          amount = gamble;
        } else if (lable === half) {
          amount = -Math.round(gamble / 2);
        }
        return amount;
      };

      let choice = null;

      collector.on("collect", async (i) => {
        let options = [Button1, Button2, Button3];

        const randIdxDouble = Math.floor(Math.random() * 3);
        const doubleButton = options.splice(randIdxDouble, 1)[0];
        doubleButton.setLabel(double).setDisabled(true);

        const randIdxHalf = Math.floor(Math.random() * 2);
        const halfButton = options.splice(randIdxHalf, 1)[0];
        halfButton.setLabel(half).setDisabled(true);

        const zeroButton = options[0];
        zeroButton.setLabel(lose).setDisabled(true);

        Button1.setStyle(ButtonStyle.Secondary);
        Button2.setStyle(ButtonStyle.Secondary);
        Button3.setStyle(ButtonStyle.Secondary);

        if (i.customId === "one") choice = Button1;
        else if (i.customId === "two") choice = Button2;
        else if (i.customId === "three") choice = Button3;

        choice.setStyle(ButtonStyle.Success);

        const label = choice.data.label;
        const amtChange = getAmount(label, amount);

        await profileModel.findOneAndUpdate(
          {
            userId: id,
          },
          {
            $inc: {
              balance: amtChange,
            },
          }
        );

        if (label === double) {
          gambleEmbed
            .setTitle(`x2!! You just doubled your ${amount} trash!`)
            .setFooter({
              text: `${username} has doubled ${amtChange} of their trash`,
            });
        } else if (label === half) {
          gambleEmbed
            .setTitle(`1/2!! You just halfed your ${amount} trash!`)
            .setFooter({
              text: `${username} has halfed ${amtChange} of their trash`,
            });
        } else if (label === lose) {
          gambleEmbed
            .setTitle(`You lost!!! Your ${amount} trash has been removed!`)
            .setFooter({
              text: `${username} has lost ${amtChange} of their trash`,
            });
        }

        await i.update({ embeds: [gambleEmbed], components: [row] });
        collector.stop();
      });
    }
  },
};

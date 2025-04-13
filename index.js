const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");
const { token, mongoURL } = require("./config.json");

// require discord.js
const {
  Client,
  GatewayIntentBits,
  Collection,
  Message,
  Events,
} = require("discord.js");

// create instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

// Load files
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// load command files

client.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[Warning] the command @ ${filePath} is missing a required "data" or "execute" properly`
      );
    }
  }
}

client.on(Events.interactionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.command.get(interaction.commandName);

  if (!command) {
    console.error(`No command has match of ${interaction.name} was found`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There is an error while trying to run this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There is an error while trying to run this command!",
        ephemeral: true,
      });
    }
  }
});

async function serverConnect() {
  try {
    await mongoose.connect(mongoURL);
    console.log("Connected Successfully to DB!");
  } catch (err) {
    console.log(`Error connection to mongoDB ${err}`);
  }
}
serverConnect();

client.login(token);

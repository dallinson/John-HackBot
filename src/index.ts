/** @format */

// Require the necessary discord.js classes
import { Client, Intents, MessageEmbed, Snowflake, TextChannel, User } from "discord.js";
import { commands } from "./commands";
import * as dotenv from "dotenv";
import { database_tables, db } from "./database";
import cron from "node-cron";

dotenv.config();

// Create a new client instance
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// When the client is ready, run this code (only once)
client.once("ready", () => {
  db.sync();
  console.log("Ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.on("messageCreate", async (message) => {
  if (message.content == "2") {
    const [user, created] = await database_tables.twos.findOrCreate({
      where: { guild_id: message.guildId, user_id: message.author.id },
      defaults: { last_two_time: message.createdTimestamp, two_count: 0 },
    });
    if (!created && message.createdTimestamp - user.last_two_time < 600000) {
      // 600_000 ms is 10 minutes
      const rate_limit_embed = new MessageEmbed()
        .setColor("RED")
        .setTitle("Two rate limit")
        .setDescription(
          `${message.author} cannot be twoed again until <t:${
            Math.floor(user.last_two_time / 1000) + 600
          }:t>.`,
        );
      message.reply({
        embeds: [rate_limit_embed],
        allowedMentions: { repliedUser: false },
      });
    } else {
      const reply_embed = new MessageEmbed()
        .setColor("RED")
        .setTitle(`Oops!  2 detected!`)
        .setDescription(
          `${message.author} was 2'd!  Count: ${user.two_count + 1}`,
        );
      await database_tables.twos.update(
        {
          two_count: user.two_count + 1,
          last_two_time: message.createdTimestamp,
        },
        { where: { guild_id: message.guildId, user_id: message.author.id } },
      );
      message.reply({
        embeds: [reply_embed],
        allowedMentions: { repliedUser: false },
      });
    }
  } else if (
    message.author.id != client.user?.id &&
    message.content == "you know the drill"
  ) {
    message.channel.send("2");
  }
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);

cron.schedule("* * * * *", async () => {
  const curr_time = new Date(Date.now());
  curr_time.setMilliseconds(0);
  const reminders = await database_tables.channel_reminders.findAll({
    where: { reminder_time: curr_time.toISOString() },
  });
  reminders.forEach(async (reminder) => {
    const channel = client.channels.cache.get(reminder.channel_id);
    if (!(channel == undefined)) {
      const reminder_users = reminder.reminder_message
        .match(/<@!?[0-9]+>/g) ?? [];
      await (channel as TextChannel).send({
        embeds: [
          new MessageEmbed()
            .setTitle("Reminder")
            .setColor("GREEN")
            .setDescription(
              `Reminder from <@${reminder.creator_id}>:\n\n ${reminder.reminder_message}`,
            ),
        ],
        // embeds can never ping
      });
      if (reminder_users.length != 0) {
        await (channel as TextChannel).send(
          `Reminder mentions: ${reminder_users.join(" ")}`
        );
      }
    }
  });
  await database_tables.channel_reminders.update(
    { has_fired: true },
    { where: { reminder_time: curr_time.toISOString() } },
  );
});

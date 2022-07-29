/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { ChannelType } from "discord-api-types/v10";
import { database_tables } from "../database";
import * as reminders from "./reminders";
import * as chrono from "chrono-node";

const dateParser = chrono.casual.clone();
dateParser.refiners.push({
  refine: (context, results) => {
    results.forEach((result) => {
      if (result.start.isOnlyDate()) {
        result.start.assign("hour", 9);
        result.start.assign("minute", 0);
      }
      result.start.assign("second", 0);
      result.start.assign("millisecond", 0);
    });
    return results;
  },
});

const info = {
  name: "remind",
  aliases: [],
  usage: "",
  description: "Sets a reminder for the user",
};

export const metadata = new SlashCommandBuilder()
  .setName(info.name)
  .setDescription(info.description)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("channel")
      .setDescription("Send a reminder to a channel")
      .addChannelOption((option) =>
        option
          .setName("where")
          .setDescription("The channel to send the reminder to")
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("what")
          .setDescription(
            "What to send to the channel when the reminder is sent",
          )
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("when")
          .setDescription("When to send the reminder")
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("list").setDescription(reminders.metadata.description),
  );
/* .addSubcommand((subcommand) =>
    subcommand
      .setName("user")
      .setDescription("Send a reminder to a user")
      .addUserOption((option) =>
        option
          .setName("who")
          .setDescription("The channel to send the reminder to")
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("what")
          .setDescription(
            "What to send to the channel when the reminder is sent",
          )
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("when")
          .setDescription("When to send the reminder")
          .setRequired(true),
      ),
  )*/

export async function execute(interaction: CommandInteraction) {
  if (interaction.options.getSubcommand() == "channel") {
    await handle_channel_reminder(interaction);
  } else if (interaction.options.getSubcommand() == "list") {
    await reminders.execute(interaction);
  }
}

async function handle_channel_reminder(interaction: CommandInteraction) {
  const channel = interaction.options.getChannel("where", true);
  const channel_id = channel.id;
  const reminder_text = interaction.options.getString("what", true);
  const reminder_time = dateParser.parseDate(
    interaction.options.getString("when", true),
  );
  if (interaction.inCachedGuild()) {
    const guildChannel = interaction.options.getChannel("where", true);
    if (!guildChannel.permissionsFor(interaction.user)?.has("SEND_MESSAGES") && !guildChannel.permissionsFor(interaction.user)?.has("VIEW_CHANNEL")) {
      await interaction.reply({ content: "you do not have permission for this channel", ephemeral: true });
      return;
    }
  }
  if (reminder_time == null) {
    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle("Could not create reminder")
          .setDescription(
            `The reminder time '${interaction.options.getString(
              "when",
              true,
            )}' could not be parsed.`,
          )
          .setColor("RED"),
      ],
      ephemeral: true,
    });
    return;
  } else if (new Date(Date.now()) > reminder_time) {
    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle("Could not create reminder")
          .setDescription(
            `The reminder time '${interaction.options.getString(
              "when",
              true,
            )}' is in the past.`,
          )
          .setColor("RED"),
      ],
      ephemeral: true,
    });
    return;
  }
  const guild_id = interaction.guildId;
  await database_tables.channel_reminders.create({
    guild_id: guild_id,
    channel_id: channel_id,
    reminder_message: reminder_text,
    reminder_time: reminder_time?.toISOString(),
    creator_id: interaction.user.id,
    has_fired: false,
  });
  const timestamp = Math.floor(reminder_time.getTime() / 1000);
  await interaction.reply({
    embeds: [
      new MessageEmbed()
        .setColor("GREEN")
        .setTitle("Reminder created")
        .setDescription(
          `I will remind <#${channel_id}> "${reminder_text}" <t:${timestamp}:R> at <t:${timestamp}>`,
        ),
    ],
    ephemeral: false,
  });
}

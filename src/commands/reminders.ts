import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { database_tables } from "../database";


const info = {
  name: "reminders",
  aliases: [],
  usage: "",
  description: "Gets the user's reminders",
};

export const metadata = new SlashCommandBuilder()
  .setName(info.name)
  .setDescription(info.description);

export async function execute(interaction: CommandInteraction) {
  const reminders = await database_tables.channel_reminders.findAll({ where: { creator_id: interaction.user.id, has_fired: false } });
  let msg_txt = "";
  reminders.forEach(reminder => {
    msg_txt += `${reminder.reminder_time} ${reminder.reminder_message}\n`;
  });
  if (msg_txt.length == 0) {
    msg_txt = "No reminders found";
  }
  interaction.reply({ ephemeral: true, content: msg_txt });
}

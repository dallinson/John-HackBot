import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { database_tables } from "../database";

const info = {
  name: "twoboard",
  aliases: [],
  usage: "",
  description: "The current twoing leaderboard",
};

export const metadata = new SlashCommandBuilder()
  .setName(info.name)
  .setDescription(info.description)
  .addBooleanOption(option =>
    option.setName("hidden")
      .setDescription("Should show the leaderboard to the channel"),
  );

export async function execute(interaction: CommandInteraction) {
  const twoed_users = await database_tables.twos.findAll({ where: { guild_id: interaction.guild?.id }, order: [['two_count', 'DESC']] });
  const two_user_ids = twoed_users.map(user => user.user_id);
  const contains_user_id = two_user_ids.includes(interaction.user.id);
  let two_string = '';
  for (let i = 0; i < Math.min(twoed_users.length, 10); i++) {
    two_string += `<@${twoed_users[i].user_id}>:   \` ${twoed_users[i].two_count} \`\n`;
  }
  const leaderboard_embed = new MessageEmbed()
    .setTitle("Twoing Leaderboard")
    .setDescription(two_string);
  interaction.reply({ embeds: [leaderboard_embed], allowedMentions: { users: [] }, ephemeral: interaction.options.getBoolean("hidden") ?? false });
}

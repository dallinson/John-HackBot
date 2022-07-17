import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

const info = {
  name: "ping",
  aliases: [],
  usage: "",
  description: "Replies to the user to confirm the bot is running correctly",
};

export const metadata = new SlashCommandBuilder()
  .setName(info.name)
  .setDescription(info.description);

export async function execute(interaction: CommandInteraction) {
  await interaction.reply(":ping_pong: Pong!");
}

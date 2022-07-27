/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord-api-types/v9";
import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";

const info = {
  name: "createrole",
  aliases: [],
  usage: "",
  description: "Creates a button so the user can assign themselves a role",
};

export const metadata = new SlashCommandBuilder()
  .setName(info.name)
  .setDescription(info.description)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addRoleOption((option) =>
    option
      .setName("role")
      .setDescription("The role to create a button for")
      .setRequired(true),
  );

export async function execute(interaction: CommandInteraction) {
  const role = interaction.options.getRole("role", true);
  await interaction.channel?.send({
    embeds: [
      new MessageEmbed()
        .setTitle(role.name)
        .setDescription(`Get the ${role.name} role.`),
    ],
    components: [
      new MessageActionRow().addComponents(
        new MessageButton()
          .setLabel(role.name)
          .setStyle("PRIMARY")
          .setCustomId(`{"kind": "give-role", "role": "${role.id}"}`),
      ),
    ],
  });
  await interaction.reply({
    content: "Successfully created button",
    ephemeral: true,
  });
}

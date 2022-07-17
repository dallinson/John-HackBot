import * as dotenv from "dotenv";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

import { registry } from "./commands";

dotenv.config();

const commands = registry.map((command) => command.metadata.toJSON());

const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN ?? '');

rest
  .put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID ?? '',
      process.env.GUILD_ID ?? '',
    ),
    { body: commands },
  )
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);

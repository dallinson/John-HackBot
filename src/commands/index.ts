import { Collection } from "discord.js";

import * as ping from "./ping";
import * as twoboard from "./twoboard";
import * as remind from "./remind";
import * as get_reminders from "./reminders";
import * as sharks from "./sharks";

export const registry = [ping, twoboard, remind, get_reminders, sharks];

export const commands = new Collection(
  registry.map((command) => [command.metadata.name, command]),
);

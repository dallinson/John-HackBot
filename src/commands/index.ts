import { Collection } from "discord.js";

import * as ping from "./ping";
import * as twoboard from "./twoboard";
import * as remind from "./remind";
import * as get_reminders from "./reminders";
import * as sharks from "./sharks";
import * as create_role from "./create_role"

export const registry = [ping, twoboard, remind, get_reminders, sharks, create_role];

export const commands = new Collection(
  registry.map((command) => [command.metadata.name, command]),
);

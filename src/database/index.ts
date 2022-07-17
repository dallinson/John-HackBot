import { Sequelize } from 'sequelize';
import * as dotenv from "dotenv";

dotenv.config();

export const db = new Sequelize(process.env.DB_URI ?? '');

import { Twos } from './twos';
import { ChannelReminders } from './channel_reminder';
export const database_tables = { twos: Twos, channel_reminders: ChannelReminders };

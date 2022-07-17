import { Model, DataTypes } from "sequelize";
import { db } from ".";

export class ChannelReminders extends Model {
  declare id: number;
  declare guild_id: string;
  declare channel_id: string;
  declare reminder_message: string;
  declare reminder_time: string;
  declare has_fired: boolean;
  declare creator_id: string;
}

ChannelReminders.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    guild_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    channel_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reminder_message: {
      type: DataTypes.TEXT,
      defaultValue: 1,
      allowNull: false,
    },
    reminder_time: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    has_fired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    creator_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    tableName: "channel_reminders",
  },
);
import { Model, DataTypes } from "sequelize";
import { db } from ".";


export class Twos extends Model {
  declare id: number;
  declare guild_id: string;
  declare user_id: string;
  declare two_count: number;
  declare last_two_time: number;
}

Twos.init(
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
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    two_count: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    last_two_time: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: "twos",
  },
);
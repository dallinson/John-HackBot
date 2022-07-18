/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import { ColorResolvable, CommandInteraction, MessageEmbed } from "discord.js";
import store_info from "./shark_stores.json";
import axios from "axios";

const info = {
  name: "sharks",
  aliases: [],
  usage: "",
  description: "Locates and gives a stock count for BLAHAJ",
};

export const metadata = new SlashCommandBuilder()
  .setName(info.name)
  .setDescription(info.description);

export async function execute(interaction: CommandInteraction) {
  axios
    .get(
      "https://api.ingka.ikea.com/cia/availabilities/ru/gb?itemNos=30373588&expand=StoresList,Restocks,SalesLocations",
      {
        headers: {
          Accept: "application/json;version=2",
          "X-Client-ID": "b6c117e5-ae61-4ef5-b4cc-e0b1e37f0631",
        },
      },
    )
    .then((response) => {
      return response.data;
    })
    .then(
      (data: {
        availabilities: {
          availableForCashCarry: boolean;
          buyingOption: {
            cashCarry: {
              availability: {
                probability: {
                  thisDay: {
                    colour: { rgbDec: string; rgbHex: string; token: string };
                    messageType: string;
                  };
                  updateDateTime: string;
                };
                quantity: number;
                updateDateTime: string;
              };
              range: { inRange: boolean };
              unitOfMeasure: string;
            };
            homeDelivery: { range: { inRange: boolean } };
          };
          classUnitKey: { classUnitCode: string; classUnitType: string };
          exceptions: { longTermSupplyIssue: boolean };
          itemKey: { itemNo: string; itemType: string };
        }[];
      }) => {
        const sharks = data.availabilities
          .map((element) => {
            const store_id = element.classUnitKey.classUnitCode;
            const store_name = store_info.find(
              (elem) => elem.value == store_id,
            )?.name;
            if (store_name == undefined) {
              return null;
            }
            const availability_info =
              element.buyingOption.cashCarry.availability;
            const quantity = availability_info.quantity;
            return { store: store_name, quantity: quantity };
          })
          .filter((elem) => elem != null)
          .sort((a, b) => a!.quantity - b!.quantity)
          .reverse();
        let shark_colour = "LUMINOUS_VIVID_PINK" as ColorResolvable;
        if (sharks[sharks.length - 1]?.quantity == 0) {
          if (sharks[0]?.quantity == 0) {
            shark_colour = "RED";
          } else {
            shark_colour = "YELLOW";
          }
        } else {
          shark_colour = "GREEN";
        }
        interaction.reply({
          embeds: [
            new MessageEmbed()
              .setTitle("BLAHAJ stock")
              .setColor(shark_colour)
              .setDescription(
                sharks
                  .map((elem) => `${elem?.store}: \` ${elem?.quantity} \``)
                  .join("\n"),
              ),
          ],
        });
      },
    );
}

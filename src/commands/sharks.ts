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

type validShark = {
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
  }

export const metadata = new SlashCommandBuilder()
  .setName(info.name)
  .setDescription(info.description)
  .addStringOption((option) =>
    option
      .setRequired(false)
      .setName("size")
      .setDescription(
        "Whether to get the stock for 100cm Blahaj (Blahaj) or 55cm Blahaj (Smolhaj)",
      )
      .addChoices(
        { name: "Blahaj", value: "30373588" },
        { name: "Smolhaj", value: "20540663" },
      ),
  )
  .addStringOption((option) =>
    option
      .setName("stores")
      .setDescription("Only show stores where the BLAHAJ is in stock")
      .addChoices(
        {name: "All stores", value: "all"},
        {name: "In stock only", value: "in-stock" },
      ),
  )
  .addBooleanOption(option =>
    option.setName("hidden")
      .setDescription("Should show the shark info to the channel")
  );

export async function execute(interaction: CommandInteraction) {
  axios
    .get(
      "https://api.ingka.ikea.com/cia/availabilities/ru/gb?itemNos=" +
        (interaction.options.getString("size", false) ?? "30373588") +
        "&expand=StoresList,Restocks,SalesLocations",
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
        availabilities: any[];
      }) => {
        let valid_sharks = [];
        for (var elem of data.availabilities) {
          if (isValidShark(elem)) {
            valid_sharks.push(elem);
          }
        }
        let sharks = (
          valid_sharks
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
            .filter((elem) => elem != null) as {
            store: string;
            quantity: number;
          }[]
        )
          .sort((a, b) => a.quantity - b.quantity)
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
        if (interaction.options.getString("stores", false) === "in-stock") {
          sharks = sharks.filter((elem) => elem.quantity != 0);
        }
        const isBlahaj = (interaction.options.getString("size", false) ?? "30373588") === "30373588";
        interaction.reply({
          embeds: [
            new MessageEmbed()
              .setTitle((isBlahaj ? "Blahaj" : "Smolhaj") + " stock")
              .setColor(shark_colour)
              .setDescription(
                sharks
                  .map((elem) => `${elem?.store}: \` ${elem?.quantity} \``)
                  .join("\n"),
              ),
          ],
          ephemeral: interaction.options.getBoolean("hidden", false) ?? true,
        });
      },
    );
}

function isValidShark(x: any): x is validShark {
  return (x as validShark).buyingOption.cashCarry !== undefined && (x as validShark).buyingOption.cashCarry.availability !== undefined;
}
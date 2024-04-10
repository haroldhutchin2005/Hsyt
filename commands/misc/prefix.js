const { EmbedBuilder } = require("discord.js");
const { prefix } = require("./../../config.json");

/**
 * @type {import('../../typings').LegacyCommand}
 */
module.exports = {
    name: "prefix",
    description: "Get the current bot prefix",
    aliases: [],
    usage: "",
    cooldown: 3,

    async execute(message) {
        const embed = new EmbedBuilder()
            .setColor("#3498DB") // Dodger Blue
            .setDescription(`This is my currently set prefix: \`${prefix}\``);

        message.channel.send({ embeds: [embed] });
    },

    async onMessage(message) {
        const content = message.content.toLowerCase();

        if (content.includes("prefix")) {
            const embed = new EmbedBuilder()
                .setColor("#3498DB") // Dodger Blue
                .setDescription(`This is my currently set prefix: \`${prefix}\``);

            message.channel.send({ embeds: [embed] });
        }
    },
};

const { EmbedBuilder } = require("discord.js");
const { prefix } = require("./../../config.json");
/**
 * @type {import('../../typings').LegacyCommand}
 */
module.exports = {
    name: "help",
    description: "List all commands of bot or info about a specific command.",
    aliases: ["commands"],
    usage: "[command name]",
    cooldown: 5,

    execute(message, args) {
        const { commands } = message.client;

        // If there are no args, list all commands
        if (!args.length) {
            let commandList = commands.map((command) => `✧ ${command.name}`).join("\n");

            const helpEmbed = new EmbedBuilder()
                .setColor("Random")
                .setTitle("Commands Help (GDPH)")
                .setDescription(`Hey ${message.author.username}, these are commands that may help you:\n\`\`\`${commandList}\`\`\``)
                .addFields([
                    {
                        name: "Total commands",
                        value: `[ ${commands.size} ]`,
                        inline: true,
                    },
                    {
                        name: "PREFIX",
                        value: `${prefix}`,
                        inline: true,
                    },
                ]);

            return message.channel.send({ embeds: [helpEmbed] })
                .catch((error) => {
                    console.error(`Could not send help message.\n`, error);
                    message.reply({ content: "It seems like I can't send messages here!" });
                });
        }

        // If argument is provided, check if it's a command
        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find((c) => c.aliases && c.aliases.includes(name));

        // If it's an invalid command
        if (!command) {
            return message.reply({ content: "That's not a valid command!" });
        }

        let commandEmbed = new EmbedBuilder()
            .setColor("Random")
            .setTitle("Command Help");

        if (command.description) {
            commandEmbed.setDescription(`${command.description}`);
        }

        if (command.aliases) {
            commandEmbed.addFields([
                {
                    name: "Aliases",
                    value: `\`${command.aliases.join(", ")}\``,
                    inline: true,
                },
                {
                    name: "Cooldown",
                    value: `${command.cooldown || 3} second(s)`,
                    inline: true,
                },
            ]);
        }

        if (command.usage) {
            commandEmbed.addFields([
                {
                    name: "Usage",
                    value: `\`${prefix}${command.name} ${command.usage}\``,
                    inline: true,
                },
            ]);
        }

        // Send the embed to the channel
        message.channel.send({ embeds: [commandEmbed] });
    },
};

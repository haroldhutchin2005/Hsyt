const axios = require('axios');
const { EmbedBuilder } = require("discord.js");

/**
 * @type {import('../../typings').LegacyCommand}
 */
module.exports = {
    name: "gdphtop",
    description: "GDPH leaderboard",
    aliases: [],
    usage: "",
    cooldown: 30,

    async execute(message, args) {
        const apiUrl = 'https://gdphtopleaderboare-d70496a9c158.herokuapp.com/gdphtop';

        try {
            const embed = new EmbedBuilder()
                .setColor("#3498DB") // Dodger Blue
                .setDescription("📊 Fetching Top 27 Leaderboard on GDPH Server. Please wait...");

            const sentMessage = await message.channel.send({ embeds: [embed] });

            const response = await axios.get(apiUrl);
            const leaderboard = response.data.slice(0, 27);

            let leaderboardMessage = "📊 Top 27 Leaderboard On GDPH Server:\n\n";

            leaderboard.forEach((entry, index) => {
                leaderboardMessage += `Rank ${entry.rank}: ${entry.username} (UserID: ${entry.userID}) - Stars: ${entry.stars}\n\n`;
            });

            const embedResponse = new EmbedBuilder()
                .setColor("#2ECC71") // Emerald
                .setDescription(leaderboardMessage);

            sentMessage.edit({ embeds: [embedResponse] });

        } catch (error) {
            console.error(error);

            const errorEmbed = new EmbedBuilder()
                .setColor("#E74C3C") // Alizarin
                .setTitle("Error")
                .setDescription("An error occurred while fetching the leaderboard.");

            message.reply({ embeds: [errorEmbed] });
        }
    },
};

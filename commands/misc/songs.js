const axios = require('axios');
const { EmbedBuilder } = require("discord.js");

/**
 * @type {import('../../typings').LegacyCommand}
 */
module.exports = {
    name: "songs",
    description: "Search for songs from GDPH SERVER",
    aliases: [],
    usage: "[song title]",
    cooldown: 30,

    async execute(message, args) {
        const title = encodeURIComponent(args.join(" "));
        const apiUrl = `https://gpdh-server-song-list-api-search-by.onrender.com/gdph?songlist=${title}`;

        if (!title) {
            return message.reply("Please provide a song title.\n\nUsage: songs [your search song title]");
        }

        try {
            const embed = new EmbedBuilder()
                .setColor("#3498DB") // Dodger Blue
                .setDescription("🔍 | Checking The Database for Searching songs. Please wait...");

            const searchMessage = await message.channel.send({ embeds: [embed] });

            const response = await axios.get(apiUrl);
            const songs = response.data;

            if (songs.length === 0) {
                const noResultEmbed = new EmbedBuilder()
                    .setColor("#E74C3C") // Alizarin
                    .setDescription("No songs found with that title.");

                await message.channel.send({ embeds: [noResultEmbed] });
                return await searchMessage.delete();
            }

            for (const song of songs) {
                let resultMessage = `ID: ${song.id}\nSong: ${song.song}\nAuthor: ${song.author}\nSize: ${song.size}\n\n`;

                const songEmbed = new EmbedBuilder()
                    .setColor("#2ECC71") // Emerald
                    .setDescription(resultMessage);

                await message.channel.send({ embeds: [songEmbed] });
            }

            await searchMessage.delete();

        } catch (error) {
            console.error(error);

            const errorEmbed = new EmbedBuilder()
                .setColor("#E74C3C") // Alizarin
                .setTitle("Error")
                .setDescription("An error occurred while processing your request.");

            await message.reply({ embeds: [errorEmbed] });
        }
    },
};

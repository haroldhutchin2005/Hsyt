const axios = require('axios');
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'rmusic',
    description: 'Reupload music from gdph serve',
    aliases: ["reupload", "upload"],
    usage: 'songlink | title | artist',
    cooldown: 10,

    async execute(message, args) {
        const [link, ...rest] = args.join(' ').split('|').map(arg => arg.trim());
        const [title, artist] = rest;

        const apiUrl = `https://gdph-reuploader-music-api-by-jonell.onrender.com/gdph?songlink=${encodeURIComponent(link)}&title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`;

        if (!link || !title || !artist) {
            return message.reply("Please provide song link, title, and artist.\n\nUsage: rmusic dropboxlink | title | artist");
        }

        try {
            const embed = new EmbedBuilder()
                .setColor('#3498DB')
                .setDescription('🔄 Reuploading the song. Please wait...')
                .setThumbnail('https://i.postimg.cc/ZnpzqK5P/6d0ec30d8b8f77ab999f765edd8866e8a97d59a3.gif'); 

            const sentMessage = await message.channel.send({ embeds: [embed] });

            const response = await axios.get(apiUrl);
            const responseData = response.data;

            if (responseData.includes('This song already exists in our database.')) {
                throw new Error('This song already exists in our database.');
            }

            if (responseData.includes('The download link isn\'t a valid URL.')) {
                throw new Error('The download link isn\'t a valid URL.');
            }

            const id = responseData.replace(/<\/?b>/g, '').replace(/<hr>/g, '\n').trim(); // Extract song ID from responseData

            let messageContent = `🎵 ${id}\n`;
            messageContent += `🔊 Song Name: ${title}\n`;
            messageContent += `👤 Author: ${artist}\n`;
            messageContent += `🌐 Link: ${link}\n`;

            const resultEmbed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('GDPH REUPLOAD SONG RESPONSE')
                .setDescription(messageContent)
                .setThumbnail('https://i.postimg.cc/vT4fX1DW/EGo-HT-1-Ws-AACp-Pc.png'); 

            sentMessage.edit({ embeds: [resultEmbed] });
        } catch (error) {
            console.error(error);

            const errorMessage = error.message;

            const errorEmbed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('Error Response From Server GDPH')
                .setDescription(errorMessage)
                .setThumbnail('https://i.postimg.cc/J0kkwf8g/EGo-HT-9-XUAEIBao.png'); 

            message.reply({ embeds: [errorEmbed] });
        }
    },
};

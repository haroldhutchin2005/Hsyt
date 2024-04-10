const axios = require('axios');
const { EmbedBuilder } = require("discord.js");
const fs = require('fs').promises;

const storageFile = 'user_data.json';
const axiosStatusFile = 'axios_status.json';

const primaryApiUrl = 'https://jonellccprojectapis.onrender.com/api/gptconvo';
const backupApiUrl = 'https://jonellccprojectapis.onrender.com/api/v2/ai';

let isPrimaryApiStable = true;

module.exports = {
    name: "ai",
    description: "EDUCATIONAL",
    aliases: [],
    usage: "[question]",
    cooldown: 10,

    async execute(message, args) {
        const content = encodeURIComponent(args.join(" "));
        const uid = message.author.id;

        let apiUrl, apiName;

        if (isPrimaryApiStable) {
            apiUrl = `${primaryApiUrl}?ask=${content}&id=${uid}`;
            apiName = 'Primary Axios';
        } else {
            apiUrl = `${backupApiUrl}?ask=${content}`;
            apiName = 'Backup Axios';
        }

        if (!content) {
            return message.reply("Please provide your question.\n\nExample: ai what is the solar system?");
        }

        try {
            const embed = new EmbedBuilder()
                .setColor("#3498DB") // Dodger Blue
                .setDescription("🔍 | AI is searching for your answer. Please wait...");

            const responseMessage = await message.channel.send({ embeds: [embed] });

            const response = await axios.get(apiUrl);
            const result = isPrimaryApiStable ? response.data.response : response.data.message;

            if (!result) {
                throw new Error("Axios response is undefined");
            }

            const userData = await getUserData(uid);
            userData.requestCount = (userData.requestCount || 0) + 1;
            userData.responses = userData.responses || [];
            userData.responses.push({ question: content, response: result });
            await saveUserData(uid, userData, apiName);

            const totalRequestCount = await getTotalRequestCount();
            const userName = message.author.username;

            const embedResponse = new EmbedBuilder()
                .setColor("#2ECC71") // Emerald
                .setDescription(`${result}\n\n👤 Question Asked by: ${userName}`);

            responseMessage.edit({ embeds: [embedResponse] });

            await saveAxiosStatus(apiName);

            if (!isPrimaryApiStable) {
                isPrimaryApiStable = true;
                message.channel.send("🔃 | Switching back to the primary Axios. Just please wait.");
            }

        } catch (error) {
            console.error(error);

            const errorEmbed = new EmbedBuilder()
                .setColor("#E74C3C") // Alizarin
                .setTitle("Error")
                .setDescription("An error occurred while processing your request.");

            message.reply({ embeds: [errorEmbed] });

            try {
                message.channel.send("🔄 | Trying Switching Axios!");
                const backupResponse = await axios.get(`${backupApiUrl}?ask=${content}`);
                const backupResult = backupResponse.data.message;

                if (!backupResult) {
                    throw new Error("Backup Axios response is undefined");
                }

                const userData = await getUserData(uid);
                userData.requestCount = (userData.requestCount || 0) + 1;
                userData.responses = userData.responses || [];
                userData.responses.push({ question: content, response: backupResult });
                await saveUserData(uid, userData, 'Backup Axios');

                const embedBackupResponse = new EmbedBuilder()
                    .setColor("#2ECC71") // Emerald
                    .setDescription(`${backupResult}\n\n👤 Question Asked by: ${userName}`);

                message.channel.send({ embeds: [embedBackupResponse] });

                isPrimaryApiStable = false;

                await saveAxiosStatus('Backup Axios');

            } catch (backupError) {
                console.error(backupError);
                message.channel.send("An error occurred while processing your request.");

                await saveAxiosStatus('Unknown');
            }
        }
    },
};

async function getUserData(uid) {
    try {
        const data = await fs.readFile(storageFile, 'utf-8');
        const jsonData = JSON.parse(data);
        return jsonData[uid] || {};
    } catch (error) {
        return {};
    }
}

async function saveUserData(uid, data, apiName) {
    try {
        const existingData = await getUserData(uid);
        const newData = { ...existingData, ...data, apiUsed: apiName };
        const allData = await getAllUserData();
        allData[uid] = newData;
        await fs.writeFile(storageFile, JSON.stringify(allData, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

async function getTotalRequestCount() {
    try {
        const allData = await getAllUserData();
        return Object.values(allData).reduce((total, userData) => total + (userData.requestCount || 0), 0);
    } catch (error) {
        return 0;
    }
}

async function getAllUserData() {
    try {
        const data = await fs.readFile(storageFile, 'utf-8');
        return JSON.parse(data) || {};
    } catch (error) {
        return {};
    }
}

async function saveAxiosStatus(apiName) {
    try {
        await fs.writeFile(axiosStatusFile, JSON.stringify({ axiosUsed: apiName }), 'utf-8');
    } catch (error) {
        console.error('Error saving Axios status:', error);
    }
}

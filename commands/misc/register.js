const axios = require('axios');
const { EmbedBuilder, ChannelType } = require("discord.js");

/**
 * @type {import('../../typings').LegacyCommand}
 */
module.exports = {
  name: "register",
  description: "Register an account",
  aliases: ["!register"],
  usage: "username | password | email",
  cooldown: 10,

  async execute(message) {
    // Send initial message to the user
    message.reply("Check your DM for registration details.");

    const filter = m => m.author.id === message.author.id; // Filter for the collector

    const questions = [
      "Please enter your username:",
      "Please enter your password:",
      "Please enter your email:"
    ];

    let answers = [];

    for (const question of questions) {
      await message.author.send(question);
      const collected = await message.author.dmChannel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
      answers.push(collected.first().content.trim());
    }

    const [username, password, email] = answers;

    const apiUrl = `https://gdph-register-accout-api-by-jonell.onrender.com/gdphreg`;

    try {
      await message.author.send("☁️ | Registering your account to database. Please wait...");

      const response = await axios.get(`${apiUrl}?username=${username}&password=${password}&fakeemail=${email}`);

      if (response.data.status === "error" && response.data.message === "Registration failed.") {
        const successMessage = `✅ | Successfully Account Registered. Please login In your Account On GDPH App\n\nUsername: ${username}\nPassword: ${password}\nEmail: ${email}\n\nEnjoyy!!`;

        const registerEmbed = new EmbedBuilder()
          .setColor("Random")
          .setTitle("Account Registration")
          .setDescription(successMessage)
          .addFields([
            {
              name: "Usage",
              value: `\nYou can use \`!register\` to register a new account!`,
            },
          ]);

        return message.author.send({ embeds: [registerEmbed] });
      } else {
        return message.author.send(response.data.message);
      }
    } catch (error) {
      console.error(error);
      return message.author.send("An error occurred while processing your request.");
    }
  }
};

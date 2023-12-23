require('dotenv/config');
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
  {
    name: 'embed',
    description: 'Send an embed!',
  },
];

const rest = new REST({ version: '10' }).setToken(
  process.env.DISCORD_TOKEN as string,
);

(async () => {
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.APP_ID as string,
        process.env.SERVER_ID as string,
      ),
      { body: commands },
    );

    console.log('Slash commands were registered successfully!');
  } catch (error) {
    console.error(`There was an error: ${error as string}`);
  }
})();

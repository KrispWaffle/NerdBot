require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType} = require('discord.js');

const commands = [
  {
    name: 'set-channel',
    description: 'Sets the channel where deleted messages will be sent in',
    options:[
      {
        name: 'channelid',
        description:'the specific channel',
        type:ApplicationCommandOptionType.String,

        required:true
      }
      
    ]
  },
  {
    name: 'change-nickname',
    description: 'Constantly changes a users nickname to a specific nickname',
    options:[
        {
            name: 'userid',
            description:'enter user id',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'nickname',
            description: 'enter the nickname',
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],
  }

];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Registering slash commands...');

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log('Slash commands were registered successfully!');
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
})();
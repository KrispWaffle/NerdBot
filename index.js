require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
});

client.login(process.env.TOKEN);

client.on('ready', (c) => {
    console.log('Ready to work 🤓');
    client.user.setActivity({
        name: 'Being Nerdy',
        type: ActivityType.Streaming,
    });
});

async function checkAndChangeNickname(guildId, memberId, desiredNickname) {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        console.error('Guild not found');
        return;
    }

    try {
        const member = await guild.members.fetch(memberId);
        if (member.displayName !== desiredNickname) {
            await member.setNickname(desiredNickname);
        }
    } catch (error) {
        console.error('Failed to fetch/set nickname for member:', error);
    }
}

let counts = {};

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    console.log(`${message.member.displayName} ${message.author.tag} ${message.content}`);
    
    const embed = new EmbedBuilder()
        .setTitle('Message Logger')
        .setThumbnail('https://t4.ftcdn.net/jpg/00/56/81/07/360_F_56810752_FsCC4Vu2FEV645pFU7q3FKPaJCQEKCHP.jpg')
        .addFields(
            { name: 'Message Content', value: message.content, inline: true },
            { name: 'Message Sender', value: message.member.displayName, inline: true }
        )
        .setTimestamp();

    const logChannel = client.channels.cache.get('1302124994972749955');
    if (logChannel) {
        logChannel.send({ embeds: [embed] });
    } else {
        console.error('Log channel not found');
    }

    const id = message.member.id;

    if (message.content === 'NERD!') {
        if (!counts[id]) {
            counts[id] = 0;
        }
        counts[id]++;
        await message.reply('watch out');
        setTimeout(() => message.delete(), 1000);

        if (counts[id] === 3) {
            try {
                await message.member.kick('Repeated violation');
                console.log(`Kicked ${message.author.tag} for repeated violation`);
                counts[id] = 0;
            } catch (err) {
                console.error('Failed to kick member:', err);
            }
        }
    }
});

let changedNicknames = {};

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'change-nickname') {
        const guildId = interaction.guildId;
        const userId = interaction.options.get('userid').value;
        const nickname = interaction.options.get('nickname').value;

        await checkAndChangeNickname(guildId, userId, nickname);
        await interaction.reply(`Changed nickname to ${nickname}`);

        changedNicknames[`${guildId}-${userId}-${nickname}`] = true;
    }
});

setInterval(() => {
    for (const key in changedNicknames) {
        const [guildId, userId, nickname] = key.split('-');
        checkAndChangeNickname(guildId, userId, nickname);
    }
}, 5 * 60 * 1000);  // Set to check every 5 minutes

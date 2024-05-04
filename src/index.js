require('dotenv').config();
const {
    Client,
    GatewayIntentBits,
    User,
    GuildMember,
    CommandInteraction,
    Message,
    TextChannel,
    ActivityType,
    GuildDefaultMessageNotifications,
    Embed
} = require('discord.js');
const {REST} = require("@discordjs/rest");
const { Routes} = require("discord-api-types/v9");
const { Player } = require("discord-player");
const fs = require("node:fs");
const path = require("node:path");
const { EmbedBuilder } = require('@discordjs/builders');
const { channel } = require('node:diagnostics_channel');

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

async function checkAndChangeNickname(guildId,memberId, desiredNickname) {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        console.error('Guild not found');
        return;
    }

    let member = guild.members.cache.get(memberId);

    try {
        member = await guild.members.fetch(memberId);
    } catch (error) {
        console.error('Failed to fetch member:', error);
        return;
    }

    if (member.displayName !== desiredNickname) {
        
        try {
            await member.setNickname(desiredNickname);
            
            //console.log(`Changed nickname for ${member.user.tag} to ${desiredNickname}`);
        } catch (error) {
             console.error('Failed to set nickname:', error);
        }
    }
}


let counts = {};

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    console.log(message.member.displayName + " " + message.author + " " + message.content);
    
    const embed = new EmbedBuilder()
    .setTitle('Message Logger')
    
    .setThumbnail('https://t4.ftcdn.net/jpg/00/56/81/07/360_F_56810752_FsCC4Vu2FEV645pFU7q3FKPaJCQEKCHP.jpg')
    .addFields(
        
        { name: 'Message Content', value: message.content.toString(), inline: true },
        
        { name: 'Message Sender', value: message.member.displayName, inline: true }
    )
        .setTimestamp();
    
    let channel = client.channels.cache.get('1053921241993584650');
    channel.send({ embeds: [embed] });

    const id = message.member.id;

    if (message.content == '') {
        if (!counts[id]) {
            counts[id] = 0;
        }
        counts[id]++;
        await message.reply('watch out'); 
        console.log(counts[id]);
        setTimeout(() => {
            message.delete(); 
        }, 1000); 
    }

    if (counts[id] && counts[id] == 3) {
        try {
            await message.member.kick('Repeated violation');
            console.log(`Kicked ${message.author.tag} for repeated violation`);
            counts[id] = 0;
        } catch (err) {
            console.error('Failed to kick member:', err);
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
        interaction.reply(`Changed nickname to ${nickname}`);

        // Add the user to the list of changed nicknames
        changedNicknames[`${guildId}-${userId}-${nickname}`] = true;
    }


});


setInterval(() => {
    for (const key in changedNicknames) {
        const [guildId, userId, nickname] = key.split('-');
       
        checkAndChangeNickname(guildId, userId, nickname);
    }
}, 1); 

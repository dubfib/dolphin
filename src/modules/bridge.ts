/**
 * Discord to Hypixel Bridge Implementation
 * Requires to be called in a MesageCreate event
 * Requires to have a configuration file
 * Requires imported modules
 * @author dubfib
 * @license MIT
*/
import { Client, EmbedBuilder, Colors, TextChannel, Events } from "discord.js";
import { createBot } from "mineflayer";

import * as config from "../../config/bridge.json" assert { type: "json" };

export async function bridge({ client }: { client: Client }) {
    /* minecraft bot side */
    const bot = createBot({
        host: config.host,
        username: config.email,
        auth: "microsoft",
        version: config.version,
        profilesFolder: "../../.minecraft"
    });

    bot.once('spawn', async () => {
        /* fancy logging will be added later */
        console.log(`[mineflayer] authenticated as ${bot.username}`);
    });

    bot.on('chat', async (username, message): Promise<void> => {
        /* regular expressions */
        const MessageRegex = /(?:\[[\w+\-]+] )?(\w+)(?: \[[\w+\-]+])?: (.+)$/;

        /* parse channels */
        switch (username) {
            case "Guild":
                const guild_match = message.match(MessageRegex);

                if (!guild_match) return;
                const guild_name = guild_match[1];
                const guild_msg = guild_match[2];

                if (guild_name === bot.username) return;

                const GuildChatEmbed = new EmbedBuilder()
                    .setAuthor({ name: guild_name, iconURL: `https://mc-heads.net/avatar/${guild_name}` })
                    .setDescription(`\`\`\`\n${guild_msg.replaceAll('`', '')}\n\`\`\``) //fixes breaking embed bug, thanks tommy. smh
                    .setColor(Colors.DarkGreen)
                    .setFooter({ text: 'Guild Chat' })
                    .setTimestamp();
                await (client.channels.cache.get(config.guild_channel) as TextChannel).send({ embeds: [ GuildChatEmbed ]});
                break;
            case "Officer":
                const officer_match = message.match(MessageRegex);

                if (!officer_match) return;
                const officer_name = officer_match[1];
                const officer_msg = officer_match[2];

                if (officer_name === bot.username) return;

                const OfficerChatEmbed = new EmbedBuilder()
                    .setAuthor({ name: officer_name, iconURL: `https://mc-heads.net/avatar/${officer_name}` })
                    .setDescription(`\`\`\`\n${officer_msg.replaceAll('`', '')}\n\`\`\``) //fixes breaking embed bug, thanks tommy. smh
                    .setColor(Colors.DarkBlue)
                    .setFooter({ text: 'Officer Chat' })
                    .setTimestamp();
                await (client.channels.cache.get(config.officer_channel) as TextChannel).send({ embeds: [ OfficerChatEmbed ]});
                break;
            default:
                break;
        }
    });

    /* persistence */
    bot.on('end', async () => await bridge({ client: client }));

    /* discord bot side */
    /* needs filter (to-do) */

    /* discord event for sent message */
    client.on(Events.MessageCreate, async (message) => {
        /* check if a bot and in right channel */
        if (message.author.bot) return;

        /* channel checks */
        if (message.channelId === config.guild_channel) {
            bot.chat(`/gc @${message.author.username} > ${message.cleanContent}`);
        } else if (message.channelId === config.officer_channel) {
            bot.chat(`/oc @${message.author.username} > ${message.cleanContent}`);
        } else return;
    });

    /* discord event for message edit */
    client.on(Events.MessageUpdate, async (_, message) => {
        /* check if a bot and in right channel */
        if (message.author.bot) return;

        /* channel checks */
        if (message.channelId === config.guild_channel) {
            bot.chat(`/gc @${message.author.username} > ${message.cleanContent} (edited)`);
        } else if (message.channelId === config.officer_channel) {
            bot.chat(`/oc @${message.author.username} > ${message.cleanContent} (edited)`);
        } else return;
    });


    /* discord event for adding reactions */
    client.on(Events.MessageReactionAdd, async (reaction, user) => {
        /* check if a bot and in right channel */
        if (user.bot) return;

        /* make sure the reacted message has an author */
        if (!reaction.message.author) return;

        /* channel checks */
        if (reaction.message.channelId === config.guild_channel) {
            bot.chat(`/gc @${reaction.message.author.username} reacted ${reaction.emoji.name} to ${reaction.message.cleanContent}`);
        } else if (reaction.message.channelId === config.officer_channel) {
            bot.chat(`/oc @${reaction.message.author.username} reacted ${reaction.emoji.name} to ${reaction.message.cleanContent}`);
        } else return;
    });
}
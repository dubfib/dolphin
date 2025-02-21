import { Client, GatewayIntentBits, Partials, Events } from 'discord.js';

import { bridge } from "./src/modules/bridge.ts";

import { token } from './config/discord.json';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Message,
        Partials.Reaction,
        Partials.User
    ]
});

client.once(Events.ClientReady, async (client) => {
    console.log(`[discord.js] authenticated as ${client.user.tag}`);
    await bridge({ client: client });
});

client.login(token).catch(err => console.log(err));
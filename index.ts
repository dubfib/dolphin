import { Client, GatewayIntentBits, Events } from 'discord.js';

import { bridge } from "./src/modules/bridge.ts";

import { token } from './config/discord.json';

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
]});

client.on(Events.MessageCreate, async (message) => {
    await bridge({ client: client, message: message });
});

client.login(token).catch(err => console.log(err));
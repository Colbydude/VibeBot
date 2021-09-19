require('dotenv').config();

const Discord = require('discord.js');
const fs = require('fs');
const logger = require('winston');

const cacheFileName = __dirname + '/vibes.txt';

// Configure logger settings.
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, { colorize: true });
logger.level = 'debug';

// Initialize the bot.
const bot = new Discord.Client();

// Initialization.
bot.once('ready', async () => {
    logger.info('Logged in as ' + bot.user.tag + '!');

    // Attempt to get the count from the cache file if the bot goes offline.
    let initialVibes = 0;

    if (fs.existsSync(cacheFileName)) {
        initialVibes = parseInt(fs.readFileSync(cacheFileName));
    }

    await bot.user.setPresence({
        activity: { type: 'LISTENING', name: `some vibes. (${initialVibes})` },
        status: 'idle'
    });
});

// Listen for messages.
bot.on('message', async (message) => {
    const msg = message.content.toLowerCase();

    // Count how many vibes.
    let vibeCount = 0;

    vibeCount += (msg.match(/vibe/g) || []).length;
    vibeCount += (msg.match(/vibin/g) || []).length;
    vibeCount += (msg.match(/v i b e/g) || []).length;
    vibeCount += (msg.match(/v i b i n/g) || []).length;

    logger.info(`${vibeCount} vibes detected.`);

    if (vibeCount > 0) {
        const currentVibes = getVibesFromPresence(bot.user.presence);
        const newVibes = currentVibes + vibeCount;

        await bot.user.setPresence({
            activity: { type: 'LISTENING', name: `some vibes. (${newVibes})` },
            status: 'idle'
        });

        // Cache to file.
        fs.writeFileSync(cacheFileName, "" + newVibes);
    }
});

function getVibesFromPresence(presence) {
    if (presence.activities.length === 0) {
        return 0;
    }

    try {
        // Extract vibe count from the number inbetween parentheses.
        return parseInt(/\(([^)]+)\)/.exec(presence.activities[0].name)[1]);
    }
    catch (e) {
        logger.error('Could not determine vibes. :(', e);
        return 0;
    }
}

// Connect the bot.
bot.login(process.env.DISCORD_TOKEN);

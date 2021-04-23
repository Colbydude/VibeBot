const Discord = require('discord.js');
const logger = require('winston');

// Configure logger settings.
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, { colorize: true });
logger.level = 'debug';

// Initialize the bot.
const bot = new Discord.Client();

// Initialization.
bot.once('ready', async () => {
    logger.info('Logged in as ' + bot.user.tag + '!');
    await bot.user.setPresence({
        activity: { type: 'LISTENING', name: `some vibes. (0)` },
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

        await bot.user.setPresence({
            activity: { type: 'LISTENING', name: `some vibes. (${currentVibes + vibeCount})` },
            status: 'idle'
        });
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

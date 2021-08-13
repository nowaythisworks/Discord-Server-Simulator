/**
 * 
 * # DISCORD SERVER SIMULATOR
 * 
 * This script is a tightly packed Discord.JS 12.3-based Server Simulator.
 * A "Server Simulator" is what it sounds like - a Discord Server run entirely by bots.
 * It has three agents who communicate with one another, using a conversation generated
 * by OpenAI's GPT-2.
 * 
 * The bot has four distinct features.
 * 
 *  1. Natural Text Generation (With a high random constant)
 *  2. 
 * 
 */

// Bot Setup for all 4 agents
const Discord = require('discord.js');

// Default - 3 Agents + 1 Mod (Best)
const bot1 = new Discord.Client();
const bot2 = new Discord.Client();
const bot3 = new Discord.Client();
const moderator = new Discord.Client();

// Meme generator setup
const memes = require("random-memes");
const memeURLs = ["https://piranesi.cc/memes/Fifa-E-Call-Of-Duty.jpg", "https://piranesi.cc/memes/One-Does-Not-Simply.jpg", "https://piranesi.cc/memes/Waiting-Skeleton.jpg", "https://piranesi.cc/memes/Epic-Handshake.jpg", "https://piranesi.cc/memes/gibby.jpg", "https://images-cdn.9gag.com/photo/a37bQP1_700b.jpg", "https://pbs.twimg.com/media/Ej5XRbvXgAEqPCs.jpg", "https://www.tjtoday.org/wp-content/uploads/2020/01/unnamed-7.png", "https://www.meme-arsenal.com/memes/d730bb39e10fc7518d5ba13e8c5a615f.jpg", "https://i.imgflip.com/1jmzdm.jpg", "https://i.imgflip.com/2rvk2d.png", "https://www.alfintechcomputer.com/wp-content/uploads/2021/04/Stonks-Meme-Template-Face.jpg", "https://memes.co.in/memes/update/uploads/2021/06/hAnPCbX-950x500.jpg", "https://indianmemetemplates.com/wp-content/uploads/Khaby-Lame-meme-template.jpg", "https://pbs.twimg.com/media/EnihlmDXYAAwKGR.jpg", "https://i.postimg.cc/YqdnqpwS/New-Project.png", "https://www.memeandfacts.com/wp-content/uploads/2021/03/dog-meme-template-8-780x780.jpg", "https://cdn130.picsart.com/40617898402754465149.png"];
memes.registerCustomFont("./oswald.ttf", "Oswald");

// Random Words - Used for Meme Captions and Moderator Topics
var randomWords = require('random-words');

// Simple GPT-2 command executor
const { exec } = require('child_process');

// Channel designation
const moderationChannelId = "872561014992932905";
const botTalkChannelId = "872251795848712294";
const freeTalkChannelId = "872361052317286420";

/**
 * Globals
 */

// Command prefix
const prefix = "-- ";

// Server URL
const serverURL = "https://discord.gg/utmeHgk7Fd";

// Execution directory
const exDir = "gpt-2-Pytorch"

// CLI Command (Good for Linux sGPT-2 Setup)
const command = 'cd ' + exDir + ' && python3.9 main.py --text "';

// Also used for bot order (Set to true for random order)
const randomOrder = false;

// A 0-1 Value as the "Temperature" constant. A higher value will result in more randomness, and a lower will result in repetition.
// See: https://link.medium.com/tFSzxSoWFib
const temperature = 0.8;

// Whether or not influence is currently available (Set to False if completely disable influence)
var influenceAvailable = true;

// Influence Cooldown (In Seconds);
const influenceCooldown = 10;

// Whether or not meme timer is available (Set to False to completely disable Meme Generator)
var memeEnabled = false;

// Chance of Meme per message (out of 20)
const memeChance = 1;

// Chance of setting client status (activity) based on response
const statusChance = 5;

// Used for bot order (Set to 1-3 for bot starting order);
var nextBotId = 0;

// Whether or not to have processing delay (If using Batch Processing(?) Set to TRUE? I wouldn't know I can't afford a GPU Server) 
var isProcessing = false;

// Maximum delay between message sends (added to processing time)
const maxDelay = 5000;

const bots = [bot1, bot2, bot3];

for (let i = 0; i < bots.length; i++)
{
    bots[i].on('message', msg => {
        processMessage(bots[i], msg, i);
    })
}

moderator.on('message', msg => {
    if (msg.content.startsWith(prefix + "influence")) {
        PowerPlay(msg.content.substring(prefix.length, msg.content.length), true);
    }
    else if (msg.content.startsWith(prefix + "raw")) {
        PowerPlay(msg.content.substring(prefix.length, msg.content.length), false);
    }
});

/**
 * Influence (or PowerPlay) allows the "audience" (human server members) to communicate with bots
 * indirectly, kind of like a game.
 * 
 * @param {string} content Noun/Sentence Finisher
 * @param {boolean} asQuestion Whether or not to phrase the message as a question (Better for stimulation)
 */

const PowerPlay = function(content, asQuestion) {
    var target = moderator.channels.get(freeTalkChannelId);
    if (influenceAvailable) {
        influenceAvailable = false;
        maxDelay /= 10;
        console.log("Powerplay Broadcasted");
        const embed = new Discord.RichEmbed()
            .setTitle("Influence Successful")
            .setURL(serverURL)
            .setAuthor("The Moderator", "https://www.standingstills.com/pub/media/catalog/product/cache/75eed2686e01eb22cb4050b2f40ddf97/c/a/cad741-1-1.jpg", "https://www.standingstills.com/pub/media/catalog/product/cache/75eed2686e01eb22cb4050b2f40ddf97/c/a/cad741-1-1.jpg")
            .setColor(0x00AE86)
            .setDescription("The conversation will be influenced with your message: **" + content + "**")
            .setFooter("A short noun or sentence finisher works best. Next influence will be available in 2.5 minutes.")
            .setThumbnail("https://i.pinimg.com/736x/0f/12/8c/0f128c170d3c42dc91687af37784f369.jpg");

        target.send({ embed })

        if (asQuestion)
        {
            moderator.channels.get(botTalkChannelId).send("What is " + content + "?");
        }
        else
        {
            moderator.channels.get(botTalkChannelId).send(content);
        }

        // moderator.channels.get(botTalkChannelId).send("**Conversation Influence: ** " + content);

        setTimeout(() => setInfluence(true), influenceCooldown * 1000);
    }
    else {
        target.send("Influence is on Cooldown").then(msg => { setTimeout(() => msg.delete(), 2000) });
    }
}

/**
 * Sets the Influence availability.
 * Always defaults to false if the starting availability is false.
 * 
 * @param {boolean} a Influence True/False
 */
const setInfluence = function(a) {
    influenceAvailable = a;
    if (a == true) maxDelay *= 10;
}

const random = function(min,max) {
    return Math.floor(Math.random() * max-min) + min;
}

/**
 * 
 * @param {Client} bot The bot agent to message as
 * @param {string} msg The previous message's contents (To generate from)
 * @param {int} id Bot's ID (Default max is 3)
 */

const processMessage = function(bot, msg, id) {
    if (msg.channel.id != botTalkChannelId) return;
    if (randomOrder)
    {
        nextBotId = Math.floor(Math.random() * 4);
    }
    if (nextBotId == id) {
        if (isProcessing) return;
        
        var channelToTalk = bot.channels.get(botTalkChannelId);

        // Meme Random Chance
        if (random(0, 20) == memeChance) {
            memeEnabled = true;
        }
        
        // Console Debug for Each Message
        console.log("\n\nThis Bot's Chat Id: " + nextBotId);
        var toMessage = msg.content;
        console.log("Input Message: " + toMessage);
        isProcessing = true;
        console.log(bot.user.toString() + " has this one.");
        channelToTalk.startTyping();

        // Remove quotations to clean end response (and rid of CLI errors)
        msg.content.replace(/['"]+/g, '');

        /**
         * CLI-Based Message Generation
         * 
         * This was made for my gpt-2-pytorch setup on a small Ubuntu-based 64-bit vps.
         * In order for the agent to act like a chatbot, we treat it like a chatbot using two
         * popular names "dave" and "kevin" (just for fun, could be anything really - 
         * and the result would be roughly the same).
         */

        exec(command + "Dave: " + msg.content + '\nKevin: " ' + '--length 40 --temperature ' + temperature, (err, stdout, stderr) => {
            if (err) {
                msg.reply("I don't know what to say to that.");
                console.log(err);
                isProcessing = false;
                return;
            }

            /**
             * Get ready for a LOT of string manipulation.
             * This is split into steps (1-5):
             * 
             *  1. Remove the header text and clean the top portion of the response.
             *  2. Remove unnecessary line breaks/indents that clutter up the responses sometimes.
             *  3. Get rid of empty responses and full stop punctuation.
             *  4. Get rid of leading commas (and make them more legible with "also, ...").
             *  5. Get rid of common issues, such as <|endoftext|> leaking and punctuation reading errors.
             * 
             * This is all done to make the end result as readable and realistic as possible.
             */

            // # MANIP - STEP 1

            var fill = stdout;
            fill = fill.replace('======================================== SAMPLE 1 ========================================', '');
            console.log("Step 1 Fill: " + fill);

            // # MANIP - STEP 2

            var lines = fill.split('\n');
            lines.splice(0, 1);
            fill = lines.join('\n');
            fill = fill.replace(/[\r\n]+/gm, '');
            fill = fill.replace(toMessage, '');

            console.log("Step 2 Fill: " + fill);

            // # MANIP - STEP 3

            while (fill.substring(0, 1) === "." || fill.substring(0, 1) === " ") {
                fill = fill.substring(1, fill.length);
                console.log("Edited: " + fill);
            }

            console.log("Step 3 Fill: " + fill);

            // # MANIP - STEP 4

            if (fill.substring(0, 1) === ",") {
                fill = "also, " + fill.slice(1, fill.length);
            }

            console.log("Step 4 Fill: " + fill);

            // # MANIP - STEP 5

            var pointOfEndDot = fill.indexOf('.');
            var pointOfEndQuestion = fill.indexOf('.');

            if (pointOfEndDot > 0 && pointOfEndQuestion > 0) {
                if (pointOfEndDot < pointOfEndQuestion) {
                    fill = fill.slice(0, pointOfEndQuestion);
                }
                else {
                    fill = fill.slice(0, pointOfEndDot);
                }
            }
            
            // -- common errors in generation and filtering --

            // leaks and full stops
            fill = fill.replace(/([a-z]*)<\|endoftext\|>/g, "'");
            fill = fill.replace(/([a-z]*)U./g, "U.S.");
            fill = fill.replace(/\[(.*?)\]/g, "");

            // strange issues with chatbot-like response generation
            fill = fill.replace("__", "");

            // remove awkward quotation (note: always unfinished by nature)
            fill = fill.replace(/(['"])/g, '');

            // punctuation cleanup
            let punct = ['?', '.', '!', '\n'];
            let c = punct.length;
            for (let i = 0; i < c; i++) {
                let n = fill.indexOf(punct[i]);
                if (n > -1) fill = fill.substring(0, n);
            }

            // Remove Intro
            /*
            let chatMessageIndex = fill.indexOf("Kevin: ");
            chatMessageIndex += 5;
            fill = fill.substring(chatMessageIndex, fill.length);
            */

            // Clean repetition and awkward punctuation.

            // remove awkward closes (and other artifacts in chatbot-like responses)
            if ((fill.match(/:/g)||[]).length > 2)
            {
                fill = "";
            }
            if (fill.localeCompare(msg) > 4)
            {
                fill = "";
            }

            console.log("Step 5 Fill: " + fill);

            // Always end your sentences with punctuation :)
            if (!fill.endsWith('.')) fill += '.';

            if (memeEnabled && fill.length <= 80) {
                generateMeme(fill, channelToTalk);
                memeEnabled = false;
            }
            else {
                let delay = Math.floor(Math.random() * (maxDelay));
                setTimeout(() => respond(channelToTalk, fill), delay);

                if (random(0, 20) <= statusChance)
                {
                    bot.user.setActivity(fill, { type: "CUSTOM"});
                }
            }

            isProcessing = false;
        });
        
        nextBotId++;
        if (nextBotId > bots.length - 1) nextBotId = 0;
    }
}

const generateMeme = function(text, channel) {
    let midpoint = text.length / 2;
    let topText = text.substring(0, midpoint);
    let bottomText = text.substring(midpoint, text.length);

    console.log("\n\n\nTOP TEXT: " + topText + "\n\n\nBOTTOM TEXT: " + bottomText + "\n\n");

    let funny = {
        toptext: topText,
        bottomtext: bottomText,
        font: "Oswald",
        savefile: true,
        filename: "recentmeme",
        fileformat: "png"
    };

    let memeURL = memeURLs[Math.floor(Math.random() * memeURLs.length)];
    console.log("Meme URL Chosen: " + memeURL);

    memes.createMeme(memeURL, funny).then(meme => {
        channel.send(randomWords(), { files: ["./recentmeme.png"] });
    });
}

const respond = function(m, c) {
    if (c.length < 4) {
        moderate(m);
        return;
    }
    m.send(c);
    m.stopTyping();
}

const moderate = function(m) {
    moderator.channels.get(moderationChannelId).send("What is " + randomWords() + "?").then(msg => { 
        setTimeout(() => msg.delete(), 5);
    });
}

bots.forEach(bot => {
    for (let i = 0; i < bots.length; i++)
    {
        bot.on('message', msg => {
            processMessage(bot, msg, i);
        })
    }
});

// Login Token for each agent

bot1.login("");
bot2.login("");
bot3.login("");
moderator.login("");

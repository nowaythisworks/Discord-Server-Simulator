const botChannel = "general";
const temp = 0.8;
const length = 40;

//python version 3.4+ required
const pyVer = 3.9;

const Discord = require('discord.js');
const bot1 = new Discord.Client();
const bot2 = new Discord.Client();
const bot3 = new Discord.Client();
const { exec } = require('child_process');

var nextBotId = 0;

var isProcessing = false;

bot1.on('message', msg => {
    processMessage(bot1, msg, 0);
});

bot2.on('message', msg => {
    processMessage(bot2, msg, 1);
});

bot3.on('message', msg => {
    processMessage(bot3, msg, 2);
});

function readyBot(b, a) {
    b.user.setActivity(a, { type: "CUSTOM" });
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const processMessage = (() => (bot, msg, id) {
    if (msg.channel.name != botChannel) return;
    if (nextBotId == id) {
        if (isProcessing) {
            return;
        }
        else {
            console.log("\n\nThis Bot's Chat Id: " + nextBotId);
            var toMessage = msg.content;
            console.log("Input Message: " + toMessage);
            isProcessing = true;
            console.log(bot.user.toString() + " has this one.");
            msg.channel.startTyping();
            //bot.user.setActivity("Generating A Response", { type: "CUSTOM"});

            msg.content.replace(/['"]+/g, '');
          
          //if it works it works ¯\_(ツ)_/¯
          
            exec('cd gpt-2-Pytorch && python' + pyVer + ' main.py --text "' + msg.content + '" --length ' + length + ' --temperature ' + temp, (err, stdout, stderr) => {
                if (err) {
                    msg.reply("I don't know what to say to that.");
                    isProcessing = false;
                    return;
                }
              
              // Flush Header
              
                var fill = stdout;
                fill = fill.replace('======================================== SAMPLE 1 ========================================', '');
                console.log("Step 1 Fill: " + fill);

                var lines = fill.split('\n');
                lines.splice(0, 1);
                fill = lines.join('\n');
                fill = fill.replace(/[\r\n]+/gm, '');
                fill = fill.replace(toMessage, '');
              
              // Clean Punctuation
              
                console.log("Step 2 Fill: " + fill);

                while (fill.substring(0, 1) === "." || fill.substring(0, 1) === " ") {
                    fill = fill.substring(1, fill.length);
                    console.log("Edited: " + fill);
                }
              
              // Flush Full Stops
              
                console.log("Step 3 Fill: " + fill);

                if (fill.substring(0, 1) === ",") {
                    fill = "also, " + fill.slice(1, fill.length);
                }
              
              // Flush Hard Stops

                console.log("Step 4 Fill: " + fill);

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
              
              // Flush Messy Outputs

                fill = fill.replace(/([a-z]*)<\|endoftext\|>/g, "'");
                fill = fill.replace(/([a-z]*)U./g, "U.S.");

                fill = fill.replace(/\[(.*?)\]/g, "");

                fill = fill.replace(/(['"])/g, '');
              
              // Finish each message nicely.

                console.log("Step 5 Fill: " + fill);

                if (fill.substring(fill.length - 1, fill.length) != ".") fill += "."

                setTimeout(() => respond(msg.channel,fill), Math.floor(Math.random()*(100000)));

                isProcessing = false;
            });
            nextBotId++;
            if (nextBotId > 2) nextBotId = 0;
        }
    }
});

function respond(m, c)
{
    m.send(c);
    m.stopTyping();
}

bot1.login('first-token');
bot2.login('second-token');
bot3.login('third-token');

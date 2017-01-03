// framework
const Discord = require('discord.js')

// time conversion
const ms = require('ms')

// pretty
const c = require('chalk'),
      log = console.log


// configuration
let config = require('./config.json');

// what qualifies as using this command
let trigger = `${config.prefix}voice`

// discord client (bot form)
let bot = new Discord.Client()

// the people that have connected
let trackedClients = new Map()


bot.on('ready', () => log(c.green('spun up :: now tracking voice channels..')))

// listen for the command
bot.on('message', message =>
{
    if (!message.content.startsWith(trigger))
        return

    const args = message.content.split(' ').slice(1)

    if (args.length)
    {
        const attempt = message.guild.member(message.mentions.users.first());

        if (attempt.voiceChannel != null)
        {
            message.channel.send( {
                embed: {
                    title: `${attempt.displayName} | ${attempt.voiceChannel.name}`,
                    description: ms(Date.now() - trackedClients.get(attempt.id), { long: true })
                }
            } )
        }
        else
        {
            message.reply(`${attempt.displayName} is not connected to a voice channel.`)
        }
    }
});

// listen for when the person connects & store that
bot.on('voiceStateUpdate', (old, fresh) =>
{
    // check that the client is actually connecting..
    if (old.voiceChannel == null && fresh.voiceChannel != null)
    {
        trackedClients.set(fresh.id, Date.now())
        log(c.gray(`${old.displayName} connected to ${fresh.voiceChannel.name}`))
    }
    // disconnecting..
    else if (old.voiceChannel != null && fresh.voiceChannel == null)
    {
        trackedClients.delete(fresh.id)
        log(c.gray(`${old.displayName} disconnected from ${old.voiceChannel.name}`))
    }
});


bot.login(config.token)

// shutdown cleanup
let shutdown = function ()
{
    bot.destroy().then(() => log(c.blue('logged out')))
}

process.on('SIGTERM', () => shutdown())
process.on('SIGINT', () => shutdown())
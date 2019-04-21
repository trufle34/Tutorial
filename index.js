const Discord = require("discord.js")
const bot = new Discord.Client({ disableEveryone: true })
const config = require("./config.json")

const Enmap = require('enmap')
bot.guildSettings = new Enmap({name: "settings"})
const defaultsettings = require("./util/defaultsettings")

function createserver(guildid, object){
    bot.guildSettings.ensure(guildid, object)
}

bot.on("ready", () =>{
    console.log("Bot is online!")
    bot.user.setActivity("Dustie development")
})

bot.on("guildCreate",(guild)=>{
    createserver(guild.id, defaultsettings)
})

bot.on("guildDelete",(guild)=>{
    bot.guildSettings.delete(guild.id)
})

bot.on("message", async (message) => {
    if (message.author.bot) return;
    let prefix = bot.guildSettings.get(message.guild.id,"prefix")
    if (!message.content.startsWith(prefix)) return;

    if(bot.guildSettings.get(message.guild.id,"deletemessage")) message.delete()

    let args = message.content.slice(prefix.length).trim().split(/ +/)
    let cmd = args.shift().toLowerCase()

    if (cmd === "ping") {
        let botping = new Date() - message.createdAt
        let apiping = bot.ping

        return message.channel.send(`Bot ping: ${botping}ms\nApi ping: ${apiping}ms`)
    }
    else if (cmd === "kick") {
        if (!message.member.roles.some(r => ["Moderators"].includes(r.name))) return message.reply("You do not have the moderator role!")

        let member = message.mentions.members.first() || message.guild.members.get(args[0])
        if (!member) return message.reply("This is an invalid user!")
        if (!member.kickable) return message.reply("I cant kick this member as it is higher than me!")
        let reason = args.slice(1).join(" ")
        
        await member.kick(reason).catch(error => {
            return message.reply("There was an error try agian!")
        })
        return message.channel.send(`${member.user.tag} was kicked by ${message.author.tag}! Reason: ${reason}`)
    }
    else if (cmd === "ban") {
        if (!message.member.roles.some(r => ["Moderators"].includes(r.name))) return message.reply("You do not have the moderator role!")

        let member = message.mentions.members.first() || message.guild.members.get(args[0])
        if (!member) return message.reply("This is an invalid user!")
        if (!member.bannable) return message.reply("I cant ban this member as it is higher than me!")
        let reason = args.slice(1).join(" ")

        await member.ban(reason).catch(error => {
            return message.reply("There was an error try agian!")
        })
        return message.channel.send(`${member.user.tag} was banned by ${message.author.tag}! Reason: ${reason}`)
    }
    else if(cmd ==="cdb"){
        if(message.author.id !== "157945195931893761") return message.reply("Only owners can run this command!")

        bot.guildSettings.deleteAll(false)
        bot.guilds.forEach(guild =>{
            createserver(guild.id, defaultsettings)
        })
        return message.reply("done")
    }
    else if(cmd === "setprefix"){
        if(message.author.id !== message.guild.owner.id) return message.reply("Only guild owners can perform this command!")

        let prefix = args.join(" ")
        if(!prefix) return message.reply("Please define a prefix!")

        bot.guildSettings.set(message.guild.id,prefix,"prefix")

        return message.channel.send(`New prefix is set to ${prefix}`)
    }
    else if(cmd === "setdelete"){
        if(message.author.id !== message.guild.owner.id) return message.reply("Only guild owners can perform this command!")

        let toggle = bot.guildSettings.get(message.guild.id,"deletemessage")
        toggle = !toggle

        bot.guildSettings.set(message.guild.id, toggle, "deletemessage")

        return message.channel.send(`Delete message has been set to ${toggle}`)
    }
})


bot.login(config.token)
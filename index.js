const Discord = require("discord.js")
const bot = new Discord.Client({ disableEveryone: true })
const config = require("./config.json")

bot.on("ready", () =>{
    console.log("Bot is online!")
    bot.user.setActivity("Dustie development")
})

bot.on("message", async (message) => {
    if (message.content === "ping") {
        return message.channel.send("pong")
    }
})


bot.login(config.token)
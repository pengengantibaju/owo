const { Client } = require("discord.js");
const bot = new Client();
const database = require("orio.db");
const pogger = require("pogger");
const chalk = require("chalk");
const {
  Token,
  Prefix,
  BotOwner,
  OwoBotID,
  UserID,
  GuildID,
  Writes
} = require("./config");
const dbManager = require("orio.db/src/util/dbManager");

bot.on("message", async (message) => {
  let guild = bot.guilds.get(GuildID);
  if (!guild) return;

  let owoChannelData = await database.get(`owoChannel.${guild.id}`);
  let owner = bot.users.get(BotOwner);
  let owo = bot.users.get(OwoBotID);
  let kanal = bot.channels.get(owoChannelData);

    if (message.channel.type === "dm") {
      if (message.author.id == OwoBotID) {
        if (message.attachments.first()) {
          owner.send(`Spam Warning OwO Bot!\n\n**PLEASE WRITE THE CODE YOU SEE IN THE PICTURE HERE! \n\n${message.attachments.first()?.proxyURL || null}`)
            .then((x) => {
              const filter = (m) => m.content.includes(message.content) && m.author.id === message.author.id;

              const collector = x.channel.createMessageCollector(filter, {
                time: 14000,
                max: 1,
              });

              collector.on("collect", async (m) => {
                owo.send(m.content).catch(() => {});
              })
              collector.on("end", async (m) => {
                await db.delete(`owoChannel.${guild.id}`);
                owo.send(owner+", I closed the system so that the account will not be banned from the owo bot because you did not reply for a long time, please reset the channel.").catch(() => {});
              })

            }).catch(async() => {
              if (!kanal) return;
              await db.delete(`owoChannel.${guild.id}`);
              kanal.send(`${owner} You should have opened your dm message box for me I can't let you know...\nI closed the system so that the account will not be banned from the owo bot because you did not reply for a long time, please reset the channel.`).catch(() => {});
            });
        }
      }
    }
});

bot.on("message", async (message) => {
  if (message.author.bot || !message.content.toLowerCase().startsWith(Prefix))
    return;

  if (message.author.id !== BotOwner) return;

  let args = message.content.split(" ").slice(1);
  let command = message.content.split(" ")[0].slice(Prefix.length);

  let data = await database.get(`owoSystem.${message.guild.id}`);
  let owoChannelData = await database.get(`owoChannel.${message.guild.id}`);
  let otoSell = await database.get(`otoSell.${message.guild.id}`);
  let kanal = bot.channels.get(owoChannelData);
  let owo = bot.users.get(OwoBotID);

  if (command === "owo") {
message.delete().catch(() => {});
    if (!args[0])
      return message.channel
        .send(
          `You need to specify an incorrect use argument.\nYou can check the Correct Usage in the help menu. **${Prefix}help**`
        )
        .then((x) => x.delete(15000).catch(() => {}))
        .catch(() => {});

    if (args[0] === "start") {
      if (data)
        return message.channel
          .send(`The OwO system is already on?`)
          .then(
            (x) => x.delete(15000).catch(() => {}),
            message.delete().catch(() => {})
          )
          .catch(() => {});

      if (!owoChannelData)
        return message.channel
          .send(
            `To start the OwO system, you must set the OwO channel. \`${Prefix}owo owo-chat #channel\``
          )
          .then(
            (x) => x.delete(15000).catch(() => {}),
            message.delete().catch(() => {})
          )
          .catch(() => {});

      await database.set(`owoSystem.${message.guild.id}`, "start");
      message.channel
        .send(`The owo system has been successfully opened, now I'm going to start running xp.\n**Dude, don't forget to define items and send some money to this account to earn more.**`)
        .then(
          (x) => x.delete(15000).catch(() => {}),
          message.delete().catch(() => {})
        )
        .catch(() => {});
    }

    if (args[0] === "stop") {
      if (!data)
        return message.channel
          .send(`OwO system is already down?`)
          .then(
            (x) => x.delete(15000).catch(() => {}),
            message.delete().catch(() => {})
          )
          .catch(() => {});

      await database.delete(`owoSystem.${message.guild.id}`);
      message.channel
        .send(`Successfully closed owo system, now I'll stop running xp.`)
        .then(
          (x) => x.delete(15000).catch(() => {}),
          message.delete().catch(() => {})
        )
        .catch(() => {});
    }

    if (args[0] === "status") {
      message.channel
        .send(`OwO system right now **${data ? `open` : `close`}** status.`)
        .then(
          (x) => x.delete(15000).catch(() => {}),
          message.delete().catch(() => {})
        )
        .catch(() => {});
    }

    if (args[0] === "owo-chat") {
      let kanal = message.mentions.channels.first() || bot.channels.get(args[1])

      if (args[1] === "reset") {
        await database.delete(`owoChannel.${message.guild.id}`);
        message.channel
          .send(`OwO channel succesfully **reseted**.`)
          .then(
            (x) => x.delete(15000).catch(() => {}),
            message.delete().catch(() => {})
          )
          .catch(() => {});

        return;
      }

      if (!kanal)
        return message.channel
          .send(`To set up OwO channel, you have to type or tag channel ID.`)
          .then(
            (x) => x.delete(15000).catch(() => {}),
            message.delete().catch(() => {})
          )
          .catch(() => {});

      if (owoChannelData)
        return message.channel
          .send(
            `OwO channel is already set. Do you want to reset? \`${Prefix}owo owo-chat reset\``
          )
          .then(
            (x) => x.delete(15000).catch(() => {}),
            message.delete().catch(() => {})
          )
          .catch(() => {});

      await database.set(`owoChannel.${message.guild.id}`, kanal.id);
      message.channel
        .send(`OwO channel succesfully **set**. Channel: ${kanal}\n**Dude, don't forget to define items and send some money to this account to earn more.**`)
        .then(
          (x) => x.delete(15000).catch(() => {}),
          message.delete().catch(() => {})
        )
        .catch(() => {});
    }

    if (args[0] === "money") {
      if (!kanal)
        return message.channel
          .send(
            `I cannot operate because the OwO channel is not set.\nYou can see how it is set in the Help menu.`
          )
          .then(
            (x) => x.delete(15000).catch(() => {}),
            message.delete().catch(() => {})
          )
          .catch(() => {});

      kanal
        .send(`owo cash`)
        .then(
          (x) => x.delete(15000).catch(() => {}),
          message.delete().catch(() => {})
        )
        .catch(() => {});

      const filter = (m) =>
        m.content.includes(bot.user.username) && m.author.id === OwoBotID;

      const collector = kanal.createMessageCollector(filter, { time: 15000 });
      collector.on("collect", (m) =>
        message.channel
          .send(m.content)
          .then((x) => x.delete(15000).catch(() => {}))
          .catch(() => {})
      );
    }

    if (args[0] === "message") {
      let mesaj = args.slice(1).join(" ");

      if (!mesaj)
        return message.channel
          .send("Please a write message.")
          .then(
            (x) => x.delete(15000).catch(() => {}),
            message.delete().catch(() => {})
          )
          .catch(() => {});

      message.react("✅").catch(() => {});

      message.channel
        .send(mesaj)
        .then(() => message.delete(3000).catch(() => {}))
        .catch(() => {});
    }

    if (args[0] === "dm-message") {
      let mesaj = args.slice(1).join(" ");

      if (!mesaj)
        return message.channel
          .send("Please a write message.")
          .then(
            (x) => x.delete(15000).catch(() => {}),
            message.delete().catch(() => {})
          )
          .catch(() => {});

      try {
        message.delete().catch(() => {});

        owo.send(mesaj);
      } catch (err) {
        message.channel
          .send(
            `You cannot send a message because the OwO bot does not send a private message.`
          )
          .then(
            (x) => x.delete(15000).catch(() => {}),
            message.delete().catch(() => {})
          )
          .catch(() => {});
      }
    }

    if (args[0] === "sell") {
      if (!kanal)
        return message.channel
          .send(
            `I cannot process because the OwO channel is not set.\nYou can see how it is set in the Help menu.`
          )
          .then(
            (x) => x.delete(15000).catch(() => {}),
            message.delete().catch(() => {})
          )
          .catch(() => {});

      message.delete().catch(() => {});
      kanal.send(`owo sell all`).catch(() => {});

      setTimeout(() => {
        kanal.send(`owo sell rareweapons`).catch(() => {});
      }, 5000);

      message.channel
        .send(`Successfully sold all **animals** and **items**.`)
        .then((x) => x.delete(15000).catch(() => {}))
        .catch(() => {});
    }

    if (args[0] === "zoo") {
      if (!kanal)
        return message.channel
          .send(
            `I cannot process because the OwO channel is not set.\nYou can see how it is set in the Help menu.`
          )
          .then(
            (x) => x.delete(15000).catch(() => {}),
            message.delete().catch(() => {})
          )
          .catch(() => {});

      kanal
        .send(`owo zoo`)
        .then(() => message.delete().catch(() => {}))
        .catch(() => {});
    }

    if (args[0] === "inv") {
      if (!kanal)
        return message.channel
          .send(
            `I cannot process because the OwO channel is not set.\nYou can see how it is set in the Help menu.`
          )
          .then(
            (x) => x.delete(15000).catch(() => {}),
            message.delete().catch(() => {})
          )
          .catch(() => {});

      kanal
        .send(`owo inv`)
        .then(() => message.delete().catch(() => {}))
        .catch(() => {});
    }

    if (args[0] === "use") {
      let use = args.slice(1).join(" ");

      if (!use)
        return message.channel
          .send(
            `To use an item, can you please write the item's code or number?`
          )
          .then(
            (x) => x.delete(15000).catch(() => {}),
            message.delete().catch(() => {})
          );

      message.channel.send(`owo use ${use}`).catch(() => {});
    }

    if (args[0] === "send-money") {
      let para = Number(args[1]);

      if (!kanal)
        return message.channel
          .send(
            `I cannot operate because the OwO channel is not set.\nYou can see how it is set in the Help menu.`
          )
          .then(
            (x) => x.delete(15000).catch(() => {}),
            message.delete().catch(() => {})
          )
          .catch(() => {});

      if (!para)
        return message.channel
          .send(`To send money, you must write how much you will send.`)
          .then(
            (x) => x.delete(15000).catch(() => {}),
            message.delete().catch(() => {})
          )
          .catch(() => {});

      if (para < 0)
        return message.channel
          .send(`You must write a positive number.`)
          .then(
            (x) => x.delete(15000).catch(() => {}),
            message.delete().catch(() => {})
          )
          .catch(() => {});

      kanal.send(`owo send <@!${BotOwner}> ${para}`);

      message.channel
        .send(
          `The transaction has been made and if there is as much money as you have written in the account, the transaction has been sent.`
        )
        .then(
          (x) => x.delete(15000).catch(() => {}),
          message.delete().catch(() => {})
        )
        .catch(() => {});
    }

    if (args[0] === "auto-sell") {
      if (!args[1])
        return message.channel
          .send(
            `You need to write an argument. Correct usage: \`${Prefix}owo auto-sell (open, close)\` you can write.`
          )
          .then(
            (x) => x.delete(15000).catch(() => {}),
            message.delete().catch(() => {})
          )
          .catch(() => {});

      if (args[1] === "open") {
        if (otoSell)
          return message.channel
            .send(`This system is already open.`)
            .then(
              (x) => x.delete(15000).catch(() => {}),
              message.delete().catch(() => {})
            )
            .catch(() => {});

        await database.set(`otoSell.${message.guild.id}`, "open");
        message.channel
          .send(`Successfully opened the auto sales system.`)
          .then(
            (x) => x.delete(15000).catch(() => {}),
            message.delete().catch(() => {})
          )
          .catch(() => {});
      }

      if (args[1] === "close") {
        if (!otoSell)
          return message.channel
            .send(`This system is already closed.`)
            .then(
              (x) => x.delete(15000).catch(() => {}),
              message.delete().catch(() => {})
            )
            .catch(() => {});

        await database.delete(`otoSell.${message.guild.id}`);
        message.channel
          .send(`Successfully closed the auto sales system.`)
          .then(
            (x) => x.delete(15000).catch(() => {}),
            message.delete().catch(() => {})
          )
          .catch(() => {});
      }
    }
  }


  if (command === "settings") {
    message.channel
      .send(
        `**BOT SETTINGS:** \n\nOwO System: ${
          data ? `✅` : `❌`
        }\nAuto Sell: ${
          otoSell ? `✅` : `❌`
        }\nOwO Channel: ${
          owoChannelData ? `<#${owoChannelData}>` : `**Not set**`
        }`
      )
      .then(
        (x) => x.delete(15000).catch(() => {}),
        message.delete().catch(() => {})
      )
      .catch(() => {});
  }

  if (command === "help") {
    message.channel
      .send(
        `**Help Menu:**\n\n\`${Prefix}owo start\` | You can start the OwO system.\n\`${Prefix}owo stop\` | You can stop the OwO system.\n\`${Prefix}owo status\` | You can check whether the system is on or off. \n\`${Prefix}owo owo-chat\` | You can set or reset the channel where OwO will play. (\`${Prefix}owo owo-chat reset\`)\n\`${Prefix}owo money\` | You can check how much money the account has.\n\`${Prefix}owo message\` | You can send a private message to the channel you set.\n\`${Prefix}owo dm-message\` | You can send a private message to the OwO bot.\n\`${Prefix}owo sell\` | You can sell your belongings and animals.\n\`${Prefix}owo zoo\` | You can control all your animals.\n\`${Prefix}owo inv\` | You can check your OwO inventory.\n\`${Prefix}owo use\` | You can use the items in the OwO inventory.\n\`${Prefix}owo send-money\` | You can send money to your own account as much as you specify.\n\`${Prefix}owo auto-sell\` | You can automatically sell the animals in the OwO bot after a certain time.`
      )
      .then(
        (x) => x.delete(15000).catch(() => {}),
        message.delete().catch(() => {})
      )
      .catch(() => {});
  }
});

bot.on("ready", async () => {
  let guild = bot.guilds.get(GuildID);
  if (!guild) return;

  setInterval(async () => {
    let data = await database.get(`owoSystem.${guild.id}`);
    let owoChannelData = await database.get(`owoChannel.${guild.id}`);
    let kanal = bot.channels.get(owoChannelData);

    let user = UserID[Math.floor(Math.random() * UserID.length)] || BotOwner
    let write = Writes[Math.floor(Math.random() * Writes.length)]
    let msg = [
      "owoh",
      `owo hug <@!${user}>`,
      `owoh`,
      `owo lick <@!${user}>`,
      `owo cash`,
      `owoh`,
      `${write}`,
      "owoh",
      `owo hug <@!${user}>`,
      `owoh`,
      `owo lick <@!${user}>`,
      `owo cash`,
      `owoh`,
      `${write}`
    ];

    let random = msg[Math.floor(Math.random() * msg.length)];

    if (!kanal) return;

    if (data && data === "start") {
      kanal.send(random).catch(() => {});
    }
  }, 20000);

  setInterval(async () => {
    let otoSell = await database.get(`otoSell.${guild.id}`);
    let owoChannelData = await database.get(`owoChannel.${guild.id}`);
    let kanal = bot.channels.get(owoChannelData);

    if (!kanal) return;
    if (otoSell && otoSell === "open") {
      kanal.send(`owo sell all`).catch(() => {});

      setTimeout(() => {
        kanal.send(`owo sell rareweapons`).catch(() => {});
      }, 5000);
    }
  }, 200000);
});

bot
  .login(Token)
  .then(() => pogger.warning(chalk.red("[SELF-BOT] Successfully activated!")))
  .catch((err) =>
    pogger.info(
      chalk.cyan("[SELF-BOT] Failed to activate. \nError: " + err)
    )
  );

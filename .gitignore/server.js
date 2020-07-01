//********prérequi & module********//
const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const sauvegarde = JSON.parse(fs.readFileSync("./sauvegarde.json"));
const warns = JSON.parse(fs.readFileSync("./warns.json"));
const mute = JSON.parse(fs.readFileSync("./mute.json"));
const warnstaff = JSON.parse(fs.readFileSync("./warnstaff.json"));
const express = require("express");
const ms = require("ms");
const clientDiscord = new Discord.Client();
const Ytdl = require("ytdl-core");
const usersMap = new Map();
var raidmode = "False";
let co = false;
let cooldown = new Set();
let cdseconds = 600;

var prefix = "=";
const app = express();

app.get("/", (request, response) => {
  console.log("Ping reçu !");
  response.sendStatus(200);
});

const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

client.setMaxListeners(90);
client.login("NzA4OTY3NjI2NzYzOTI3NTUz.Xvcqcw.S6kIvfp1fpHMVeJZInsAMsC9SD4");


client.on("ready", async message => {
  console.log("bot connecté !");
  let statu = [`${prefix}help | I'm bot !`, `${prefix}help | Bot codé en JavaScript !`]
  setInterval(() => {
    client.user.setActivity(statu[Math.floor(Math.random() * statu.length)])
  }, 10*1000)
})


//********modération********//
client.on("message", function(message) {
  let args = message.content.trim().split(/ +/g);
  if (args[0].toLowerCase() === prefix + "clear") {
    let moderator = message.author;
    if (message.author.bot) return;
    if (!message.member.hasPermission("MANAGE_MESSAGES"))
      return message.channel.send(
        ":x: **Vous n'avez pas la permission d'utiliser cette commande** :x:"
      );
    let count = parseInt(args[1]);
    if (!count)
      return message.channel.send(
        ":x: **Veuillez indiquer un nombre de messages à supprimer** :x:"
      );
    if (isNaN(count))
      return message.channel.send(
        ":x: **Veuillez indiquer un nombre valide** :x:"
      );
    if (count < 1 || count > 100)
      return message.channel.send(
        ":x: **Veuillez indiquer un nombre entre 1 et 100** :x:"
      );
    message.channel.bulkDelete(count + 1, true);
    message.channel
      .send(
        `:white_check_mark: **${count}** messages ont été supprimé par ${moderator}`
      )
      .then(msg => msg.delete({ timeout: 2000 }));
    console.log("commande clear éxécutée");
  }
});

client.on("message", function(message) {
  let args = message.content.trim().split(/ +/g);
  if (args[0].toLowerCase() === prefix + "mute") {
    console.log("commande mute éxécutée");
    if (message.author.bot) return;
    let moderator = message.author;
    if (!message.member.hasPermission("MANAGE_MESSAGES")) {
      var embed = new Discord.MessageEmbed()
        .setDescription(
          " Vous n'avez pas la permission d'utiliser cette commande"
        )
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    let reason = args.slice(2).join(" ");
    if (!reason) {
      var embed = new Discord.MessageEmbed()
        .setDescription("**Veuillez indiquer une raison**")
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    let member = message.mentions.members.first();
    if (!member) {
      var embed = new Discord.MessageEmbed()
        .setDescription("veuillez mentionner un utilisateur")
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    if (
      message.member.roles.highest.rawPosition <=
      member.roles.highest.rawPosition
    ) {
      var embed = new Discord.MessageEmbed()
        .setDescription(
          "vous n'avez pas la permission d'utiliser cette commande"
        )
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    if (!member.manageable) {
      var embed = new Discord.MessageEmbed()
        .setDescription("je n'ai pas la permission de mute ce membre")
        .setColor("#E95132");
      return message.channel.send(embed);
    }

    let muterole = message.guild.roles.cache.find(
      role => role.name === "Muted"
    );
    if (muterole) {
      member.roles.add(muterole);
      var embed = new Discord.MessageEmbed()
        .setColor("04DF75")
        .setDescription(
          `${member} a été mute pour **${reason}** par **${moderator}**`
        );
      message.guild.channels.cache.get("712316854093348884").send(embed);
      if (!mute[member.id]) {
        mute[member.id] = [];
      }
      mute[member.id].unshift({
        mute: 1,
        mod: message.author.id
      });
      fs.writeFileSync("./mute.json", JSON.stringify(mute));
      var embed = new Discord.MessageEmbed()
        .setDescription(`**__${member}__ a été mute** pour : **${reason}**`)
        .setColor("#16D31B")
        .setTimestamp(Date.now());
      message.channel.send(embed);
    } else {
      message.guild
        .createRole({ name: "Muted", permissions: 0 })
        .then(function(role) {
          message.guild.channels
            .filter(channel => channel.type === "text")
            .forEach(function(channel) {
              channel.createOverwrite(role, {
                SEND_MESSAGES: false
              });
            });
          member.roles.cache.add(role);
          var embed = new Discord.MessageEmbed()
            .setDescription(`**__${member}__ a été mute pour **${reason}**`)
            .setColor("#16D31B")
            .setTimestamp(Date.now());
          message.channel.send(embed);
        });
    }
  }
});

client.on("message", function(message) {
  let args = message.content.trim().split(/ +/g);
  if (args[0].toLowerCase() === prefix + "unmute") {
    if (message.author.bot) return;
    let moderator = message.author;
    if (!message.member.hasPermission("MANAGE_MESSAGES")) {
      var embed = new Discord.MessageEmbed()
        .setDescription(
          ":x: **Vous n'avez pas la permission d'utiliser cette commande**"
        )
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    let member = message.mentions.members.first();
    if (!member) {
      var embed = new Discord.MessageEmbed()
        .setDescription(" veuillez mentionner un utilisateur")
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    if (
      message.member.roles.highest.rawPosition <=
      member.roles.highest.rawPosition
    ) {
      var embed = new Discord.MessageEmbed()
        .setDescription("vous n'avez pas la permission de mute ce membre")
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    if (!member.manageable) {
      var embed = new Discord.MessageEmbed()
        .setDescription("je n'ai pas la permission d'utiliser cette commande")
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    mute[member.id].shift();
    fs.writeFileSync("./mute.json", JSON.stringify(warns));
    let muterole = message.guild.roles.cache.find(
      role => role.name === "Muted"
    );
    if (muterole && member.roles.cache.has(muterole.id))
      member.roles.remove(muterole);
    var embed = new Discord.MessageEmbed()
      .setColor("04DF75")
      .setDescription(`${member} a été unmute par ${moderator}`);
    message.guild.channels.cache.get("712316854093348884").send(embed);
    var embed = new Discord.MessageEmbed()
      .setDescription(`**__${member}__ a été unmute**`)
      .setColor("#25DF04")
      .setTimestamp(Date.now());
    message.channel.send(embed);
    console.log("commande unmute éxécutée");
  }
});

client.on("message", function(message) {
  if (!message.guild) return;
  let args = message.content.trim().split(/ +/g);

  if (args[0].toLowerCase() === prefix + "warn-staff") {
    if (message.author.bot) return;
    let moderator = message.author;
    if (!message.member.hasPermission("MANAGE_MESSAGES")) {
      var embed = new Discord.MessageEmbed()
        .setColor("E95132")
        .setDescription(
          "Vous n'avez pas la permission d'utiliser cette commande"
        )
        .setFooter(
          "Cette commande est disponible qu'aux Administrateurs, et au Fondateur"
        );
      return message.channel.send(embed);
    }
    let member = message.mentions.members.first();
    if (!member) {
      var embed = new Discord.MessageEmbed()
        .setColor("E95132")
        .setDescription("Veuillez mentionner un utilisateur");
      return message.channel.send(embed);
    }
    if (!member.roles.cache.find(r => r.name === "staff d'H")) {
      var embed = new Discord.MessageEmbed()
        .setColor("E95132")
        .setDescription("Cette personnes ne fait pas parti du staff");
      return message.channel.send(embed);
    }
    if (
      message.member.roles.highest.rawPosition <=
      member.roles.highest.rawPosition
    ) {
      var embed = new Discord.MessageEmbed()
        .setColor("E95132")
        .setDescription(
          "Vous n'avez pas la permission pour mettre un warn-staff à cette personne"
        );
      return message.channel.send(embed);
    }
    let reason = args.slice(2).join(" ");
    if (!reason) {
      var embed = new Discord.MessageEmbed()
        .setColor("E95132")
        .setDescription("Veuillez indiquer une raison");
      return message.channel.send(embed);
    }
    if (!warnstaff[member.id]) {
      warnstaff[member.id] = [];
    }
    warnstaff[member.id].unshift({
      reason: reason,
      date: Date.now(),
      mod: message.author.id
    });
    fs.writeFileSync("./warnstaff.json", JSON.stringify(warnstaff));
    var embed = new Discord.MessageEmbed()
      .setColor("04DF75")
      .setDescription(
        `${member} a reçut un warn staff pour **${reason}** par ${moderator}`
      );
    message.guild.channels.cache.get("712316854093348884").send(embed);
    var embed = new Discord.MessageEmbed()
      .setColor("16D31B")
      .setDescription(`${member} a bien reçut un warn staff pour ${reason}`);
    message.channel.send(embed);
  }

  if (args[0].toLowerCase() === prefix + "infractions-staff") {
    message.delete();
    if (message.author.bot) return;
    if (!message.member.hasPermission("MANAGE_MESSAGES")) {
      var embed = new Discord.MessageEmbed()
        .setColor("E95132")
        .setDescription(
          "Vous n'avez pas la permission d'utiliser cette commande"
        );
      return message.channel.send(embed);
    }
    let member = message.mentions.members.first();
    if (!member) {
      var embed = new Discord.MessageEmbed()
        .setColor("E95132")
        .setDescription("Veuillez mentionner un utilisateur");
      return message.channel.send(embed);
    }
    var embed = new Discord.MessageEmbed()
      .setColor("16D31B")
      .setAuthor(member.user.username, member.user.displayAvatarURL())
      .addField(
        "10 DERNIERS WARNS STAFF :",
        warnstaff[member.id] && warnstaff[member.id].length
          ? warnstaff[member.id].slice(0, 10).map(e => e.reason)
          : "Ce member n'a aucun warn staff"
      )
      .setTimestamp(Date.now())
      .setThumbnail(member.user.displayAvatarURL())
      .setFooter("3 warns-staff = exclusion, tout comme 3 warns au règlement.")
      .setColor("F1B302")
      .setThumbnail(
        "https://cdn.discordapp.com/icons/627513964514770974/45c58c7591777814d644f02f11728236.png?size=2048"
      );
    message.channel.send(embed);
  }
});

client.on("message", function(message) {
  if (!message.guild) return;
  let args = message.content.trim().split(/ +/g);

  if (args[0].toLowerCase() === prefix + "warn") {
    if (message.author.bot) return;
    let moderator = message.author;
    if (!message.member.permissions.has("MANAGE_MESSAGES")) {
      var embed = new Discord.MessageEmbed()
        .setDescription(
          "Vous n'avez pas la permission d'utiliser cette commande"
        )
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    let member = message.mentions.members.first();
    if (!member) {
      var embed = new Discord.MessageEmbed()
        .setDescription(":x: **Veuillez mentionner un utilisateur**")
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    if (
      message.member.roles.highest.rawPosition <=
      member.roles.highest.rawPosition
    ) {
      var embed = new Discord.MessageEmbed()
        .setDescription("vous n'avez pas la permission de warn ce membre")
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    let reason = args.slice(2).join(" ");
    if (!reason) {
      var embed = new Discord.MessageEmbed()
        .setDescription("**Veuillez indiquer une raison**")
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    if (!warns[member.id]) {
      warns[member.id] = [];
    }
    warns[member.id].unshift({
      reason: reason,
      date: Date.now(),
      mod: message.author.id
    });
    fs.writeFileSync("./warns.json", JSON.stringify(warns));
    var embed = new Discord.MessageEmbed()
      .setColor("04DF75")
      .setDescription(
        `**${member}** a été warn pour **${reason}** par ${moderator}`
      );
    message.guild.channels.cache.get("712316854093348884").send(embed);
    var embed = new Discord.MessageEmbed()
      .setDescription(`**__${member}__ warn pour __${reason}__**`)
      .setColor("#16D31B")
      .setTimestamp(Date.now());
    message.channel.send(embed);
  }

  if (args[0].toLowerCase() === prefix + "infractions") {
    message.delete();
    if (message.author.bot) return;
    if (!message.member.hasPermission("SEND_MESSAGES")) {
      var embed = new Discord.MessageEmbed()
        .setDescription(
          ":x: **Vous n'avez pas la permission d'utiliser cette commande**"
        )
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    let member = message.mentions.members.first();
    if (!member) {
      var embed = new Discord.MessageEmbed()
        .setDescription(":x: **Veuillez mentionner un utilisateur**")
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    var embed = new Discord.MessageEmbed()
      .setAuthor(member.user.username, member.user.displayAvatarURL())
      .addField(
        "10 DERNIERS WARNS :",
        warns[member.id] && warns[member.id].length
          ? warns[member.id].slice(0, 10).map(e => e.reason)
          : ":x: **Ce membre n'a aucun warn**"
      )
      .setTimestamp(Date.now())
      .setColor("#25DF04")
      .setThumbnail(member.user.displayAvatarURL())
      .setFooter("j'espère que tu n'auras jamais de warn")
      .setColor("#F1B302")
      .setThumbnail(
        "https://discordapp.com/channels/627513964514770974/627541289952477184/725094200063950938"
      );
    message.channel.send(embed);
    console.log("commande infractions exécutée");
  }
});

client.on("message", function(message) {
  let args = message.content.trim().split(/ +/g);
  if (args[0].toLowerCase() === prefix + "ban") {
    if (message.author.bot) return;
    let moderator = message.author;
    if (!message.member.hasPermission("BAN_MEMBERS")) {
      var embed = new Discord.MessageEmbed()
        .setDescription(
          ":x: **Vous n'avez pas la permission d'utiliser cette commande**"
        )
        .setColor("RED");
      return message.channel.send(embed);
    }
    let member = message.mentions.members.first();
    if (!member) {
      var embed = new Discord.MessageEmbed()
        .setDescription(":x: **Veuillez mentionner un utilisateur**")
        .setColor("RED");
      return message.channel.send(embed);
    }
    if (
       message.member.roles.highest.rawPosition <=
      member.roles.highest.rawPosition
    ) {
      var embed = new Discord.MessageEmbed()
        .setDescription(
          "vous n'avez pas la permission pour bannir cet utilisateur"
        )
        .setColor("RED");
      return message.channel.send(embed);
    }
    let reason = args.slice(2).join(" ");
    if (!reason) {
      var embed = new Discord.sendEmbed()
        .setDescription("**Veuillez indiquer une raison**")
        .setColor("RED");
      return message.channel.send(embed);
    }
    if (!member.bannable) {
      var embed = new Discord.MessageEmbed()
        .setDescription("je n'ai pas la permission pour bannir cet utilisateur")
        .setColor("RED");
      return message.channel.send(embed);
    }
    message.guild.ban(member, reason, { days: 7 });
    member.createDM().then(channel => {
      channel.send(
        `Bonjour vous avez été banni de HamiCitia pour **${reason}** de façon permanante, si vous voulez contester ce ban, contactez **Polac154856#1775** ou **Blobman38#3865**`
      );
    });
    var embed = new Discord.MessageEmbed()
      .setColor("04DF75")
      .setDescription(
        `${member} a été banni du serveur pour **${reason}** par ${moderator}`
      );
    message.channels.cache.get("712316854093348884").send(embed);
    var embed = new Discord.MessageEmbed()
      .setDescription(
        `**__${member.user.username}__** a été banni pour **${reason}**`
      )
      .setColor("GREEN")
      .setTimestamp(Date.now());
    message.channel.send(embed);
    console.log("commande ban éxécutée");
  }
});

client.on("message", function(message) {
  if (!message.guild) return;
  let args = message.content.trim().split(/ +/g);

  if (args[0].toLowerCase() === prefix + "kick") {
    if (message.author.bot) return;
    let moderator = message.author;
    if (!message.member.hasPermission("KICK_MEMBERS")) {
      var embed = new Discord.MessageEmbed()
        .setDescription(
          ":x: **Vous n'avez pas la permission d'utiliser cette commande** :x:"
        )
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    let member = message.mentions.members.first();
    if (!member) {
      var embed = new Discord.MessageEmbed()
        .setDescription(":x: **Veuillez mentionner un utilisateur**")
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    if (
      message.member.roles.highest.rawPosition <=
      member.roles.highest.rawPosition
    ) {
      var embed = new Discord.MessageEmbed()
        .setDescription(
          ":x: **Vous n'avez pas la permission de kick ce membre'"
        )
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    if (!member.kickable) {
      var embed = new Discord.MessageEmbed()
        .setDescription("je n'ai pas la permission de kick ce membre")
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    let reason = args.slice(2).join(" ");
    if (!reason) {
      var embed = new Discord.MessageEmbed()
        .setDescription("Veuillez indiquer une raison")
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    if (!warns[member.id]) {
      warns[member.id] = [];
    }
    warns[member.id].unshift({
      reason: reason,
      date: Date.now(),
      mod: message.author.id
    });
    member.kick(reason);
    member.createDM().then(channel => {
      channel.send(
        `Bonjour vous avez été expulsé de HamiCitia pour **${reason}**, si vous voulez contester ce kick contactez **Polac154856#1775**`
      );
    });
    var embed = new Discord.MessageEmbed()
      .setColor("04DF75")
      .setDescription(
        `** ${member}** a été kick pour **${reason}** par ${moderator}`
      );
    message.guild.channels.cache.get("712316854093348884").send(embed);
    var embed = new Discord.MessageEmbed()
      .setDescription(
        `**__${member.user.username}__ a été exclu pour __${reason}__**`
      )
      .setColor("#25DF04")
      .setTimestamp(Date.now());
    message.channel.send(embed);
    console.log("commande kick éxécutée");
  }
});

client.on("message", function(message) {
  let args = message.content.trim().split(/ +/g);
  if (args[0].toLowerCase() === prefix + "unwarn") {
    if (message.author.bot) return;
    let moderator = message.author;
    let member = message.mentions.members.first();
    if (!message.member.hasPermission("ADMINISTRATOR")) {
      var embed = new Discord.MessageEmbed()
        .setColor("#E95132")
        .setDescription(
          "Vous n'avez pas la permission d'utiliser cette commande"
        )
        .setFooter("La permission Administrateur est nécessaire");
      return message.channel.send(embed);
    }
    if (!member) {
      var embed = new Discord.MessageEmbed()
        .setColor("#E95132")
        .setDescription("veuillez mentionner un utilisateur");
      return message.channel.send(embed);
    }
    if (
message.member.roles.highest.rawPosition <=
      member.roles.highest.rawPosition
    ) {
      var embed = new Discord.MessageEmbed()
        .setColor("#E95132")
        .setDescription("Vous ne pouvez pas unwarn cet utilisateur");
      return message.channel.send(embed);
    }
    if (!member.manageable)
      return message.channel.send("Je ne peut pas unwarn ce membre.");

    if (!warns[member.id] || !warns[member.id].length) {
      var embed = new Discord.MessageEmbed()
        .setColor("#E95132")
        .setDescription("Cet utilisateur n'a pas de warn");
      return message.channel.send(embed);
    }
    warns[member.id].shift();
    fs.writeFileSync("./warns.json", JSON.stringify(warns));
    var embed = new Discord.MessageEmbed()
      .setColor("04DF75")
      .setDescription(
        `Le dernier warn de ${member} a été retiré par ${moderator}`
      );
    message.guild.channels.cache.get("712316854093348884").send(embed);
    var embed = new Discord.MessageEmbed()
      .setColor("#25DF04")
      .setDescription(`Le dernier warn de ${member} a été retiré`)
      .setFooter("c'est une chance pour toi fais attention !");
    message.channel.send(embed);
  }
});


client.on("message", async message => { 
if(message.channel.id === "709054977334706227") return
if(message.channel.id === "709055117462077736") return
if(message.channel.id === "693050891187650570") return
if(message.channel.id === "717438198141419561") return
            
  let member = message.member
  let reason = "spam [anti-spam intelligent]"
  if(usersMap.has(message.author.id)) {
    let userData = usersMap.get(message.author.id);
    let msgCount = userData.msgCount;
  if(parseInt(msgCount) === 5) {
    await message.author.send(`Vous avez été expulsé de **HamiCitia** car vous avec **${reason}**`)
    await member.kick(reason)
    await message.channel.send(`**${message.author.username}** a été expulsé pour spam !`)
    var embed = new Discord.MessageEmbed()
    .setColor("04DF75")
    .setDescription(`${message.author} a été kick pour **${reason}**`)
    await message.channels.cache.get("712316854093348884").send(embed)
  } else {
    msgCount++;
    userData.msgCount = msgCount;
    usersMap.set(message.author.id, userData);
    }
  }
  else {
    usersMap.set(message.author.id, {
      msgCount: 1,
      lastMessage: message,
      timer: null
    });
    setTimeout(()=> {
      usersMap.delete(message.author.id);
    }, 5000)
  }
})


client.on("message", async message => {
  if (message.content.startsWith(prefix + "RaidMode")) {
    if (!message.member.hasPermission("ADMINISTRATOR"))
      return message.channel.send(
        "Vous n'avez pas la permission d'utiliser cette commande"
      );
    let messageArray = message.content.split(" ");
    let args = messageArray.slice(1);
    let etat = args.join(" ").slice(0);

    if (!etat) {
      let embed = new Discord.MessageEmbed()
        .setTitle("INFOS SUR LE RAIDMODE")
        .setDescription(
          "Pour activer le système : **True**\nPour désactiver le système : **False**"
        )
        .addField(`Etats du système : ${raidmode}`)
        .setColor("#EC00FF");
      return message.channel.send(embed);
    } else if (etat == "False") {
      raidmode = "False";
      message.reply("Le système a bien été désactivé !");
      console.log(raidmode);
    } else if (etat == "True") {
      raidmode = "True";
      message.reply("Le système a bien été activé !");
      console.log(raidmode);
    }
  }
});

client.on("guildMemberAdd", async member => {
  if (raidmode == "True") {
    try {
      await member.send(
        "Bonjour, vous ne pouvez pas rejoindre le serveur **HamiCitia** car le RaidMode est activé ! Réessayez plus tard !"
      );
      await member.kick();
     var embed = new Discord.MessageEmbed()
    .setColor("04DF75")
    .setDescription( `${member} n'a pas pu rejoindre le serveur car le RaidMode est activé !`)
    await member.guild.channels.cache
      .get("712316854093348884")
      .send(
        embed
      );
    } catch (error) {
      console.log(error);
    }
    await member.guild.channels.cache.get("627518189324206080").send(`${member} a voulu rejoindre le serveur mais a été expulsé car le RaidMode est activé`)
    await member.send(
      "Bonjour, vous ne pouvez pas rejoindre le serveur **HamiCitia** car le RaidMode est activé ! Réessayez plus tard !"
    );
    await member.kick();
    var embed = new Discord.MessageEmbed()
    .setColor("04DF75")
    .setDescription( `${member} n'a pas pu rejoindre le serveur car le RaidMode est activé !`)
    await member.guild.channels.cache
      .get("712316854093348884")
      .send(
        embed
      );
  }
});


client.on("message", message => {
  if (message.content.startsWith(prefix + "sendMP")) {
    message.delete();
    if (!message.member.hasPermission("ADMINISTRATOR"))
      return message.reply(
        "Vous n'avez pas la permission d'utiliser cette commande"
      );
    let messageArray = message.content.split(" ");
    let args = messageArray.slice(1);
    let User = message.mentions.members.first();
    if (!User) return message.reply("Veuillez mentionner un utilisateur");
    let dUser = User.id;
    let reason = args.join(" ").slice(22);
    if (!reason) return message.channel.send("veuillez préciser un message !");

    User.send(reason);
    message.channel.send("Message envoyé").then(msg => msg.delete({ timeout: 3000 }));
  }
});







//********arrivé-départ********//
client.on("guildMemberAdd", member => {
  if(raidmode === "True") return
  client.channels.cache
    .get("627518189324206080")
    .send(
      `Salut ${member} dans **HamiCitia** j'espère que tu va t'y plaire, va lire le règlement et passe un bon moment :wink: ! Il y a des rôles à prendre dans <#627880125488431115>`
    );
  member.roles.add("627519871244173326");
  console.log("+1 membre");
});

client.on("guildMemberRemove", member => {
  member.guild.channels.cache
    .get("627518189324206080")
    .send(`Malheureusement **${member.user.username}** nous a quitté :sob:...`);
  console.log("-1 membre");
});







//********messages********//
client.on("message", message => {
  if (message.content === prefix + "help") {
    message.delete();
    let member = message.author;
    var embed = new Discord.MessageEmbed()
      .setColor("0E04DF")
      .setDescription(
        "**COMMANDE FUN** \n \n \n 1 : **HamiCitia (sans préfix) :** plus de 150 membres \n \n 2 : **=la raclette du soir :** Vive la raclette ! \n \n 3 : **=soirée tartiflette :** vive la tartiflette 4 : **=blague :** pour avoir des blagues drôles (ou pas) \n \n 5 : **=histoire drôle :** pour avoir des histoires drôles \n \n 6 : **=citation drôle :** pour avoir des citations drôles \n \n 7 : **gif (sans préfix) :** pour avoir des gif \n \n 8 : **=cadeau : ** à faire dans <#627537260652527670> \n \n 9 : **=join :**  pour que le bot vienne dans votre salon (impératif pour que HamiBot chante) \n \n 10 : **=disconnect : **  pour que déconnecter le bot d'un salon vocal, et que le bot ne chantes plus \n \n 11 : **=p  [un liens youtube ( pas de nom de musique, ni autre liens que youtube)] pour que le bot chante** \n \n 12 : **HamiBot (sans préfixe):** pour avoir les infos sur le bot \n \n 13 : **=SalonT [nom] :** pour crée votre propre salon textuel \n \n 14 : **=SalonV [nom] :** pour crée votre propre salon vocal \n \n 15 : **=sauvegarde [text]** pour sauvegarder du text \n \n 16 : **=ma-sauvegarde** pour voir vos sauvegarde \n \n 17 : **=dé-sauvegarde** pour supprimer votre dernière sauvegarde \n \n \n **COMMANDE PRATIQUE ET UTILE** 1 : **=secours :** pour avoir les secours d'urgence français \n \n 2 :** =say :** le bot dira ce que vous dites \n \n 3 : **vérification (sans préfixe) :** il faut avoir le rôle non_vérifié pour avoir accès à la commande \n \n 5 : **=pub :** pour connaitre la pub du serveur \n \n 6 : **=serveur-info :** (commande en développement) \n \n 7 : **=staff :** pour savoir comment devenir staff \n \n 8 : **=préfixe-bot :** pour voir les infos sur tous les bots du serveur \n \n 9 : **=information :** pour avoir des infos sur HamiCitia \n \n 10 : **=sugg [votre suggestion]** \n \n 11 : **=addblague [votre blague]** \n \n 12 : **=serveur-info :** pour avoir les inforamtions relative au serveur \n \n 13 : **=new [raison] : ** pour les tickets"
      )
      .setFooter("Profitez bien dans commandes mises à disposition");
    member.send(embed);
          var embed = new Discord.MessageEmbed()
  .setColor("0E04DF")
  .setTitle("Commande personnalisé !")
  .setDescription("1 : **=Boss :** la commande de BossXxLightxX \n \n 2 : **=satan :**  la commande de zachcc1 \n \n 3 : **=breton :** la commande de Ataka")
  member.send(embed);
    message.channel
      .send(
        "Commande d'aide envoyé en MP, si vous n'avez rien reçut, vérifiez bien que vous avez autorisé les MP venant du serveur !"
      )
      .then(msg => msg.delete({ timeout: 10000 }));
    if (!message.member.roles.cache.find(r => r.name === "staff d'H")) return;
    var embed = new Discord.MessageEmbed()
      .setColor("0E04DF")
      .setDescription(
        "**COMMANDE DE MODERATION** \n \n \n 1 : **=mute :** pour empêcher un membrede parler \n \n 2 : **=ban :** pour bannir un membre insolent \n \n 3 : **=kick :** pour expulser quelqu'un du serveur \n \n 4 : **=warn :** pour avertir une personne \n \n 5 : **=clear :** pour supprimer des messages \n \n 6 : **=warn-staff :** pour que les admin sanctionnent les staffs \n \n 7 : **=infractions-staff :** pour voir les warn staff des gens 8 : **=warn-staff** pour mettre un warn aux staff moins gradés que soit \n \n \n **COMMANDE D'ADMINISTRATION** \n \n \n 1 : **=sendMP :** envoie un message en MP \n \n  2 : **=RaidMode :** en cas d'attaque de Raid"
      )
      .setFooter("Profitez bien dans commandes mises à disposition");
    member.send(embed);
  }
});

client.on("message", message => {
  if (message.content === "salut") {
    if (message.author.bot) return;
    message.channel.send("hey");
  }
});

client.on("message", message => {
  if (message.content === "moi aussi j'aime les pâtes !") {
    message.channel.send("trop bien !");
  }
});

client.on("message", message => {
  if (message.content === "tu vas bien ?") {
    message.channel.send("oui et toi ?");
  }
});

client.on("message", message => {
  if (message.content === "bien merci") {
    message.channel.send("cool");
  }
});

client.on("message", message => {
  if (message.content === "au revoir") {
    message.channel.send("bye");
  }
});

client.on("message", message => {
  if (message.content === "tu fais quoi ?") {
    message.channel.send("je regarde HamiCitia en attente d'une commande !");
  }
});

client.on("message", message => {
  if (message.content === "bonjour") {
    message.channel.send("salut");
  }
});

client.on("message", message => {
  if (message.content === "tu aimes quoi ?") {
    message.channel.send("Les pâtes !!");
  }
});

client.on("message", message => {
  if (message.content === prefix + "secours") {
    var embed = new Discord.MessageEmbed()
      .setColor("DF0404")
      .setTitle("Appelle d'urgence")
      .setFooter("Ceci concerne les secours de FRANCE")
      .setDescription(
        "-Les Pompiers : 18 \n \n -La Police/gendarmerie : 17 \n \n -Le Samu 15 \n \n -Le numéro qui regroupent tous : 112"
      );
    message.channel.send(embed);
    console.log("commande secours exécutée");
  }
});

client.on("message", message => {
  if (message.content === prefix + "pub") {
    message.delete();
    var embed = new Discord.MessageEmbed()
      .setColor("DF04D8")
      .setTitle("voici la publicité du serveur :")
      .setDescription(
        "```**---Houlou, Je fais la pub pour le serveur HamiCitia---** \n \n **But du serveur :** Serveur de discussion cool et détente :wink: \n \n 1- Serveur Actif :smiley: \n \n 2- Bien Organisé :raised_hand::smirk::ok_hand: \n \n 4- Staff a l'écoute :oncoming_police_car: \n \n 5- Et il y a des évents sympa :0 :tada::gift: \n \n 6- Un bot fait maison pour le serveur ! \n \n \n On peut juste remercier le staff, et les membres du serveur !! \n \n **Voilà le lien :** https://discord.gg/cB6SK2G \n \n Bonne journée/soirée :smiley:```"
      )
      .setFooter(
        "c'est très sympa de faire de la pub pour le serveur ! :wink:"
      );
    message.channel.send(embed);
    console.log("Vive les membres !");
  }
});

client.on("message", message => {
  if (message.content === prefix + "staff") {
    message.delete();
    message.channel.send(
      ` ** A POSTER DANS <#647557786175143967> ** \n \n \n le staff recrute \n nous attendons cette presentation dans #candidature-staff \n \n bonjour, je suis <votre pseudo>je me presente : \n \n présentation irl \n \n présentation ingame (dans discord, de puis combien de temps vous avez discord mtn) \n \n tes horaires \n \n  tes qualités \n tes defaults \n \n Avez vous moins de 3 warns ? (répondre par oui ou non) \n \n pourquoi te choisir ? \n \n Êtes vous levels 3 ? (Répondre par oui ou non) \n Puis mentionnez *@recruteur staff*  \n Si votre candidature est accepté vous serez modo test pendant 1 semain !`
    );
  }
});

let has = (a, b) => {
  for (let c in a) {
    if (b.includes(a[c])) return c;
  }
  return false;
};

client.on("message", message => {
  if (message.author.bot) {
    return false;
  } else {
    let widson = ["hamicitia", "Hamicitia", "HAMICITIA", "HamiCitia"],
      isBad = has(widson, message.content.toLowerCase());
    if (isBad) {
      message.channel.send("**Plus de 160 membres** :partying_face:");
      console.log("le mot HamiCitia a été prononcé");
    }
  }
});


client.on("message", message => {
  if(message.author.bot) {
    return false;
  }else{
    let ok = ["euh...", "euh", "Euh...", "Euh"],
        isBad = has(ok, message.content.toLowerCase());
    if (isBad) {
      message.channel.send(raidmode)
      console.log(`euh = ${raidmode}`)
    }
  }
})

client.on("message", message => {
  if (message.author.bot) {
    return false;
  } else {
    let widson = ["mee6", "Mee6", "Mee7", "mee7"],
      isBad = has(widson, message.content.toLowerCase());
    if (isBad) {
      message.channel.send("VIVE MEE6");
      console.log("le mot Mee6 a été prononcé");
    }
  }
});

client.on("message", message => {
  if (message.content === prefix + "la raclette du soir") {
    var embed = new Discord.MessageEmbed()
      .setColor("04DFD5")
      .setTitle("Ce soir c'est raclette pour tout le monde :tada: !!!!")
      .setDescription(
        "Une machine à raclette, du fromage, de la patate et de la charcuterie, la vie est belle ! Miam, trop bon la raclette !! :cheese: :cheese: :cheese: "
      )
      .setFooter("La France = le pays du fromage; Vive la France !");
    message.channel.send(embed);
  }
});

client.on("message", message => {
  if (message.content === prefix + "préfixe-bot") {
    var embed = new Discord.MessageEmbed()
      .setColor("DF0443")
      .setTitle(
        "voici les préfix de tout les bots du serveur et commande help :"
      )
      .setDescription(
        "-Le bot <@234395307759108106> avec comme préfixe ``-`` et comme commande help ``-`` \n \n -Le bot <@!235088799074484224> avec comme préfix ``+`` (préfixe personnalisé du serveur) et comme commande help ``+help`` \n \n -Le bot <@!294882584201003009> avec comme préfixe ``!g`` et comme commande help ``!ghelp`` \n \n -Le bot <@!583007624270708866> avec comme préfixe ``-`` et comme commande help ``-help`` \n \n -Le bot <@!466578580449525760> \n \n -Le bot <@!276060004262477825> avec comme préfixe ``^^`` et comme commande ``^^help`` \n \n -Le bot <@187636089073172481> comme préfixe ``!`` avec comme commande help ``!help`` \n \n -Le bot <@708967626763927553> avec comme préfixe ``=`` et comme commande help ``=help`` \n \n -Le bot <@!159985870458322944> avec comme préfix ``!`` et comme commande ``!help``"
      )
      .setFooter("Profite bien des bots mis à disposition");
    message.channel.send(embed);
    console.log("Vive les bots !!");
  }
});

client.on("message", message => {
  if (message.content.startsWith(prefix + "say")) {
    let args = message.content.split(" ").slice(1);
    let botmessage = args.join(" ");
    message.channel.send(botmessage);
    message.delete();
    console.log("commande say exécutée");
  }
});

client.on("message", message => {
  if (message.content === prefix) {
    message.channel.send(
      "``=`` est bien mon préfixe essayiez la commande ``=help``"
    );
  }
});

client.on("message", message => {
  if (message.content === prefix + "soirée tartiflette") {
    var embed = new Discord.MessageEmbed()
      .setColor("04DF93")
      .setTitle("Soirée tartiflette pour tout le monde :tada: !!")
      .setDescription(
        "De la patate, du fromage, du lard et du bonheur, c'est la vie la tartiflette !! :cheese: :cheese: :cheese:"
      )
      .setFooter("Vive le pays du fromage (la France)");
    message.channel.send(embed);
  }
});

client.on("message", async message => {
  const args = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g);
  let command = args.shift().toLowerCase();

  if (message.content.indexOf(prefix) !== 0) return;

  if (command == "avatar") {
    var user;
    user = message.mentions.users.first();
    if (!user) {
      if (!args[0]) {
        user = message.author;
        getuseravatar(user);
      } else {
        var id = args[0];
        client
          .fetchUser(id)
          .then(user => {
            getuseravatar(user);
          })
          .catch(error => console.log(error));
      }
    } else {
      getuseravatar(user);
    }
    function getuseravatar(user) {
      var embed = new Discord.MessageEmbed()
        .setColor("04DF18")
        .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
        .setDescription(`Voici la photo de profil de : **${user.username}**`);
      message.channel.send(embed);
    }
  }
});

//********divertissement********//
client.on("message", message => {
  if (message.content === prefix + "blague") {
    let blague = [
      "Un mec alcoolisé se fait contrôler par la police : \n \n \n ||– Bonjour Monsieur, police nationale ! ||\n ||– Bien fait pour ta gueule ! T’avais qu’à travailler à l’école !||",
      "c’est un putois qui rencontre un autre putois \n \n Et qui lui dit : ||« Tu pues toi »||",
      "Que crie un donut sur la plage ? \n \n ||Hey, je vais me beignet !!!||",
      "C’est l’histoire d’une girafe qui va dans un bar, **pour boir un coup**",
      "Qu'es ce qui est petit, carré et jaune ? \n \n ||Un petit carré jaune||",
      "Comment appelle-t-on un hibou constipé ? \n \n ||Un hibouche||",
      "Quel est la ville la plus proche de l'eau ? \n n ||Bordeaux||",
      "Si je télécharge illégalement depuis la Martinique, je suis un pirate des Caraïbe ?",
      "2 militaires discutent : « Pourquoi tu t’es engagé ? \n \n \n – Je suis célibataire et j’aime la guerre, et toi ? \n – Je suis marié et je voulais avoir la paix",
      "Qu'es ce qu'un douche sans eau ? \n \n ||un duche||",
      "J'ai raconté une blague à un Parisiens \n \n ||il a pas ri||",
      "Tu connais la blague du Diable ? ||Dommage elle est d'enfer||",
      "Es ce que les poissons aiment les blagues de papa ? \n \n ||Ils s'en fichent||",
      "t'a picolé hier ? \n \n ||- je ne me rappelle pas j'étais bourré||",
      "Que fait-on des voleurs de salages ? \n \n ||on laitue|| ",
      "Comment s'appelle la mamie qui fait peur aux voleurs ? \n \n ||Mamitraillette||",
      "Bonjour ! je souhaiterais une paire de lunettes svp ! \n \n ||- Pour le soleil|| \n ||- non, pour moi||",
      "Quel est la ville la plus vieille du monde ? \n \n ||Milan (1000ans)||",
      "Flemme",
      "Comment appelle-t-on une fracture du crâne ? \n \n ||Un dégât des os||",
      "Blague courte et drôle à mourir de rire - Liste de 1000 blagues gratuites \n \n ||Une pom-pom girl||",
      "J’ai fait une blague sur les magasins. Elle n'a pas supermarché",
      "« C’est bon mon maquillage ? » \n « Non, on te voit encore un peu »",
      "Quel est le nombre préféré des moustiques ? \n ||le 100 (sang)||",
      "Quand un électricien meurt, **il faut mettre sa famille au courant**",
      "Comment appelle-t-on les parents de l’homme invisible ? \n \n ||les trensparants||",
      "– Docteur, j’ai besoin de lunettes. \n – Oui certainement. Ici c’est une banque",
      "flemme",
      "Si la violence n'a pas résolu ton problème, c'est que tu n'as âs tapé assé fort...",
      "quand les autres peuvent faire quelque chose a ta place laisse les faire :wink:",
      "Quel super héros donne le plus vite l'heure ? ||Speed heure man !||",
      "Il y a eut un meutre dans un avion \n -C'est un coup de voldemort (vole de mort)",
      "Que se passe-t-il quand on plonge un hibou dans de l'eau chaude ? Il bout.",
      "Comment une imprimante se noie-t-elle ? Quand elle a papier.",
      "Deux personnes discutent ensembles : \n \n ||- Cette année Noël tombe un vendredi|| \n || - j'espère que ce n'est pas un vendredi 13||",
      "Une poule hors de son poulailler dit : \n \n ||– Il fait un froid de canard !|| \n Un canard sort de l'autre côté \n \n ||m'en parle pas, j'ai la chaire de poule||",
      "Qu’est-ce qu’un homme sur une branche ? \n Un homme de moins sur terre. \n \n Qu’est-ce que deux hommes sur une branche ? \n Un homme de plus sur la branche. \n \n Qu’est-ce que trois hommes sur une branche ? \n CRAC...",
      "Une maman moustique dit à son petit : \n \n – Ne t’approche pas des humains, ils pourraient te faire du mal ! \n Le petit moustique répond : \n \n – Mais maman, quand je m’approche d’eux, ils m’applaudissent !",
      "Un père se fâche après son jeune fils. \n \n – Mais enfin, qu’est-ce que je dois faire pour que tu cesses, une bonne fois, de jouer avec les allumettes ? \n – Je ne sais pas, moi, répond le gamin. Peut-être m’acheter un briquet.",
      "Deux amis se rencontrent. L’un, joueur invétéré dit à l’autre: \n \n – Il faut que je t’annonce une grande nouvelle: j’arrête de jouer! Plus de casino, plus de tiercé, plus de poker… \n – Bravo, lui dit l’autre. Mais pardonne-moi, te connaissant, j’ai du mal à y croire. Je suis même sûr que tu ne tiendras pas! \n – Ah bon? Tu paries combien?",
      "– Chef, chef ! Il y a eu un vol cette nuit au supermarché ! On a volé 2000 cartouches de cigarettes et 1500 carottes. \n – Bien, et vous avez des soupçons ? \n – Ben ouais, on recherche un lapin qui tousse.",
      "Maitresse: Toto, dans la phrase le voleur a été arrêté par la police où est le sujet ?Toto: bah en prison sans doute",
      " Enchantier je m'appelle teuseEt moi sonneuse!Et toi ture",
      "quel animal supporte le moins bien l'alcool ? ||Le zébu (Z'ai bu)||",
      " j'ai 2 pieds, 6 jambes, 8 bras, 2 têtes et un oeil, qui suis-je ? ||une menteuse||",
      "Comment fait on cuire du poisson sur un piano? ||On fait: do ré la sol (Doré la sole)||",
      "Pourquoi un fa bémol est-il toujours malade ? ||Parce qu'il vaut mi.||",
      "Qu'est qu'un cochon qui rit ? ||- Un porc tout gai.||",
      " C'est quand le Retour du Jedi ? ||Entre le mercredaille et le vendredaille||",
      "qu'est ce qui est vert et qui pousse sous l'eau ? ||un chou marin||",
      "Quel est le comble pour un rugbyman ? || C’est de se faire plaquer par sa copine||",
      "Qu’est-ce qu’un euro dans un avion qui décolle ? ||Une pièce montée…||",
      "C’est un gars qui court dans un cimetière, il trébuche … Et il tombe.",
      "c'est Dark Vador il rentre dans une boulangerie et la boulangère lui dit: \n-Bonjour Mr Vador que voulez vous? \n -3 pains et deux tartatin !(pin pin pin tartatin tartatin)"
    ];
    message.channel.send(blague[Math.floor(Math.random() * blague.length)]);
  }
});

client.on("message", message => {
  if (message.content === prefix + "citation drôle") {
    let citation = [
      "Le mot « long » est plus court que le mot « court », c’est dingue non ?",
      "C’est pas parce qu’on a rien à dire, qu’il faut fermer sa gueul",
      "C’est au pied du mur que l’on voit le mieux le mur…",
      "Ne rien faire, mais le faire bien",
      "Les conneries c’est comme les impôts , tu finis toujours par les payer",
      "Une star, c’est quelqu’un qui travaille dur pour être connu et qui, ensuite, porte des lunettes noires pour qu’on ne le reconnaisse pas",
      "L’argent ça va ça vient, mais quand ça vient, ça va !",
      "Il faut cueillir les cerises avec la queue…J’avais déjà du mal avec la main !",
      "Boire du café empêche de dormir. Et dormir empêche de boire du café",
      "Si tu dors et que tu rêves que tu dors, il faut que tu te réveilles deux fois pour te lever.",
      "A la naissance le nain est normal c’est en grandissant qu’il rapetisse."
    ];
    message.channel.send(citation[Math.floor(Math.random() * citation.length)]);
  }
});

client.on("message", message => {
  if (message.content === "gif") {
    let gif = [
      "https://tenor.com/view/cat-sneaking-mountain-gif-master-gif-11204510",
      "https://tenor.com/view/flemme-flemmard-paresse-paresseux-faineant-gif-5234383",
      "https://tenor.com/view/face-blow-wind-storm-hurricane-gif-9982355",
      "https://tenor.com/view/gletter-gif-4356005",
      "https://media.discordapp.net/attachments/627538015677579305/707509439883640922/BlobRave.gif",
      "https://tenor.com/view/michaelscott-wink-yes-gif-5795910",
      "https://tenor.com/view/carcrash-kids-crash-gif-10371731",
      "https://tenor.com/view/fail-nope-gif-5168755",
      "https://tenor.com/view/animals-penguin-fail-fall-cold-water-gif-4590494",
      "https://tenor.com/view/peopleteethcat-cats-teeth-gif-4062225",
      "https://tenor.com/view/harrypotter-slap-snape-ron-gif-4811228",
      "https://tenor.com/view/omg-shook-uncomfortable-help-me-dislike-gif-14273602",
      "https://tenor.com/view/skill-car-accident-bump-gif-15157204",
      "https://tenor.com/view/wtf-crash-enough-motorcycle-accident-gif-16276189",
      "https://tenor.com/view/bike-gif-8095057",
      "https://tenor.com/view/deja-vu-accident-truck-car-hit-gif-17082798",
      "https://tenor.com/view/watch-out-run-you-over-gif-5729865",
      "https://tenor.com/view/pothole-hole-accident-gif-14445555",
      "https://tenor.com/view/fall-stairs-accident-gif-11017130",
      "https://tenor.com/view/vikramprabhu-gunasekaran-motorcycle-motorcycle-accident-accident-gif-12352954",
      "https://tenor.com/view/flcl-accident-camera-shot-gif-12390425",
      "https://tenor.com/view/congarts-congratulations-well-done-good-job-car-accident-gif-12208420",
      "https://tenor.com/view/jump-epic-fail-golf-cart-gif-3299020",
      "https://tenor.com/view/rihanna-blood-queen-gif-10142351",
      "https://tenor.com/view/thirsty-bottoms-up-juice-drink-fail-gif-16020144",
      "https://tenor.com/view/aie-gif-12471478"
    ];
    message.channel.send(gif[Math.floor(Math.random() * gif.length)]);
  }
});


client.on('message', function (message) {
    if (!message.guild) return
    let args = message.content.trim().split(/ +/g)

if (args[0].toLocaleLowerCase() === prefix + "hug") {
    let member = message.mentions.members.first()
    let gif = ["https://cdn.discordapp.com/attachments/694268527904817252/723563998443995208/moqietmofifgotr.gif", "https://cdn.discordapp.com/attachments/694268527904817252/723564601647562782/frere.gif"]
    if(!member) { 
      var embedAuthor = new Discord.MessageEmbed()
      .setImage(gif[Math.floor(Math.random() * gif.length)])
      .setDescription(`${message.author} fait un calin à HamiBot`)
      return message.channel.send(embedAuthor)
      }
  var embedAuthor = new Discord.MessageEmbed()
      .setDescription(`${message.author} fait un calin à ${member.user.username}`)
      .setImage(gif[Math.floor(Math.random() * gif.length)])
  message.channel.send(embedAuthor)
  }
});






//********rôle********//
client.on("message", async message => {
  if (message.content === prefix + "Vocal") {
    message.delete();
    var embed = new Discord.MessageEmbed()
      .setColor("04D2DF")
      .setDescription("Choisissez vos rôles : 🗣️ = j'aime vocal");
    let msg = await message.channel.send(embed);

    try {
      await msg.react("🗣️");
    } catch (error) {
      message.channel.send("Il y a un problème");
    }
  }
});

client.on("raw", event => {
  if (event.t === "MESSAGE_REACTION_ADD") {
    if (event.d.message_id === "715139490699804732") {
      let guild = client.guilds.cache.get(event.d.guild_id);
      let member = guild.members.cache.get(event.d.user_id);

      if (event.d.emoji.name === "🗣️") {
        member.roles.add("643179742933155881");
      }
    }
  }
});

client.on("raw", event => {
  if (event.t === "MESSAGE_REACTION_REMOVE") {
    if (event.d.message_id === "715139490699804732") {
      let guild = client.guilds.cache.get(event.d.guild_id);
      let member = guild.members.cache.get(event.d.user_id);

      if (event.d.emoji.name === "🗣️") {
        member.roles.remove("643179742933155881");
      }
    }
  }
});

client.on("message", async message => {
  if (message.content === prefix + "Vive la TV") {
    message.delete();
    var embed = new Discord.MessageEmbed()
      .setColor("04D2DF")
      .setDescription(
        "Choisissez vos rôles : 😭 = je suis sentimental; 😂 = j'adore l'humour; 🚔 = j'aime le suspens; 💳 = qu'es ce que vous racontez ?! Les séries c'est la vie"
      );
    let msg = await message.channel.send(embed);

    try {
      await msg.react("😭");
      await msg.react("😂");
      await msg.react("🚔");
      await msg.react("💳");
    } catch (error) {
      message.channel.send("Il y a un problème");
    }
  }
});

client.on("raw", event => {
  if (event.t === "MESSAGE_REACTION_ADD") {
    if (event.d.message_id === "715143341041385543") {
      let guild = client.guilds.cache.get(event.d.guild_id);
      let member = guild.members.cache.get(event.d.user_id);

      if (event.d.emoji.name === "😭") {
        member.roles.add("681536299278270539");
      }
      if (event.d.emoji.name === "😂") {
        member.roles.add("643179742933155881");
      }
      if (event.d.emoji.name === "🚔") {
        member.roles.add("681536226381398141");
      }
      if (event.d.emoji.name === "💳") {
        member.roles.add("681536486524321797");
      }
    }
  }
});

client.on("raw", event => {
  if (event.t === "MESSAGE_REACTION_REMOVE") {
    if (event.d.message_id === "715143341041385543") {
      let guild = client.guilds.cache.get(event.d.guild_id);
      let member = guild.members.cache.get(event.d.user_id);

      if (event.d.emoji.name === "😭") {
        member.roles.remove("681536299278270539");
      }
      if (event.d.emoji.name === "😂") {
        member.roles.remove("643179742933155881");
      }
      if (event.d.emoji.name === "🚔") {
        member.roles.remove("681536226381398141");
      }
      if (event.d.emoji.name === "💳") {
        member.roles.remove("681536486524321797");
      }
    }
  }
});

client.on("message", async message => {
  if (message.content === prefix + "Pour les gens qui aiment RP") {
    message.delete();
    var embed = new Discord.MessageEmbed()
      .setColor("04D2DF")
      .setDescription("Choisissez vos rôles : 🎉 = Gmod");
    let msg = await message.channel.send(embed);

    try {
      await msg.react("🎉");
    } catch (error) {
      message.channel.send("Il y a un problème");
    }
  }
});

client.on("raw", event => {
  if (event.t === "MESSAGE_REACTION_ADD") {
    if (event.d.message_id === "715149617766858823") {
      let guild = client.guilds.cache.get(event.d.guild_id);
      let member = guild.members.cache.get(event.d.user_id);

      if (event.d.emoji.name === "🎉") {
        member.roles.add("657956202906517507");
      }
    }
  }
});

client.on("raw", event => {
  if (event.t === "MESSAGE_REACTION_REMOVE") {
    if (event.d.message_id === "715149617766858823") {
      let guild = client.guilds.cache.get(event.d.guild_id);
      let member = guild.members.cache.get(event.d.user_id);

      if (event.d.emoji.name === "🎉") {
        member.roles.remove("657956202906517507");
      }
    }
  }
});

client.on("message", async message => {
  if (message.content === prefix + "Art") {
    message.delete();
    var embed = new Discord.MessageEmbed()
      .setColor("04D2DF")
      .setDescription(
        "Choisissez vos rôles : 📸 = Photo; 🏊 = Sport; 🎨 = Dessin; 🤩 = J'aime tous les arts !"
      );
    let msg = await message.channel.send(embed);

    try {
      await msg.react("📸");
      await msg.react("🏊");
      await msg.react("🎨");
      await msg.react("🤩");
    } catch (error) {
      message.channel.send("Il y a un problème");
    }
  }
});

client.on("raw", event => {
  if (event.t === "MESSAGE_REACTION_ADD") {
    if (event.d.message_id === "715152091047264298") {
      let guild = client.guilds.cache.get(event.d.guild_id);
      let member = guild.members.cache.get(event.d.user_id);

      if (event.d.emoji.name === "📸") {
        member.roles.add("667345482124623893");
      }
      if (event.d.emoji.name === "🏊") {
        member.roles.add("667345307545108490");
      }
      if (event.d.emoji.name === "🎨") {
        member.roles.add("667345134811086877");
      }
      if (event.d.emoji.name === "🤩") {
        member.roles.add("667345582687387660");
      }
    }
  }
});

client.on("raw", event => {
  if (event.t === "MESSAGE_REACTION_REMOVE") {
    if (event.d.message_id === "715152091047264298") {
      let guild = client.guilds.cache.get(event.d.guild_id);
      let member = guild.members.cache.get(event.d.user_id);

      if (event.d.emoji.name === "📸") {
        member.roles.remove("667345482124623893");
      }
      if (event.d.emoji.name === "🏊") {
        member.roles.remove("667345307545108490");
      }
      if (event.d.emoji.name === "🎨") {
        member.roles.remove("667345134811086877");
      }
      if (event.d.emoji.name === "🤩") {
        member.roles.remove("667345582687387660");
      }
    }
  }
});

client.on("message", async message => {
  if (message.content === prefix + "Jeux Vidéos") {
    message.delete();
    var embed = new Discord.MessageEmbed()
      .setColor("04D2DF")
      .setDescription(
        "Choisissez vos rôles : 🌲 = Minecraft; 🇬 = Garry's Mod;  🐳 = Subnautica  🤟 = Youtube; 👩‍🦲 = Scène de ménage"
      );
    let msg = await message.channel.send(embed);

    try {
      await msg.react("🌲");
      await msg.react("🇬");
      await msg.react("🐳");
      await msg.react("🤟");
      await msg.react("👩‍🦲");
    } catch (error) {
      message.channel.send("Il y a un problème");
    }
  }
});

client.on("raw", event => {
  if (event.t === "MESSAGE_REACTION_ADD") {
    if (event.d.message_id === "715155725206159440") {
      let guild = client.guilds.cache.get(event.d.guild_id);
      let member = guild.members.cache.get(event.d.user_id);

      if (event.d.emoji.name === "🌲") {
        member.roles.add("627880257898414081");
      }
      if (event.d.emoji.name === "🇬") {
        member.roles.add("627880339028574229");
      }
      if (event.d.emoji.name === "🐳") {
        member.roles.add("627880421035737128");
      }
      if (event.d.emoji.name === "🤟") {
        member.roles.add("627766559586254858");
      }
      if (event.d.emoji.name === "👩‍🦲") {
        member.roles.add("628242377529753626");
        console.log("Rôle ajouté !");
      }
    }
  }
});

client.on("raw", event => {
  if (event.t === "MESSAGE_REACTION_REMOVE") {
    if (event.d.message_id === "715155725206159440") {
      let guild = client.guilds.cache.get(event.d.guild_id);
      let member = guild.members.cache.get(event.d.user_id);

      if (event.d.emoji.name === "🌲") {
        member.roles.remove("627880257898414081");
      }
      if (event.d.emoji.name === "🇬") {
        member.roles.remove("627880339028574229");
      }
      if (event.d.emoji.name === "🐳") {
        member.roles.remove("627880421035737128");
      }
      if (event.d.emoji.name === "🤟") {
        member.roles.remove("627766559586254858");
      }
      if (event.d.emoji.name === "👩‍🦲") {
        member.roles.remove("628242377529753626");
      }
    }
  }
});







//********proposition********//
client.on("message", async message => {
  if (!message.guild) return;
  let args = message.content.trim().split(/ +/g);

  if (args[0].toLowerCase() === prefix + "sugg") {
    message.delete()
    let sugg = args.slice(1).join(" ");
    if (!sugg) {
      var embed = new Discord.MessageEmbed()
        .setDescription("Veuillez indiquer une suggestion à proposer")
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    message.channel.send(`Suggestion envoyé ${message.author} !`);
    var embed = new Discord.MessageEmbed()
      .setTitle(`**Nouvelle suggestion de __${message.author.username}"__ :**`)
      .setDescription(
        `**Suggestion :** ${sugg} **\n Mention :** ${message.author}`
      )
      .setTimestamp(Date.now())
      .setColor("#25DF04")
      .setThumbnail(message.author.displayAvatarURL())
      .setFooter("Validez ou non !")
      .setColor("#F1B302");
    let msg = await message.guild.channels.cache
      .get("715838319237529610")
      .send(embed);
    console.log("sugg proposée");

    try {
      await msg.react("✅");
      await msg.react("❌");
    } catch (error) {
      message.channel.send("Il y a un problème");
      console.log("sugg proposée");
    }
  }
});

client.on("message", async message => {
  if (!message.guild) return;
  let args = message.content.trim().split(/ +/g);

  if (args[0].toLowerCase() === prefix + "addblague") {
    message.delete()
    let blague = args.slice(1).join(" ");
    if (!blague) {
      var embed = new Discord.MessageEmbed()
        .setDescription("Veuillez indiquer une blague à proposer")
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    message.channel.send(`Blague envoyé ${message.author}`);
    var embed = new Discord.MessageEmbed()
      .setTitle(`**Nouvelle blague de __${message.author.username}__ :**`)
      .setDescription(
        `**Blague : \n **  ${blague} **\n Mention :** ${message.author}`
      )
      .setTimestamp(Date.now())
      .setColor("#25DF04")
      .setThumbnail(message.author.displayAvatarURL())
      .setFooter("Validez ou non !")
      .setColor("#F1B302");
    let msg = await message.guild.channels.cache
      .get("715838319237529610")
      .send(embed);
    console.log("blague proposée");

    try {
      await msg.react("✅");
      await msg.react("❌");
    } catch (error) {
      message.channel.send("Il y a un problème");
      console.log("blague proposée");
    }
  }
});






//********musique********//
client.on("message", message => {
  if (message.content === prefix + "join") {
    if (message.member.voice.channel) {
      message.member.voice.channel.join();
      message.channel.send("je me suis connecté");
      co = true;
    } else {
      message.channel.send("Veuillez être connecté à un salon vocal !");
    }
  } else if (message.content === prefix + "disconnect") {
    if (message.member.voice.channel) {
      message.member.voice.channel.leave();
      message.channel.send("Je me suis déconnecté");
      co = false;
    } else {
      message.channel.send(
        "Je ne suis connecté dans aucun salon vocal ou vous n'êtes pas connecté dans mon salon vocal"
      );
    }
  } else if (message.content.startsWith(prefix + "p")) {
    if (co) {
      let oQueTocar = message.content.replace(prefix + "p ", "");
      if (Ytdl.validateURL(oQueTocar)) {
        message.member.voice.channel.connection.play(Ytdl(oQueTocar));
        message.channel.send("Je chantes");
      } else {
        message.channel.send("Ce liens n'est pas valide");
      }
    }
  }
});






//********information********//
client.on("message", message => {
  if (message.content === prefix + "serveur-info") {
    let millis = new Date().getTime() - message.guild.createdAt.getTime();
    let days = millis / 1000 / 60 / 60 / 24;

    let owner = message.guild.owner.user || {};

    let embed = new Discord.MessageEmbed()
      .setThumbnail(message.guild.iconURL)
      .setFooter(
        `requested by ${message.author.username}#${message.author.discriminator}`,
        message.author.avatarURL
      )
      .setColor("EAB80D")
      .addField("Server Name", message.guild.name, true)
      .addField("Server ID", message.guild.id, true)
      .addField(
        "Owner",
        `${owner.username + "#" + owner.discriminator ||
          "� Owner not found..."}`,
        true
      )
      .addField("Owner ID", `${owner.id || "� Owner not found..."}`, true)
      .addField("Region", `${message.guild.region}`, true)
      .addField(
        "Text Channels",
        `${message.guild.channels.cache.filter(m => m.type === "text").size}`,
        true
      )
      .addField(
        "Voice Channels",
        `${message.guild.channels.cache.filter(m => m.type === "voice").size}`,
        true
      )
      .addField(
        "Member Count",
        `${
          message.guild.members.cache.filter(
            m => m.presence.status !== "offline"
          ).size
        } en ligne / ${message.guild.memberCount}`,
        true
      )
      .addField("Roles", `${message.guild.roles.cache.size}`, true);
    message.channel.send(embed);
  }
});

client.on("message", message => {
  if (message.content === "HamiBot") {
    var embed = new Discord.MessageEmbed()
      .setColor("000000")
      .setTitle("Info sur le bot HamiBot :")
      .setDescription(
        "HamiBot a été développé par Polac154856, pour le serveur et pour essayer de remplacer les autres bots. Le but ? Avoir le moins de bot possible sur le serveur, mais avec toutes les options qui vont avec. \n \n Ce que le bot peut faire ? il fait toutes les commandes disponibles dans ``=help`` + il fait aussi des dialogues basiques : Salut; tu aimes quoi ?; tu vas bien ?; tu fais quoi... avec lui des membres se sont fait des délirs inimaginable ! Il y a bientôt le sysrème d'Xp qui va se mettre en place. Le système de giveaway. Il fait les stats et les rôles à réaction"
      )
      .setFooter(
        "Un grand merci à Blobman38 et Secours_Motagne pour leur aide !"
      );
    message.channel.send(embed);
  }
});


client.on("message", message => {
  if (message.content === prefix + "information") {
    var embed = new Discord.MessageEmbed()
      .setColor("DFA304")
      .setTitle("Toutes les informations relative au serveur !")
      .setDescription(
        "1 : Les tickets : avec le bot <@708967626763927553> vous pouvez faire un ticket pour : \n -Une sanction injustifié, demande d'unwarn, d'unmute. \n -Les plaintes : vous voulez vous plaindre d'un membre, qui vous a insulté, manqué de respect etc... \n -Une question sur le serveur n'étant pas indiqué sur cette commande en faisant ``=new [raison]`` dans <#628983375633317918> ou <#627602890818584577>. \n \n 2 : Les rôles : \n -Vous pouvez avoir certain rôle dans <#627880125488431115> mais nces rôles là n'offrent aucune permission. \n -Des rôles tel que VIP, spammer pro etc... sont à avoir avec des évents, giveawayou commande ``=cadeau`` lorsqu'elle est fonctionnel. \n \n 3 Devenir staff : \n -Faites la commande ``=staff`` et vous aurez les informations nécessaire, vous pourez devenir staff que lorsque les recrutements sont ouvert. 4 : \n \n Les salons : \n -Les XP de <@!159985870458322944> sont activé dans tous les salons, sauf : <#709054977334706227> (<#709055117462077736> lui a les XP il faut le rôle spammer pro); <#627518679151542292>; <#627516955988852756> et <#693050891187650570> \n -Les commandes ``=SalonT [nom]`` pour crée votre salon textuel et ``=SalonV [nom]`` pour crée votre propre salon vocal. (plus d'info : message épinglé <#627541289952477184>)  \n \n 5 : La modértion : \n -La modération est assuré par le staff, une période de 1 semaine en modo-test s'ouvre aux personnes venant d'être recruté, passe ensuite modérateur > chef modérateur > administrateur (ayant toutes les perms (réservé aux amis IRL du fondateur)) \n - Co-Fondateur le porteur de ce rôle est Blobman38 ne pouvant être géré par un bot, le rôle Fondateur, porteur de ce rôle Polac154857 ne pouvant être géré. \n -Le bot de modération est <@708967626763927553>. \n \n 6 : Les bots : \n ``=préfixe-bot``.  "
      )
      .setFooter("Pour plus d'info faites un ticket");
    message.channel.send(embed);
  }
});


//client.on("message", async message => {
//  const args = message.content
//    .slice(prefix.length)
//    .trim()
//    .split(/ +/g);
//  const command = args.shift().toLowerCase();
//
//  if (message.content.indexOf(prefix) !== 0) return;
//
//  if (command == "hasrole") {
//        var mention;
//    mention = message.mentions.first();
//    if(!mention) {
//      var embed = new Discord.MessageEmbed()
//      .setDescription(":x: Veuillez indiquer un rôle")
//    }
//    member = hasRole.mention
//    var member = message.guild.members
//    var array = []
//    if(member.hasRole(mention.id)
//      array.push(member);{
//  message.channel.send(array)
//  }
//  }
//  }
//})





//********salon-ticket********//
client.on("message", message => {
  if (message.content === prefix + "close") {
    if (!message.member.roles.cache.find(r => r.name === "staff d'H"))
      return message.channel.send(
        "Vous n'avez pas la permission de fermé le ticket !"
      );
    if (message.channel.parentID == "679381701721587722") {
      message.channel.send(
        "Le problème a été résolu, le ticket sera fermé dans 30 secondes"
      );
      message.guild.channels.cache
        .get(message.channel.id)
        .setName(`✅ ${message.author.username} problème réglé`);
      setTimeout(() => {
        message.channel.delete();
      }, 30 * 600);
    }
  }
});


client.on("message", function(message) {
  let args = message.content.trim().split(/ +/g);
  if (args[0].toLowerCase() === prefix + "new") {
    message.delete();
    if (message.author.bot) return;
    let member = message.author;
    let reason = args.slice(1).join(" ");
    if (!reason) {
      var embed = new Discord.MessageEmbed()
        .setDescription("Veuillez indiquer une raison")
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    message.channel
      .send(`Ticket envoyé ${member}`)
      .then(msg => msg.delete({ timeout: 3000 }));
    message.guild.channels
      .create(`🚔 ${message.author.username}`, { type: "text" })
      .then(channel => {
        let catégorie = message.guild.channels.cache.get(
          "679381701721587722",
          c => c.type == "category"
        );

        channel.setParent(catégorie);
        let role1 = message.guild.roles.cache.get("674603488499466280");
        let role2 = message.guild.roles.cache.get("627524204077645847");
        let role3 = message.guild.roles.cache.get("628627090849136650");
        let everyone = message.guild.roles.cache.get("627513964514770974");
        message.channel.createOverwrite(role1, {
          SEND_MESSAGES: true,
          VIEW_CHANNEL: true
        });
        channel.createOverwrite(role1, {
          SEND_MESSAGES: true,
          VIEW_CHANNEL: true
        });
        channel.createOverwrite(role2, {
          SEND_MESSAGES: true,
          VIEW_CHANNEL: true
        });
        channel.createOverwrite(role3, {
          SEND_MESSAGES: true,
          VIEW_CHANNEL: true
        });
        channel.createOverwrite(message.author, {
          SEND_MESSAGES: true,
          VIEW_CHANNEL: true
        });
        channel.createOverwrite(everyone, {
          SEND_MESSAGES: false,
          VIEW_CHANNEL: false
        });
        var embed = new Discord.MessageEmbed()
          .setDescription(
            `**Nouveau ticket de ${message.author} :** \n \n **Raison :** ${reason}.`
          )
          .setThumbnail(message.author.displayAvatarURL())
          .setFooter("=close pour fermer");
        channel.send(embed);

        channel
          .send(`<@&628983563521359902> ${message.author}`)
          .then(msg => msg.delete({ timeout: 3000 }));
      });
  }
});

client.on("message", async message => {
  if (message.content.startsWith(prefix + "SalonT")) {
    if (message.author.bot) return;
    let member = message.author;
    let nom = message.content
      .split(" ")
      .slice(1)
      .join(" ")
      .slice(0);
    console.log(nom);
    if (!nom) {
      var embed = new Discord.MessageEmbed()
        .setDescription("Veuillez indiquer un nom pour le salon")
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    message.channel.send(` ${nom} **type textuel** a été crée ! par ${member}`);
    message.guild.channels.create(`${nom}`, { type: "text" }).then(channel => {
      let catégorie = message.guild.channels.cache.get(
        "719520314584989716",
        c => c.type == "category"
      );

      channel.setParent(catégorie);
      let everyone = message.guild.roles.cache.get("627513964514770974");
      channel.createOverwrite(message.author, {
        SEND_MESSAGES: true,
        READ_MESSAGES: true,
        MANAGE_ROLES: true,
        MANAGE_CHANNELS: true
      });
      channel.createOverwrite(everyone, {
        SEND_MESSAGES: true,
        READ_MESSAGES: true
      });
    });
  }
});

client.on("message", async message => {
  if (message.content.startsWith(prefix + "SalonV")) {
    if (message.author.bot) return;
    let member = message.author;
    let nom = message.content
      .split(" ")
      .slice(1)
      .join(" ")
      .slice(0);
    console.log(nom);
    if (!nom) {
      var embed = new Discord.MessageEmbed()
        .setDescription("Veuillez indiquer un nom pour le salon")
        .setColor("#E95132");
      return message.channel.send(embed);
    }
    message.channel.send(` ${nom} **type vocal** a été crée ! par ${member}`);
    message.guild.channels.create(`${nom}`, { type: "voice" }).then(channel => {
      let catégorie = message.guild.channels.cache.get(
        "719520314584989716",
        c => c.type == "category"
      );

      channel.setParent(catégorie);
      let everyone = message.guild.roles.cache.get("627513964514770974");
      channel.createOverwrite(message.author, {
        MANAGE_ROLES: true,
        CONNECT: true,
        MANAGE_CHANNELS: true
      });
      channel.createOverwrite(everyone, {
        CONNECT: true
      });
    });
  }
});





//********Member-Bot-Count********//
//MemberCount
client.on("ready", async message => {
  let guild = client.guilds.cache.get("627513964514770974");
  let memberCount = guild.members.cache.filter(mem => !mem.user.bot === true)
    .size;

  guild.channels.cache
    .get("716740876063211581")
    .setName(`Humains : ${memberCount}`);
});

client.on("guildMemberAdd", async member => {
  let guild = client.guilds.cache.get("627513964514770974");
  let memberCount = guild.members.cache.filter(mem => !mem.user.bot === true)
    .size;

  guild.channels.cache
    .get("716740876063211581")
    .setName(`Humains : ${memberCount}`);
});

client.on("guildMemberRemove", async member => {
  let guild = client.guilds.cache.get("627513964514770974");
  let memberCount = guild.members.cache.filter(mem => !mem.user.bot === true)
    .size;

  guild.channels.cache
    .get("716740876063211581")
    .setName(`Humains : ${memberCount}`);
});

//BotCount
client.on("ready", async message => {
  let guild = client.guilds.cache.get("627513964514770974");
  let memberCount = guild.members.cache.filter(mem => mem.user.bot === true)
    .size;

  guild.channels.cache
    .get("716748359821557770")
    .setName(`Bots : ${memberCount}`);
});

client.on("guildMemberAdd", async member => {
  let guild = client.guilds.cache.get("627513964514770974");
  let memberCount = guild.members.cache.filter(
    member => member.user.bot === true
  ).size;

  guild.channels.cache
    .get("716748359821557770")
    .setName(`Bots : ${memberCount}`);
});

client.on("guildMemberRemove", async member => {
  let guild = client.guilds.cache.get("627513964514770974");
  let memberCount = guild.members.cache.filter(
    member => member.user.bot === true
  ).size;

  guild.channels.cache
    .get("716748359821557770")
    .setName(`Bots : ${memberCount}`);
});

//All members
client.on("ready", async message => {
  let guild = client.guilds.cache.get("627513964514770974");
  let user = guild.memberCount;
  guild.channels.cache
    .get("724633971064832010")
    .setName(`Tous les Membres : ${user}`);
});

client.on("guildMemberAdd", async member => {
  let guild = client.guilds.cache.get("627513964514770974");
  let user = guild.memberCount;

  guild.channels.cache
    .get("724633971064832010")
    .setName(`Tous les Membres : ${user}`);
});

client.on("guildMemberRemove", async member => {
  let guild = client.guilds.cache.get("627513964514770974");
  let user = guild.memberCount;

  guild.channels.cache
    .get("724633971064832010")
    .setName(`Tous les Membres : ${user}`);
});

client.on("message", message => {
  if (message.content === prefix + "cadeau") {
    let member = message.member
    if (message.author.bot) return;
    let VIP = `GG tu gagnes le rôle VIP ${message.author}`
    let MINI_VIP = `GG tu gagnes mini-vip ${message.author}`
    let spammer = `GG tu gagnes spammer pro ${message.author} `
    let VIP_r =  `GG tu perds le rôle VIP ${message.author}`
    let spammer_r = `GG tu perds spammer pro ${message.author}`
    let mini_vip_r = `GG tu perds mini-vip ${message.author}`
    if (cooldown.has(message.author.id)) {
      return message.channel.send(
        `Attends 10 minutes ${message.author} avant de faire la commande !`
      );
    }
    cooldown.add(message.author.id);
    let cadeau = [
      `GG tu gagnes le rôle VIP ${message.author}`,
      `GG tu gagnes le rôle VIP ${message.author}`,
      `GG tu gagnes le rôle VIP ${message.author}`,
      `GG tu perds le rôle VIP ${message.author}`,
      `GG tu gagnes mini-vip ${message.author}`,
      `GG tu perds mini-vip ${message.author}`,
      `GG tu gagnes mini-vip ${message.author} `,
      `GG tu gagnes spammer ${message.author}`,
      `GG tu gagnes spammer ${message.author} `,
      `GG tu perds spammer pro ${message.author}`,
      `GG tu gagnes 500 points à DuckHunt va le dire à un staff ${message.author} `,
      `GG tu gagnes 500 points à DuckHunt va le dire à un staff ${message.author} `,
      `GG tu gagnes 500 points à DuckHunt va le dire à un staff ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne perd rien ${message.author}`,
      `GG tu ne perd rien ${message.author}`,
      `GG tu ne perd rien ${message.author}`,
      `GG tu ne perd rien ${message.author}`,
      `GG tu ne perd rien ${message.author}`,
      `GG tu ne perd rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu ne gagnes rien ${message.author}`,
      `GG tu as ||pas|| as gagné le rôle admin ${message.author}`,
      `GG tu as ||pas|| as gagné le rôle admin ${message.author}`,
      `GG tu as ||pas|| as gagné le rôle admin ${message.author}`,
      `GG tu as ||pas|| as gagné le rôle admin ${message.author}`,
      `GG tu as ||pas|| as gagné le rôle admin ${message.author}`,
      `GG tu as ||pas|| as gagné le rôle admin ${message.author}`,
      `GG tu gagnes 300 € avec <@!292953664492929025> va le dire à un admin ${message.author}`,
      `GG tu gagnes 300 € avec <@!292953664492929025> va le dire à un admin ${message.author}`,
      `GG tu gagnes 300 € avec <@!292953664492929025> va le dire à un admin ${message.author}`,
      `GG tu gagnes 300 € avec <@!292953664492929025> va le dire à un admin ${message.author}`,
      `GG tu gagnes 300 € avec <@!292953664492929025> va le dire à un admin ${message.author}`,
      `GG tu gagnes 300 € avec <@!292953664492929025> va le dire à un admin ${message.author}`,
      `GG tu gagnes 300 € avec <@!292953664492929025> va le dire à un admin ${message.author}`,
      `GG tu gagnes 300 € avec <@!292953664492929025> va le dire à un admin ${message.author}`
    ];
    message.channel.send(cadeau[Math.floor(Math.random() * cadeau.length)]);
    setTimeout(() => {
      cooldown.delete(message.author.id);
    }, cdseconds * 1000);
  }
});

client.on("message", function(message) {
  let args = message.content.trim().split(/ +/g);

  if (args[0].toLowerCase() === prefix + "sauvegarde") {
    message.delete();
    if (message.author.bot)
      return message.channel.send(
        "Les bots ne sont pas autorisés à avoir des sauvegardes"
      );
    let member = message.author;
    let sauv = args.slice(1).join(" ");
    if (!sauv)
      return message.channel.send("Veuillez indiquer du text à sauvegarder");
    if (!sauvegarde[member.id]) {
      sauvegarde[member.id] = [];
    }
    sauvegarde[member.id].unshift({
      sauvegarde: sauv,
      date: Date.now(),
      mod: message.author.id
    });
    fs.writeFileSync("./sauvegarde.json", JSON.stringify(sauvegarde));
    message.channel.send("Sauvegarde enregistré \n Faites =ma-sauvegarde pour voir votre sauvegarde").then(msg => msg.delete({ timeout: 7000 }));
    
  }
});




//********sauvegarde********//
client.on("message", message => {
  if (message.content === prefix + "ma-sauvegarde") {
    message.delete().catch(error => console.log("Je ne peux pas supprimer un message en MP"));
    if (message.author.bot) return;
    let member = message.author;
    console.log(`la sauvegarde ${message.author.username} a été dévoilé !`);
    if(message.channel.type === "dm") {
          var embed = new Discord.MessageEmbed()
      .setColor("0DEA89")
      .setThumbnail(member.displayAvatarURL({ dynamic: true, size: 4096 }))
      .addField(
        "Voici votre sauvegarde",
        sauvegarde[member.id] && sauvegarde[member.id].length
          ? sauvegarde[member.id].slice(0, 10).map(e => e.sauvegarde)
          : ":x: **Vous n'avez pas de sauvegarde**"
      );
   return member.send(embed);
    }
    var embed = new Discord.MessageEmbed()
      .setColor("0DEA89")
      .setThumbnail(member.displayAvatarURL({ dynamic: true, size: 4096 }))
      .addField(
        "Voici votre sauvegarde",
        sauvegarde[member.id] && sauvegarde[member.id].length
          ? sauvegarde[member.id].slice(0, 10).map(e => e.sauvegarde)
          : ":x: **Vous n'avez pas de sauvegarde**"
      );
    member.send(embed);
    message.channel.send("Sauvegarde envoté en MP !").then(msg => msg.delete({ timeout: 3000 }));
    }
});

client.on("message", message => {
  if (message.content === prefix + "dé-sauvegarde") {
    message.delete()
    let member = message.author;
    if (!sauvegarde[member.id] || !sauvegarde[member.id].length) {
      var embed = new Discord.MessageEmbed()
        .setColor("RED")
        .setDescription("Vous n'avez pas de sauvegarde");
      return message.channel.send(embed);
    }
    sauvegarde[member.id].shift();
    fs.writeFileSync("./sauvegarde.json", JSON.stringify(sauvegarde));
    var embed = new Discord.MessageEmbed()
      .setColor("04DF75")
      .setDescription(`Votre dernière sauvegarde a été retiré :ok_hand:`).then(msg => msg.delete({ timeout: 3000 }));
    message.channel.send(embed);
    console.log("Une sauvegarde en moins");
  }
});






//********commande-personnalisé********//
client.on("message", message => {
  if (message.content === prefix + "Boss") {
    var BossEmbed = new Discord.MessageEmbed()
    .setColor("FFFF00")
    .setTitle("BOOOOOOOOOOOOOM !")
    .setImage("https://cdn.discordapp.com/attachments/641743053387726862/724235759703425084/Mon_logo_en_gif.gif")
    .setDescription("L'intelligence supèrieur de BossXxLightxX !")
    .setFooter("Commande personnalisé de BossXxLightxX !")
    message.channel.send(BossEmbed);
  }
})


client.on("message", message => {
  if(message.content === prefix + "satan") {
    var ZachEmbed = new Discord.MessageEmbed()
    .setColor("FFFF00")
    .setTitle("666")
    .setImage("https://cdn.discordapp.com/avatars/425737754438139927/a_0d924c3565d7754152de702fb9583aee.gif?size=4096")
    .setFooter("Commande personnalisé de zachcc1")
    .setDescription("Vive Satan !")
    message.channel.send(ZachEmbed);
  }
})


client.on("message", message => {
  if(message.content === prefix + "breton") {
    var AtakaEmbed = new Discord.MessageEmbed()
    .setColor("0DBEEA")
    .setImage("https://tenor.com/view/bretagne-britain-gif-5391993")
    .setTitle("Vive la Bretagne !")
    .setDescription("Et Vive le bon beurre salé !")
    .setFooter("Commande personnalisé de Ataka")
    message.channel.send(AtakaEmbed);
  }
})


const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const invites = {};

client.once("ready", () => {
  console.log("Bot is online!");
  client.guilds.cache.forEach((guild) => {
    guild.invites.fetch().then((guildInvites) => {
      guildInvites.forEach((inv) => {
        invites[inv.code] = inv.uses;
      });
    });
  });
});

client.on("inviteCreate", (invite) => {
  invites[invite.code] = invite.uses;
});

client.on("guildMemberAdd", async (member) => {
  const guildInvites = await member.guild.invites.fetch();
  const usedInvite = guildInvites.find((inv) => invites[inv.code] < inv.uses);

  if (usedInvite) {
    console.log(
      `${member.user.tag} joined using invite from ${usedInvite.inviter.tag}`
    );
    invites[usedInvite.code] = usedInvite.uses;
  }
});

client.on("messageCreate", async (message) => {
  if (message.content === "!invites") {
    const userInvites = await message.guild.invites.fetch();
    const userInviteCount = userInvites
      .filter((inv) => inv.inviter.id === message.author.id)
      .reduce((acc, inv) => acc + inv.uses, 0);

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Your Invites")
      .setDescription(
        `**${message.author.tag}, you have \`${userInviteCount}\` invites!**`
      )
      .setTimestamp()
      .setThumbnail("Logo Here")
      .setFooter({
        text: "Developed by: MaorL3vy",
      });

    message.channel.send({ embeds: [embed] });
  }

  client.on("messageCreate", async (message) => {
    if (message.content === "!leaderboard") {
      try {
        const allInvites = await message.guild.invites.fetch();
        const inviteCounts = {};

        allInvites.forEach((inv) => {
          if (inviteCounts[inv.inviter.id]) {
            inviteCounts[inv.inviter.id] += inv.uses;
          } else {
            inviteCounts[inv.inviter.id] = inv.uses;
          }
        });

        const sortedInviters = Object.entries(inviteCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10);
        const topInviters = sortedInviters
          .map(([id, count]) => `**<@${id}>: \`${count}\` has one invites!**\n`)
          .join(" ");

        const embed = new EmbedBuilder()
          .setColor("#0099ff")
          .setTitle("Top Inviters")
          .setDescription(topInviters)
          .setTimestamp()
          .setThumbnail("Logo Here")
          .setFooter({
            text: "Developed by: MaorL3vy",
          });

        await message.channel.send({ embeds: [embed] });
      } catch (error) {
        console.error("Error in !leaderboard command:", error);
        message.channel.send(
          "Error fetching leaderboard. Please try again later."
        );
      }
    }
  });
});

client.login("Token goes here!");

import { Events, type Message } from "discord.js";
import type { BotClient } from "../structures/BotClient";
import { calculateLevel, calculateXpForLevel } from "../utils/helpers";
import { Colors } from "../utils/embeds";
import { EmbedBuilder } from "discord.js";

const xpCooldowns = new Map<string, number>();

export default {
  name: Events.MessageCreate,
  async execute(message: Message, client: BotClient) {
    if (message.author.bot || !message.guild) return;

    const settings = await client.db.guildSettings.findUnique({
      where: { guildId: message.guild.id },
    });

    if (!settings) return;

    // Anti-Spam
    if (settings.antiSpamEnabled) {
      await checkSpam(message, client, settings.spamThreshold);
    }

    // Anti-Link
    if (settings.antiLinkEnabled) {
      const linkRegex = /https?:\/\/[^\s]+/gi;
      if (linkRegex.test(message.content)) {
        const member = message.member;
        if (member && !member.permissions.has("ManageMessages")) {
          await message.delete().catch(() => {});
          await message.channel
            .send({
              embeds: [
                new EmbedBuilder()
                  .setColor(Colors.danger)
                  .setDescription(`${message.author}, links are not allowed here!`)
                  .setTimestamp(),
              ],
            })
            .then((m) => setTimeout(() => m.delete().catch(() => {}), 5000));
          return;
        }
      }
    }

    // XP / Levels
    if (settings.levelsEnabled) {
      await handleXp(message, client);
    }
  },
};

const spamMap = new Map<string, { count: number; lastMessage: number }>();

async function checkSpam(
  message: Message,
  client: BotClient,
  threshold: number
) {
  const key = `${message.guild!.id}-${message.author.id}`;
  const now = Date.now();
  const userData = spamMap.get(key) ?? { count: 0, lastMessage: 0 };

  if (now - userData.lastMessage < 3000) {
    userData.count++;
  } else {
    userData.count = 1;
  }
  userData.lastMessage = now;
  spamMap.set(key, userData);

  if (userData.count >= threshold) {
    const member = message.member;
    if (member && !member.permissions.has("ManageMessages")) {
      try {
        await member.timeout(60000, "Anti-Spam: Message spam detected");
        await message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.danger)
              .setDescription(`${message.author} has been muted for 1 minute (spam detected).`)
              .setTimestamp(),
          ],
        });

        await client.db.modLog.create({
          data: {
            guildId: message.guild!.id,
            userId: message.author.id,
            modId: client.user!.id,
            action: "TIMEOUT",
            reason: "Anti-Spam: Automatic timeout",
            duration: 60000,
          },
        });
      } catch (error) {
        console.error("[ANTISPAM] Failed to timeout:", error);
      }
    }
    spamMap.delete(key);
  }
}

async function handleXp(message: Message, client: BotClient) {
  const key = `${message.guild!.id}-${message.author.id}`;
  const now = Date.now();

  if (xpCooldowns.has(key) && now - xpCooldowns.get(key)! < 60000) return;
  xpCooldowns.set(key, now);

  const xpGain = Math.floor(Math.random() * 10) + 15;

  const userLevel = await client.db.userLevel.upsert({
    where: {
      guildId_userId: {
        guildId: message.guild!.id,
        userId: message.author.id,
      },
    },
    update: {
      xp: { increment: xpGain },
      messages: { increment: 1 },
    },
    create: {
      guildId: message.guild!.id,
      userId: message.author.id,
      xp: xpGain,
      messages: 1,
    },
  });

  const oldLevel = calculateLevel(userLevel.xp - xpGain);
  const newLevel = calculateLevel(userLevel.xp);

  if (newLevel > oldLevel) {
    await client.db.userLevel.update({
      where: { id: userLevel.id },
      data: { level: newLevel },
    });

    const embed = new EmbedBuilder()
      .setColor(Colors.level)
      .setTitle("🎉 Level Up!")
      .setDescription(
        `Congratulations ${message.author}! You've reached **Level ${newLevel}**!`
      )
      .setThumbnail(message.author.displayAvatarURL())
      .addFields({
        name: "Next Level",
        value: `${calculateXpForLevel(newLevel)} XP needed`,
        inline: true,
      })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
}

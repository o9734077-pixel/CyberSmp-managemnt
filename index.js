const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send({ status: "Online" }));
app.listen(8080);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
const autoLineChannels = new Set(); const autoResponses = new Map();
const LINE_URL = "https://discordapp.net";

const commands = [
    new SlashCommandBuilder().setName('auto-line').setDescription('⚙️ الخط التلقائي').setDefaultMemberPermissions(PermissionFlagsBits.Administrator).addChannelOption(o => o.setName('channel').setDescription('الروم').setRequired(true)),
    new SlashCommandBuilder().setName('auto-respond').setDescription('⚙️ الرد التلقائي').setDefaultMemberPermissions(PermissionFlagsBits.Administrator).addStringOption(o => o.setName('word').setDescription('الكلمة').setRequired(true)).addStringOption(o => o.setName('reply').setDescription('الرد').setRequired(true)),
    new SlashCommandBuilder().setName('setup-ticket').setDescription('🎫 منشور الدعم الفني').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('clear').setDescription('🧹 مسح الشات').setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages).addIntegerOption(o => o.setName('amount').setDescription('العدد').setRequired(true)),
    new SlashCommandBuilder().setName('ban').setDescription('🔨 باند لعضو').setDefaultMemberPermissions(PermissionFlagsBits.BanMembers).addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)),
    new SlashCommandBuilder().setName('kick').setDescription('🚪 طرد عضو').setDefaultMemberPermissions(PermissionFlagsBits.KickMembers).addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)),
    new SlashCommandBuilder().setName('lock').setDescription('🔒 قفل الروم').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    new SlashCommandBuilder().setName('unlock').setDescription('🔓 فتح الروم').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    new SlashCommandBuilder().setName('bc').setDescription('📢 برودكاست').setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(o => o.setName('type').setDescription('النوع').setRequired(true).addChoices({ name: 'خاص (DM)', value: 'dm' }, { name: 'رومات (Channels)', value: 'embed' }))
        .addStringOption(o => o.setName('message').setDescription('الرسالة').setRequired(true))
];

client.once('ready', async () => {
    const rest = new REST({ version: '10' }).setToken(client.token);
    try { await rest.put(Routes.applicationCommands(client.user.id), { body: commands }); console.log('🎉 Bot Ready!'); } catch (e) { console.error(e); }
});

client.on('interactionCreate', async i => {
    if (i.isChatInputCommand()) {
        const u = i.options.getUser('user'); const m = u ? i.guild.members.cache.get(u.id) : null;
        if (i.commandName === 'auto-line') {
            const ch = i.options.getChannel('channel');
            if (autoLineChannels.has(ch.id)) { autoLineChannels.delete(ch.id); await i.reply({ content: `❌ إلغاء الخط من: ${ch}`, ephemeral: true }); } 
            else { autoLineChannels.add(ch.id); await i.reply({ content: `✅ تفعيل الخط في: ${ch}`, ephemeral: true }); }
        }
        if (i.commandName === 'auto-respond') {
            autoResponses.set(i.options.getString('word').toLowerCase().trim(), i.options.getString('reply'));
            await i.reply({ content: `✅ تم حفظ الرد التلقائي`, ephemeral: true });
        }
        if (i.commandName === 'clear') { await i.channel.bulkDelete(i.options.getInteger('amount'), true); await i.reply({ content: `🧹 تم مسح الرسائل`, ephemeral: true }); }
        if (i.commandName === 'ban') { if (!m.bannable) return i.reply({ content: '❌ رتبته قوية' }); await m.ban(); await i.reply({ content: `🔨 تم حظر ${u.tag}` }); }
        if (i.commandName === 'kick') { if (!m.kickable) return i.reply({ content: '❌ رتبته قوية' }); await m.kick(); await i.reply({ content: `🚪 تم طرد ${u.tag}` }); }
        if (i.commandName === 'lock') { await i.channel.permissionOverwrites.edit(i.guild.id, { SendMessages: false }); await i.reply({ content: '🔒 تم قفل الروم' }); }
        if (i.commandName === 'unlock') { await i.channel.permissionOverwrites.edit(i.guild.id, { SendMessages: null }); await i.reply({ content: '🔓 تم فتح الروم' }); }
        if (i.commandName === 'setup-ticket') {
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket').setLabel('فتح تذكرة دعم').setStyle(ButtonStyle.Success).setEmoji('🎫'));
            const emb = new EmbedBuilder().setColor('#5865F2').setTitle('📞 مركز الدعم الفني').setDescription('اضغط بالأسفل لفتح تذكرة.');
            await i.reply({ content: '✅ تم المنشور', ephemeral: true }); await i.channel.send({ embeds: [emb], components: [row] });
        }
        if (i.commandName === 'bc') {
            const type = i.options.getString('type'); const txt = i.options.getString('message'); await i.reply({ content: '⏳ جاري الإرسال...', ephemeral: true });
            if (type === 'dm') {
                const mems = await i.guild.members.fetch();
                for (const [id, m] of mems) { if (!m.user.bot) try { await m.send(`📢 **برودكاست:**\n\n${txt}`); } catch(e){} }
                await i.followUp({ content: '✅ تم الإرسال في الخاص للجميع!', ephemeral: true });
            } else {
                const emb = new EmbedBuilder().setColor('#FF0055').setTitle('📢 إعلان رسمي').setDescription(txt).setTimestamp();
                i.guild.channels.cache.filter(c => c.type === 0).forEach(async ch => { try{ await ch.send({ embeds: [emb] }); }catch(e){} });
                await i.followUp({ content: '✅ تم النشر في جميع الرومات!', ephemeral: true });
            }
        }
    }
    if (i.isButton() && i.customId === 'ticket') {
        const cName = `ticket-${i.user.username}`.toLowerCase(); if (i.guild.channels.cache.find(c => c.name === cName)) return i.reply({ content: '❌ لديك تذكرة بالفعل!', ephemeral: true });
        const ch = await i.guild.channels.create({ name: cName, type: 0, permissionOverwrites: [{ id: i.guild.id, deny: [PermissionFlagsBits.ViewChannel] }, { id: i.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }] });
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close').setLabel('إغلاق').setStyle(ButtonStyle.Danger));
        await ch.send({ content: `مرحباً بك ${i.user}، اكتب مشكلتك هنا.`, components: [row] }); await i.reply({ content: `✅ تذكرتك: ${ch}`, ephemeral: true });
    }
    if (i.isButton() && i.customId === 'close') { await i.reply('🔒 سيتم الحذف خلال 5 ثوانٍ...'); setTimeout(() => i.channel.delete().catch(() => null), 5000); }
});

client.on('messageCreate', async m => {
    if (m.author.bot) return; const txt = m.content.toLowerCase().trim();
    if (autoResponses.has(txt)) return m.reply({ content: autoResponses.get(txt) });
    if (autoLineChannels.has(m.channel.id)) { setTimeout(() => m.channel.send({ content: LINE_URL }).catch(() => null), 1000); }
});

client.login(process.env.DISCORD_TOKEN);


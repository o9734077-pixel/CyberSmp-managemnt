const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send({ status: "Online" }));
app.listen(8080, () => console.log("🌐 Web Server Ready"));

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

const autoLineChannels = new Set(); 
const autoResponses = new Map();   
const LINE_URL = "https://discordapp.net";

const commands = [
    new SlashCommandBuilder().setName('auto-line').setDescription('⚙️ تفعيل/إلغاء الخط التلقائي').setDefaultMemberPermissions(PermissionFlagsBits.Administrator).addChannelOption(o => o.setName('channel').setDescription('اختر الروم').setRequired(true)),
    new SlashCommandBuilder().setName('auto-respond').setDescription('⚙️ إعداد الرد التلقائي').setDefaultMemberPermissions(PermissionFlagsBits.Administrator).addStringOption(o => o.setName('word').setDescription('الكلمة').setRequired(true)).addStringOption(o => o.setName('reply').setDescription('الرد').setRequired(true)),
    new SlashCommandBuilder().setName('setup-ticket').setDescription('🎫 منشور مركز الدعم الفني').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('clear').setDescription('🧹 تنظيف رسائل الشات').setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages).addIntegerOption(o => o.setName('amount').setDescription('العدد (1-100)').setRequired(true)),
    new SlashCommandBuilder().setName('ban').setDescription('🔨 حظر عضو نهائياً (باند)').setDefaultMemberPermissions(PermissionFlagsBits.BanMembers).addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('السبب')),
    new SlashCommandBuilder().setName('kick').setDescription('🚪 طرد عضو خارج السيرفر').setDefaultMemberPermissions(PermissionFlagsBits.KickMembers).addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('السبب')),
    new SlashCommandBuilder().setName('mute').setDescription('🔇 كتم عضو مؤقتاً (Timeout)').setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers).addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)).addIntegerOption(o => o.setName('minutes').setDescription('المدّة بالدقائق').setRequired(true)),
    new SlashCommandBuilder().setName('unmute').setDescription('🔊 فك الكتم عن عضو').setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers).addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)),
    new SlashCommandBuilder().setName('warn').setDescription('⚠️ تحذير عضو داخل السيرفر').setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers).addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('السبب').setRequired(true)),
    new SlashCommandBuilder().setName('lock').setDescription('🔒 إغلاق الروم الحالية').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    new SlashCommandBuilder().setName('unlock').setDescription('🔓 فتح الروم المغلقة').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    // 📢 أمر البرودكاست المطور الجديد
    new SlashCommandBuilder().setName('bc').setDescription('📢 إرسال برودكاست (رسالة جماعية)').setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(o => o.setName('type').setDescription('نوع البرودكاست').setRequired(true).addChoices({ name: 'في الخاص لكل الأعضاء (DM)', value: 'dm' }, { name: 'في كل رومات السيرفر (Channels)', value: 'embed' }))
        .addStringOption(o => o.setName('message').setDescription('اكتب نص رسالة الإعلان هنا').setRequired(true))
];

client.once('ready', async () => {
    console.log(`✅ [Bot Active] Logged in as ${client.user.tag}`);
    const rest = new REST({ version: '10' }).setToken(client.token);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('🎉 All Commands with Broadcast Registered Successfully!');
    } catch (e) { console.error(e); }
});

client.on('interactionCreate', async i => {
    if (i.isChatInputCommand()) {
        const user = i.options.getUser('user');
        const reason = i.options.getString('reason') || 'بدون سبب محدد';
        const member = user ? i.guild.members.cache.get(user.id) : null;

        if (i.commandName === 'auto-line') {
            const ch = i.options.getChannel('channel');
            if (autoLineChannels.has(ch.id)) { autoLineChannels.delete(ch.id); await i.reply({ content: `❌ تم إلغاء الخط من روم: ${ch}`, ephemeral: true }); } 
            else { autoLineChannels.add(ch.id); await i.reply({ content: `✅ تم تفعيل الخط في روم: ${ch}`, ephemeral: true }); }
        }
        if (i.commandName === 'auto-respond') {
            const w = i.options.getString('word').toLowerCase().trim();
            autoResponses.set(w, i.options.getString('reply'));
            await i.reply({ content: `✅ تم ضبط الرد لـ \`${w}\``, ephemeral: true });
        }
        if (i.commandName === 'clear') {
            const amt = i.options.getInteger('amount');
            await i.channel.bulkDelete(amt, true);
            await i.reply({ content: `🧹 تم مسح **${amt}** رسالة بنجاح!`, ephemeral: true });
        }
        if (i.commandName === 'ban') {
            if (!member.bannable) return i.reply({ content: '❌ لا يمكنني حظر هذا العضو!', ephemeral: true });
            await member.ban({ reason }); await i.reply({ content: `🔨 تم حظر **${user.tag}**. السبب: ${reason}` });
        }
        if (i.commandName === 'kick') {
            if (!member.kickable) return i.reply({ content: '❌ لا يمكنني طرد هذا العضو!', ephemeral: true });
            await member.kick(reason); await i.reply({ content: `🚪 تم طرد **${user.tag}**. السبب: ${reason}` });
        }
        if (i.commandName === 'mute') {
            const min = i.options.getInteger('minutes'); await member.timeout(min * 60 * 1000, reason);
            await i.reply({ content: `🔇 تم كتم **${user.tag}** لمدة ${min} دقيقة. السبب: ${reason}` });
        }
        if (i.commandName === 'unmute') { await member.timeout(null); await i.reply({ content: `🔊 تم فك الكتم عن **${user.tag}**.` }); }
        if (i.commandName === 'warn') {
            const emb = new EmbedBuilder().setColor('#FFCC00').setTitle('⚠️ تحذير إداري جديد').setDescription(`العضو: ${user}\n**السبب:** ${reason}\n**بواسطة:** ${i.user}`);
            await i.reply({ embeds: [emb] });
        }
        if (i.commandName === 'lock') { await i.channel.permissionOverwrites.edit(i.guild.id, { SendMessages: false }); await i.reply({ content: '🔒 تم إغلاق الروم الحالية.' }); }
        if (i.commandName === 'unlock') { await i.channel.permissionOverwrites.edit(i.guild.id, { SendMessages: null }); await i.reply({ content: '🔓 تم فتح الروم الحالية.' }); }
        if (i.commandName === 'setup-ticket') {
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket').setLabel('فتح تذكرة دعم').setStyle(ButtonStyle.Success).setEmoji('🎫'));
            const emb = new EmbedBuilder().setColor('#5865F2').setTitle('📞 مركز الدعم الفني لـ CyberSMP').setDescription('اضغط بالأسفل لفتح تذكرة سرية مع الإدارة.');
            await i.reply({ content: '✅ تم إرسال المنشور', ephemeral: true }); await i.channel.send({ embeds: [emb], components: [row] });
        }
        
        // 📢 تشغيل أمر البرودكاست (BC) المطور
        if (i.commandName === 'bc') {
            const type = i.options.getString('type');
            const msgStr = i.options.getString('message');
            await i.reply({ content: '⏳ جاري إرسال البرودكاست الآن، يرجى الانتظار...', ephemeral: true });

            if (type === 'dm') {
                const members = await i.guild.members.fetch();
                let successCount = 0;
                for (const [id, m] of members) {
                    if (m.user.bot) continue;
                    try {
                        await m.send(`📢 **برودكاست من سيرفر ${i.guild.name}:**\n\n${msgStr}`);
                        successCount++;
                    } catch (e) { /* متجاهل إذا كان الخاص مغلق */ }
                }
                await i.followUp({ content: `✅ تم إرسال البرودكاست في الخاص بنجاح لـ **${successCount}** عضو!`, ephemeral: true });
            } 
            else if (type === 'embed') {
                const channels = i.guild.channels.cache.filter(c => c.type === 0); // رومات كتابية فقط
                const emb = new EmbedBuilder().setColor('#FF0055').setTitle('📢 إعلان رسمي هام').setDescription(msgStr).setFooter({ text: `بواسطة: ${i.user.username}` }).setTimestamp();
                for (const [id, ch] of channels) {
                    try { await ch.send({ embeds: [emb] }); } catch (e) { /* متجاهل إذا لم تكن هناك صلاحية كتابة */ }
                }
                await i.followUp({ content: '✅ تم نشر البرودكاست في جميع الرومات المتاحة بنجاح!', ephemeral: true });
            }
        }
    }
    
    if (i.isButton() && i.customId === 'ticket') {
        const cName = `ticket-${i.user.username}`.toLowerCase();
        if (i.guild.channels.cache.find(c => c.name === cName)) return i.reply({ content: '❌ لديك تذكرة مفتوحة بالفعل!', ephemeral: true });
        const ch = await i.guild.channels.create({ name: cName, type: 0, permissionOverwrites: [{ id: i.guild.id, deny: [PermissionFlagsBits.ViewChannel] }, { id: i.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }] });

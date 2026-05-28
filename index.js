require('dotenv').config();
const http = require('http');
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, ActivityType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior } = require('@discordjs/voice');

http.createServer((req, res) => { res.write("Bot Alive"); res.end(); }).listen(process.env.PORT || 10000);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates] });
const xpDatabase = new Map(); const tempVoiceChannels = new Map(); const startTime = Date.now(); let player;

client.once('ready', async () => {
    console.log(`🚀 Ready: ${client.user.tag}`);
    client.user.setActivity('/help | ProBot Mode', { type: ActivityType.Listening });
    const cmds = [
        { name: 'help', description: 'عرض قائمة الأوامر 🛠️' },
        { name: 'quran', description: 'روابط الاستماع للقرآن الكريم 🕋' },
        { name: 'play-quran', description: 'تشغيل راديو القرآن الكريم بالروم الصوتي 📻' },
        { name: 'stop-quran', description: 'إيقاف تشغيل القرآن ومغادرة الروم 🛑' },
        { name: 'user', description: 'معلومات حسابك 👤' },
        { name: 'server', description: 'إحصائيات السيرفر 📊' },
        { name: 'clear', description: 'مسح رسائل الشات', options: [{ name: 'عدد', type: 4, description: 'عدد الرسائل', required: true }] },
        { name: 'rank', description: 'عرض مستواك وبطاقتك 📊' },
        { name: 'setup-ticket', description: 'إنشاء نظام التذاكر 🎫' },
        { name: 'status', description: 'حالة الاستضافة والـ Uptime 🟢' },
        { name: 'meme', description: 'ميمز عشوائية 🎭' },
        { name: 'time', description: 'عرض الوقت والتاريخ ⏰' },
        { name: 'mute', description: 'كتم عضو', options: [{ name: 'عضو', type: 6, description: 'العضو', required: true }, { name: 'المدة', type: 4, description: 'المدة بالدقائق', required: true }, { name: 'السبب', type: 3, description: 'السبب', required: false }] },
        { name: 'unmute', description: 'فك كتم عضو', options: [{ name: 'عضو', type: 6, description: 'العضو', required: true }] }
    ];
    await client.application.commands.set(cmds);
});

client.on('messageCreate', async (msg) => {
    if (msg.author.bot || !msg.guild) return;
    if (msg.content === "السلام عليكم") return msg.reply("وعليكم السلام ورحمة الله وبركاته، نورت! ✨");
    if (msg.content === "باك") return msg.reply("ولكم باك يا منور! 👋");
    const ch = msg.channel.name.toLowerCase();
    if (ch.includes('صور') || ch.includes('خط') || ch.includes('media') || ch.includes('أخبار') || ch.includes('اخبار')) {
        msg.channel.send('https://discordapp.net').catch(()=>{});
    }
    const uid = msg.author.id; if (!xpDatabase.has(uid)) xpDatabase.set(uid, { xp: 0, level: 1 });
    const u = xpDatabase.get(uid); u.xp += 10;
    if (u.xp >= u.level * 100) { u.level++; u.xp = 0; msg.reply(`🎉 مبروك لفل أب! وصلت مستوى **${u.level}**`).then(m => setTimeout(() => m.delete().catch(()=>{}), 5000)); }
    xpDatabase.set(uid, u);
});

client.on('voiceStateUpdate', async (oldSt, newSt) => {
    const user = newSt.member.user; const guild = newSt.guild;
    if (newSt.channel && (newSt.channel.name.includes('إنشاء روم') || newSt.channel.name.includes('tempvoice'))) {
        try {
            const vc = await guild.channels.create({ name: `🎙️ | روم ${user.username}`, type: ChannelType.GuildVoice, parent: newSt.channel.parentId, permissionOverwrites: [{ id: user.id, allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.DeafenMembers] }] });
            await newSt.member.voice.setChannel(vc); tempVoiceChannels.set(vc.id, user.id);
        } catch (e) {}
    }
    if (oldSt.channel && tempVoiceChannels.has(oldSt.channel.id) && oldSt.channel.members.size === 0) {
        try { await oldSt.channel.delete(); tempVoiceChannels.delete(oldSt.channel.id); } catch (e) {}
    }
});

client.on('interactionCreate', async (i) => {
    if (i.isChatInputCommand()) {
        const { commandName: cmd, options: opts } = i;
        if (cmd === 'help') return await i.reply({ embeds: [new EmbedBuilder().setColor('#5865F2').setTitle('🛠️ الأوامر').setDescription('العامة: `/user` `/server` `/rank` `/meme` `/time` `/quran` `/play-quran` `/stop-quran`\nالإدارية: `/clear` `/mute` `/unmute` `/setup-ticket`')] });
        if (cmd === 'time') return await i.reply({ content: `⏰ **الوقت الحالي:** <t:${Math.floor(Date.now()/1000)}:F>` });
        if (cmd === 'meme') return await i.reply({ content: `🎭 **ميمز:** بروبوت لما يشوف البوت حقك صار أونلاين ومنافس له: 👁️👄👁️` });
        if (cmd === 'user') return await i.reply({ content: `👤 اسم الحساب: ${i.user.username}\nID: ${i.user.id}` });
        if (cmd === 'server') return await i.reply({ content: `📊 أعضاء السيرفر: ${i.guild.memberCount}` });
        if (cmd === 'rank') { const d = xpDatabase.get(i.user.id) || { xp: 0, level: 1 }; return await i.reply({ content: `📊 المستوى: **${d.level}** | الـ XP: **${d.xp}/${d.level * 100}**` }); }
        if (cmd === 'clear') { if (!i.member.permissions.has(PermissionFlagsBits.ManageMessages)) return i.reply({ content: '❌ لا تملك صلاحية!', ephemeral: true }); await i.channel.bulkDelete(opts.getInteger('عدد'), true); return await i.reply({ content: `🧹 تم مسح الرسائل!`, ephemeral: true }); }
        if (cmd === 'status') { const ups = Math.floor((Date.now() - startTime)/1000); return await i.reply({ content: `🟢 أونلاين في السحاب ☁️\n⏱️ مدة التشغيل الحالية: ${Math.floor(ups/3600)} ساعة و ${Math.floor((ups%3600)/60)} دقيقة.` }); }
        
        if (cmd === 'play-quran') {
            const vc = i.member.voice.channel; if (!vc) return i.reply({ content: '❌ يجب أن تكون في روم صوتي أولاً!', ephemeral: true });
            await i.reply({ content: '🔄 جاري الاتصال بالروم وتشغيل بث القرآن الكريم الفخم...' }); 
            try {
                const conn = joinVoiceChannel({ channelId: vc.id, guildId: i.guild.id, adapterCreator: i.guild.voiceAdapterCreator, selfDeaf: false });
                player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
                const resource = createAudioResource('https://quran.com.sa', { inlineVolume: true });
                resource.volume.setVolume(1.0); 
                player.play(resource); conn.subscribe(player); 
                return await i.editReply({ content: `📻 **تم تشغيل إذاعة القرآن الكريم بنجاح الفائق!**\nالبوت متصل ومنور الحين في <#${vc.id}> والصوت شغال بنقاء تام.` });
            } catch (e) { return await i.editReply({ content: '❌ حدث خطأ أثناء محاولة بث الصوت، يرجى المحاولة مجدداً.' }); }
        }
        
        if (cmd === 'stop-quran') { const conn = joinVoiceChannel({ channelId: i.channel.id, guildId: i.guild.id, adapterCreator: i.guild.voiceAdapterCreator }); if (player) player.stop(); if (conn) conn.destroy(); return await i.reply({ content: '🛑 تم إيقاف تشغيل القرآن الكريم ومغادرة الروم.' }); }
        if (cmd === 'quran') { return await i.reply({ embeds: [new EmbedBuilder().setColor('#00563B').setTitle('🕋 بوابة القرآن الكريم').setDescription('اضغط على الأزرار للاستماع:')], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('المصحف كاملاً 📖').setStyle(ButtonStyle.Link).setURL('https://tvquran.com'), new ButtonBuilder().setLabel('إذاعة القرآن 📻').setStyle(ButtonStyle.Link).setURL('https://ddns.net'))] }); }
        if (cmd === 'setup-ticket') { if (!i.member.permissions.has(PermissionFlagsBits.Administrator)) return i.reply({ content: '❌ للمسؤولين فقط!', ephemeral: true }); return await i.reply({ embeds: [new EmbedBuilder().setColor('#5865F2').setTitle('🎫 مركز التذاكر').setDescription('اضغط لفتح تذكرة')], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('t_open').setLabel('فتح تذكرة 📩').setStyle(ButtonStyle.Primary))] }); }
        if (cmd === 'mute') {
            if (!i.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return i.reply({ content: '❌ لا تملك صلاحية!', ephemeral: true });
            const target = opts.getMember('عضو'); if (!target || !target.moderatable) return i.reply({ content: '❌ لا يمكن كتمه!', ephemeral: true });
            await target.timeout(opts.getInteger('المدة') * 60 * 1000, opts.getString('السبب') || 'بدون سبب'); return await i.reply({ content: `🔇 تم كتم <@${target.id}> بنجاح.` });
        }
        if (cmd === 'unmute') {
            if (!i.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return i.reply({ content: '❌ لا تملك صلاحية!', ephemeral: true });
            const target = opts.getMember('عضو'); if (!target || !target.communicationDisabledUntilTimestamp) return i.reply({ content: '⚠️ ليس مكتوماً!', ephemeral: true });
            await target.timeout(null); return await i.reply({ content: `🔊 تم فك الكتم عن <@${target.id}>.` });
        }
    }
    if (i.isButton()) {
        if (i.customId === 't_open') {
            const cName = `ticket-${i.user.username}`; if (i.guild.channels.cache.find(ch => ch.name === cName.toLowerCase())) return i.reply({ content: '⚠️ لديك تذكرة مفتوحة بالفعل!', ephemeral: true });
            const ch = await i.guild.channels.create({ name: cName, type: ChannelType.GuildText, permissionOverwrites: [{ id: i.guild.id, deny: [PermissionFlagsBits.ViewChannel] }, { id: i.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }] });

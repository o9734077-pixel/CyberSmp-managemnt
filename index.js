require('dotenv').config();
const http = require('http');
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, ActivityType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior } = require('@discordjs/voice');

http.createServer((req, res) => { res.write("Bot Alive"); res.end(); }).listen(process.env.PORT || 10000);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates] });
const xp = new Map(), vcs = new Map(), start = Date.now(); let player;

client.once('ready', async () => {
    console.log(`🚀 البوت جاهز ومنافس لبروبوت: ${client.user.tag}`);
    const cmds = [
        { name: 'help', description: 'لوحة التحكم الشاملة للأنظمة 🛠️' },
        { name: 'quran', description: 'روابط الاستماع للقرآن الكريم 🕋' },
        { name: 'play-quran', description: 'تشغيل إذاعة القرآن بالروم الصوتي 📻' },
        { name: 'stop-quran', description: 'إيقاف تشغيل القرآن ومغادرة الروم 🛑' },
        { name: 'user', description: 'معلومات حسابك 👤' },
        { name: 'server', description: 'إحصائيات السيرفر 📊' },
        { name: 'rank', description: 'عرض مستواك وبطاقتك 📊' },
        { name: 'status', description: 'حالة الاستضافة والـ Uptime 🟢' },
        { name: 'meme', description: 'ميمز عشوائية 🎭' },
        { name: 'time', description: 'عرض الوقت والتاريخ ⏰' },
        { name: 'setup-ticket', description: 'إنشاء نظام التذاكر 🎫' },
        { name: 'clear', description: 'مسح رسائل الشات', options: [{ name: 'عدد', type: 4, description: 'العدد', required: true }] },
        { name: 'mute', description: 'كتم عضو', options: [{ name: 'عضو', type: 6, description: 'العضو', required: true }, { name: 'المدة', type: 4, description: 'الدقائق', required: true }, { name: 'السبب', type: 3, description: 'السبب', required: false }] },
        { name: 'unmute', description: 'فك كتم عضو', options: [{ name: 'عضو', type: 6, description: 'العضو', required: true }] }
    ];
    await client.application.commands.set(cmds);
});

client.on('messageCreate', async (m) => {
    if (m.author.bot || !m.guild) return;
    if (m.content === "السلام عليكم") return m.reply("وعليكم السلام ورحمة الله وبركاته، نورت! ✨");
    if (m.content === "باك") return m.reply("ولكم باك يا منور! 👋");
    
    if (m.channel.name.toLowerCase().match(/(صور|خط|media|أخبار|اخبار)/)) {
        m.channel.send('https://discordapp.net').catch(()=>{});
    }
    const id = m.author.id; if (!xp.has(id)) xp.set(id, { xp: 0, level: 1 });
    const u = xp.get(id); u.xp += 10;
    if (u.xp >= u.level * 100) { u.level++; u.xp = 0; m.reply(`🎉 مبروك لفل أب! وصلت مستوى **${u.level}**`).then(x => setTimeout(() => x.delete().catch(()=>{}), 5000)); }
    xp.set(id, u);
});

client.on('voiceStateUpdate', async (o, n) => {
    const u = n.member.user, g = n.guild;
    if (n.channel && (n.channel.name.includes('إنشاء روم') || n.channel.name.includes('tempvoice'))) {
        try {
            const c = await g.channels.create({ name: `🎙️ | روم ${u.username}`, type: ChannelType.GuildVoice, parent: n.channel.parentId, permissionOverwrites: [{ id: u.id, allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.DeafenMembers] }] });
            await n.member.voice.setChannel(c); vcs.set(c.id, u.id);
        } catch (e) {}
    }
    if (o.channel && vcs.has(o.channel.id) && o.channel.members.size === 0) {
        try { await o.channel.delete(); vcs.delete(o.channel.id); } catch (e) {}
    }
});

client.on('interactionCreate', async (i) => {
    if (i.isChatInputCommand()) {
        const { commandName: cmd, options: opts } = i;
        if (cmd === 'help') return await i.reply({ content: ' العامة: `/user` `/server` `/rank` `/meme` `/time` `/quran` `/play-quran` `/stop-quran` \n الإدارية: `/clear` `/mute` `/unmute` `/setup-ticket` `/status`' });
        if (cmd === 'time') return await i.reply({ content: `⏰ **الوقت الحالي:** <t:${Math.floor(Date.now()/1000)}:F>` });
        if (cmd === 'meme') return await i.reply({ content: `🎭 **ميمز:** بروبوت لما يشوف البوت حقك صار أونلاين ومنافس له: 👁️👄👁️` });
        if (cmd === 'user') return await i.reply({ content: `👤 اسم الحساب: ${i.user.username}\nID: ${i.user.id}` });
        if (cmd === 'server') return await i.reply({ content: `📊 عدد الأعضاء: ${i.guild.memberCount}` });
        if (cmd === 'rank') { const d = xp.get(i.user.id) || { xp: 0, level: 1 }; return await i.reply({ content: `📊 المستوى: **${d.level}** | الـ XP: **${d.xp}/${d.level * 100}**` }); }
        if (cmd === 'status') { const ups = Math.floor((Date.now() - start)/1000); return await i.reply({ content: `🟢 أونلاين في السحاب ☁️\n⏱️ مدة التشغيل: ${Math.floor(ups/3600)} ساعة و ${Math.floor((ups%3600)/60)} دقيقة.` }); }
        if (cmd === 'clear') { if (!i.member.permissions.has(PermissionFlagsBits.ManageMessages)) return i.reply({ content: '❌ لا تملك صلاحية!', ephemeral: true }); await i.channel.bulkDelete(opts.getInteger('عدد'), true); return await i.reply({ content: `🧹 تم مسح الرسائل!`, ephemeral: true }); }
        if (cmd === 'setup-ticket') { if (!i.member.permissions.has(PermissionFlagsBits.Administrator)) return i.reply({ content: '❌ للمسؤولين فقط!', ephemeral: true }); return await i.reply({ embeds: [new EmbedBuilder().setColor('#5865F2').setTitle('🎫 مركز التذاكر').setDescription('اضغط لفتح تذكرة')], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('t_open').setLabel('فتح تذكرة 📩').setStyle(ButtonStyle.Primary))] }); }
        if (cmd === 'quran') return await i.reply({ embeds: [new EmbedBuilder().setColor('#00563B').setTitle('🕋 بوابة القرآن').setDescription('اضغط للاستماع:')], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('المصحف كاملاً 📖').setStyle(ButtonStyle.Link).setURL('https://tvquran.com'), new ButtonBuilder().setLabel('إذاعة القرآن 📻').setStyle(ButtonStyle.Link).setURL('https://ddns.net'))] });
        if (cmd === 'play-quran') {
            const vc = i.member.voice.channel; if (!vc) return i.reply({ content: '❌ يجب أن تكون في روم صوتي أولاً!', ephemeral: true });
            await i.reply({ content: '🔄 jari تشغيل بث القرآن الكريم...' }); 
            try {
                const conn = joinVoiceChannel({ channelId: vc.id, guildId: i.guild.id, adapterCreator: i.guild.voiceAdapterCreator, selfDeaf: false });
                player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
                const res = createAudioResource('https://quran.com.sa', { inlineVolume: true });
                res.volume.setVolume(1.0); player.play(res); conn.subscribe(player); 
                return await i.editReply({ content: `📻 **تم تشغيل إذاعة القرآن الكريم بنجاح!**\nالبوت شغال بنقاء تام في <#${vc.id}>.` });
            } catch (e) { return await i.editReply({ content: '❌ حدث خطأ أثناء بث الصوت.' }); }
        }
        if (cmd === 'stop-quran') { const conn = joinVoiceChannel({ channelId: i.channel.id, guildId: i.guild.id, adapterCreator: i.guild.voiceAdapterCreator }); if (player) player.stop(); if (conn) conn.destroy(); return await i.reply({ content: '🛑 تم إيقاف التشغيل ومغادرة الروم.' }); }
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
        const cName = `ticket-${i.user.username}`;
        if (i.customId === 't_open') {
            if (i.guild.channels.cache.find(ch => ch.name === cName.toLowerCase())) return i.reply({ content: '⚠️ لديك تذكرة مفتوحة بالفعل!', ephemeral: true });
            const ch = await i.guild.channels.create({ name: cName, type: ChannelType.GuildText, permissionOverwrites: [{ id: i.guild.id, deny: [PermissionFlagsBits.ViewChannel] }, { id: i.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }] });
            await ch.send({ content: `<@${i.user.id}>`, embeds: [new EmbedBuilder().setColor('#00FF00').setTitle(`🎫 تذكرة جديدة`).setDescription('اكتب مشكلتك هنا')], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('t_close').setLabel('إغلاق 🔒').setStyle(ButtonStyle.Danger))] });
            await i.reply({ content: `✅ تم إنشاء تذكرتك: <#${ch.id}>`, ephemeral: true });
        }
        if (i.customId === 't_close') { await i.reply({ content: '🔒 سيتم الحذف خلال 5 ثوانٍ...' }); setTimeout(() => i.channel.delete().catch(()=>{}), 5000); }
    }
});

client.login(process.env.DISCORD_TOKEN);


require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, ActivityType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates 
    ]
});

// Mock databases stored in memory
const xpDatabase = new Map();
const tempVoiceChannels = new Map(); 
const startTime = Date.now(); 

// Memes configuration array
const memesList = [
    "لما تسوي بوت ديسكورد ويشتغل من أول مرة بدون خطأ: 😎👑",
    "المبرمجين لما يشوفوا كود شغال ومحد يدري ليه شغال: 🤫😂",
    "لما تكتب كود 500 سطر وتنسى نقطة فاصلة وينفجر السيرفر: 💀",
    "بروبوت لما يشوف البوت حقك صار أونلاين ومنافس له: 👁️👄👁️"
];

// Smart Auto-Replies Configuration
const autoReplies = {
    "السلام عليكم": "وعليكم السلام ورحمة الله وبركاته، نورت السيرفر! ✨",
    "باك": "ولكم باك يا منور، ارحب! 👋",
    "بروبوت": "بروبوت من الماضي، الحين أنت في عصر البوت الخارق الجديد! 😉",
    "القرآن": "💡 تفضل استمع للقرآن الكريم: https://tvquran.com"
};

// 1. Client Initialization & Global Slash Commands Registration
client.once('ready', async () => {
    console.log(`🚀 البوت الخارق جاهز ومنافس لبروبوت: ${client.user.tag}`);
    client.user.setActivity('/help | أنظمة خارقة 🛡️', { type: ActivityType.Listening });

    const commands = [
        { name: 'help', description: 'عرض قائمة الأوامر الشاملة للبوت 🛠️' },
        { name: 'user', description: 'عرض معلومات حسابك بالتفصيل 👤' },
        { name: 'server', description: 'إحصائيات ومعلومات السيرفر بالكامل 📊' },
        { name: 'clear', description: 'تنظيف رسائل الشات بسرعة (للإدارة)', options: [{ name: 'عدد', type: 4, description: 'عدد الرسائل', required: true }] },
        { name: 'rank', description: 'عرض مستوى تفاعلك وبطاقتك (Level) 📊' },
        { name: 'setup-ticket', description: 'إنشاء رسالة نظام التذاكر (الدعم الفني) 🎫' },
        { name: 'status', description: 'عرض حالة الاستضافة ومدة تشغيل البوت (Uptime) 🟢' },
        { name: 'meme', description: 'ضحك وميمز عشوائية لتنشيط الشات 🎭' },
        { name: 'time', description: 'عرض الوقت والتاريخ الحالي بدقة عالية ⏰📅' },
        { 
            name: 'mute', 
            description: 'كتم عضو في السيرفر ومنعه من الكتابة والحديث 🔇',
            options: [
                { name: 'عضو', type: 6, description: 'العضو المراد كتمه', required: true },
                { name: 'المدة', type: 4, description: 'المدة بالدقائق', required: true },
                { name: 'السبب', type: 3, description: 'سبب الكتم', required: false }
            ]
        },
        {
            name: 'unmute',
            description: 'فك الكتم عن عضو في السيرفر وإعادة صلاحياته 🔊',
            options: [{ name: 'عضو', type: 6, description: 'العضو المراد فك الكتم عنه', required: true }]
        }
    ];

    try {
        await client.application.commands.set(commands);
        console.log('✅ تم تحديث الأوامر والأنظمة الجديدة بنجاح!');
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
});

// 2. Modernized Welcome System
client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.find(ch => ch.name.includes('welcome') || ch.name.includes('الترحيب'));
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`✨ عضو جديد انضم إلينا!`)
        .setDescription(`أهلاً بك <@${member.id}> في سيرفر **${member.guild.name}**!\n\nأنت العضو رقم **${member.guild.memberCount}** 🎉`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
        
    channel.send({ embeds: [embed] }).catch(() => {});
});

// 3. Automated Messaging Features (Auto-Reply, Lines, XP Engine)
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    // A) Intelligent Auto-Reply Handler
    const text = message.content.trim();
    if (autoReplies[text]) {
        return message.reply(autoReplies[text]).catch(() => {});
    }

    // B) Automatic Decorative Line Generator
    if (message.channel.name.includes('صور') || message.channel.name.includes('media') || message.channel.name.includes('خط')) {
        message.channel.send('https://discordapp.com').catch(() => {});
    }

    // C) Interactive Leveling & Experience Matrix
    const userId = message.author.id;
    if (!xpDatabase.has(userId)) {
        xpDatabase.set(userId, { xp: 0, level: 1 });
    }

    const userData = xpDatabase.get(userId);
    userData.xp += Math.floor(Math.random() * 10) + 5;

    const nextLevelXp = userData.level * 100;
    if (userData.xp >= nextLevelXp) {
        userData.level++;
        userData.xp = 0;
        message.reply(`🎉 مبروك يا <@${userId}>! لقد ارتفع مستواك إلى **المستوى ${userData.level}** 🚀`)
            .then(m => setTimeout(() => m.delete().catch(() => {}), 5000))
            .catch(() => {});
    }
    xpDatabase.set(userId, userData);
});

// 4. Advanced Temporary Voice Infrastructure (Temp Voice)
client.on('voiceStateUpdate', async (oldState, newState) => {
    const user = newState.member.user;
    const guild = newState.guild;

    // Trigger Room Construction Engine
    if (newState.channel && (newState.channel.name.includes('إنشاء روم') || newState.channel.name.includes('create voice') || newState.channel.name.includes('tempvoice'))) {
        try {
            const voiceChannel = await guild.channels.create({
                name: `🎙️ | روم ${user.username}`,
                type: ChannelType.GuildVoice,
                parent: newState.channel.parentId,
                permissionOverwrites: [
                    {
                        id: user.id,
                        allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.DeafenMembers]
                    }
                ]
            });

            await newState.member.voice.setChannel(voiceChannel);
            tempVoiceChannels.set(voiceChannel.id, user.id);
        } catch (error) {
            console.error('Error generating temporary room:', error);
        }
    }

    // Automated Empty Channel Cleanup Loop
    if (oldState.channel) {
        const channelId = oldState.channel.id;
        if (tempVoiceChannels.has(channelId)) {
            if (oldState.channel.members.size === 0) {
require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, ActivityType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates 
    ]
});

const xpDatabase = new Map();
const tempVoiceChannels = new Map(); 
const startTime = Date.now(); 

const memesList = [
    "لما تسوي بوت ديسكورد ويشتغل من أول مرة بدون خطأ: 😎👑",
    "المبرمجين لما يشوفوا كود شغال ومحد يدري ليه شغال: 🤫😂",
    "لما تكتب كود 500 سطر وتنسى نقطة فاصلة وينفجر السيرفر: 💀",
    "بروبوت لما يشوف البوت حقك صار أونلاين ومنافس له: 👁️👄👁️"
];

const autoReplies = {
    "السلام عليكم": "وعليكم السلام ورحمة الله وبركاته، نورت السيرفر! ✨",
    "باك": "ولكم باك يا منور، ارحب! 👋",
    "بروبوت": "بروبوت من الماضي، الحين أنت في عصر البوت الخارق الجديد! 😉",
    "القرآن": "💡 تفضل استمع للقرآن الكريم: https://tvquran.com"
};

client.once('ready', async () => {
    console.log(`🚀 البوت الخارق جاهز ومنافس لبروبوت: ${client.user.tag}`);
    client.user.setActivity('/help | أنظمة خارقة 🛡️', { type: ActivityType.Listening });

    const commands = [
        { name: 'help', description: 'عرض قائمة الأوامر الشاملة للبوت 🛠️' },
        { name: 'user', description: 'عرض معلومات حسابك بالتفصيل 👤' },
        { name: 'server', description: 'إحصائيات ومعلومات السيرفر بالكامل 📊' },
        { name: 'clear', description: 'تنظيف رسائل الشات بسرعة (للإدارة)', options: [{ name: 'عدد', type: 4, description: 'عدد الرسائل', required: true }] },
        { name: 'rank', description: 'عرض مستوى تفاعلك وبطاقتك (Level) 📊' },
        { name: 'setup-ticket', description: 'إنشاء رسالة نظام التذاكر (الدعم الفني) 🎫' },
        { name: 'status', description: 'عرض حالة الاستضافة ومدة تشغيل البوت (Uptime) 🟢' },
        { name: 'meme', description: 'ضحك وميمز عشوائية لتنشيط الشات 🎭' },
        { name: 'time', description: 'عرض الوقت والتاريخ الحالي بدقة عالية ⏰📅' },
        { 
            name: 'mute', 
            description: 'كتم عضو في السيرفر ومنعه من الكتابة والحديث 🔇',
            options: [
                { name: 'عضو', type: 6, description: 'العضو المراد كتمه', required: true },
                { name: 'المدة', type: 4, description: 'المدة بالدقائق', required: true },
                { name: 'السبب', type: 3, description: 'سبب الكتم', required: false }
            ]
        },
        {
            name: 'unmute',
            description: 'فك الكتم عن عضو في السيرفر وإعادة صلاحياته 🔊',
            options: [{ name: 'عضو', type: 6, description: 'العضو المراد فك الكتم عنه', required: true }]
        }
    ];

    try {
        await client.application.commands.set(commands);
        console.log('✅ تم تحديث الأوامر والأنظمة الجديدة بنجاح!');
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
});

client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.find(ch => ch.name.includes('welcome') || ch.name.includes('الترحيب'));
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`✨ عضو جديد انضم إلينا!`)
        .setDescription(`أهلاً بك <@${member.id}> في سيرفر **${member.guild.name}**!\n\nأنت العضو رقم **${member.guild.memberCount}** 🎉`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
        
    channel.send({ embeds: [embed] }).catch(() => {});
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const text = message.content.trim();
    if (autoReplies[text]) {
        return message.reply(autoReplies[text]).catch(() => {});
    }

    if (message.channel.name.includes('صور') || message.channel.name.includes('media') || message.channel.name.includes('خط')) {
        message.channel.send('https://discordapp.com').catch(() => {});
    }

    const userId = message.author.id;
    if (!xpDatabase.has(userId)) {
        xpDatabase.set(userId, { xp: 0, level: 1 });
    }

    const userData = xpDatabase.get(userId);
    userData.xp += Math.floor(Math.random() * 10) + 5;

    const nextLevelXp = userData.level * 100;
    if (userData.xp >= nextLevelXp) {
        userData.level++;
        userData.xp = 0;
        message.reply(`🎉 مبروك يا <@${userId}>! لقد ارتفع مستواك إلى **المستوى ${userData.level}** 🚀`)
            .then(m => setTimeout(() => m.delete().catch(() => {}), 5000))
            .catch(() => {});
    }
    xpDatabase.set(userId, userData);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    const user = newState.member.user;
    const guild = newState.guild;

    if (newState.channel && (newState.channel.name.includes('إنشاء روم') || newState.channel.name.includes('create voice') || newState.channel.name.includes('tempvoice'))) {
        try {
            const voiceChannel = await guild.channels.create({
                name: `🎙️ | روم ${user.username}`,
                type: ChannelType.GuildVoice,
                parent: newState.channel.parentId,
                permissionOverwrites: [
                    {
                        id: user.id,
                        allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.DeafenMembers]
                    }
                ]
            });

            await newState.member.voice.setChannel(voiceChannel);
            tempVoiceChannels.set(voiceChannel.id, user.id);
        } catch (error) {
            console.error('Error generating temporary room:', error);
        }
    }

    if (oldState.channel) {
        const channelId = oldState.channel.id;
        if (tempVoiceChannels.has(channelId)) {
            if (oldState.channel.members.size === 0) {
                try {
                    await oldState.channel.delete();
                    tempVoiceChannels.delete(channelId);
                } catch (error) {
                    console.error('Error cleaning up empty temporary channel:', error);
                }
            }
        }
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName, options } = interaction;

    if (commandName === 'help') {
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🛠️ لوحة التحكم الشاملة للأنظمة')
            .addFields(
                { name: '👤 أوامر عامة ومسلية:', value: '`/user` - `/server` - `/rank` - `/meme` - `/time`' },
                { name: '⚙️ حالة الاستضافة والتشغيل:', value: '`/status`' },
                { name: '🔨 أنظمة إدارية متطورة:', value: '`/clear` - `/mute` - `/unmute` - `/setup-ticket`' },
                { name: '🎤 نظام غرف الصوت المؤقتة:', value: 'قم بإنشاء روم صوتي عادي بسيرفرك وسمّه الحروف: `إنشاء روم` وشاهد السحر!' },
                { name: '🤖 الردود التلقائية:', value: '`السلام عليكم` - `باك` - `بروبوت`' }
            );
        await interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'mute') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.reply({ content: '❌ لا تمتلك صلاحية إدارة الأعضاء!', ephemeral: true });
        const targetMember = options.getMember('عضو');
        const durationMinutes = options.getInteger('المدة');
        const reason = options.getString('السبب') || 'لم يتم تحديد سبب الكتم';
        
        if (!targetMember || !targetMember.moderatable) return interaction.reply({ content: '❌ لا يمكنني كتم هذا العضو!', ephemeral: true });
        
        await targetMember.timeout(durationMinutes * 60 * 1000, reason);
        await interaction.reply({ content: `🔇 تم كتم <@${targetMember.id}> لمدة ${durationMinutes} دقيقة. السبب: ${reason}` });
    }

    if (commandName === 'unmute') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.reply({ content: '❌ لا تمتلك الصلاحية!', ephemeral: true });
        const targetMember = options.getMember('عضو');
        
        if (!targetMember || !targetMember.communicationDisabledUntilTimestamp) return interaction.reply({ content: '⚠️ العضو ليس مكتوماً!', ephemeral: true });
        
        await targetMember.timeout(null);
        await interaction.reply({ content: `🔊 تم فك الكتم بنجاح عن <@${targetMember.id}>.` });
    }

    if (commandName === 'time') {
        const now = new Date();
        const discordTimestamp = Math.floor(now.getTime() / 1000);
        await interaction.reply({ content: `⏰ **الوقت الحالي الحي بجهازك:** <t:${discordTimestamp}:F>` });
    }

    if (commandName === 'status') {
        const totalUptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
        const hours = Math.floor(totalUptimeSeconds / 3600);
        const minutes = Math.floor((totalUptimeSeconds % 3600) / 60);
        await interaction.reply({ content: `🟢 **حالة البوت والأداء:** مستقر أونلاين في السحاب ☁\n⏱️ **مدة التشغيل الحالية:** ${hours} ساعة و ${minutes} دقيقة بدون أي انقطاع.` });
    }

    if (commandName === 'meme') {
        const randomMeme = memesList[Math.floor(Math.random() * memesList.length)];
        await interaction.reply({ content: `🎭 **ميمز:** ${randomMeme}` });
    }

    if (commandName === 'user') {
        await interaction.reply({ content: `👤 **معلومات حسابك:**\nالاسم: ${interaction.user.username}\nالمعرّف (ID): ${interaction.user.id}` });
    }

    if (commandName === 'server') {
        await interaction.reply({ content: `📊 **معلومات سيرفر ${interaction.guild.name}:**\nعدد الأعضاء الكلي الحالي: ${interaction.guild.memberCount}` });
    }

    if (commandName === 'clear') {


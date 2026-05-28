require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, ActivityType, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// قواعد بيانات وهمية في الذاكرة (للتجربة المحلية وسرعة الأداء)
const xpDatabase = new Map();

client.once('ready', async () => {
    console.log(`🚀 البوت الخارق جاهز ومنافس لبروبوت: ${client.user.tag}`);
    client.user.setActivity('/help | نظام متكامل 🛡️', { type: ActivityType.Listening });

    // تسجيل كافة أوامر بروبوت الحديثة
    const commands = [
        { name: 'help', description: 'عرض قائمة الأوامر الشاملة للبوت 🛠️' },
        { name: 'user', description: 'عرض معلومات حسابك بالتفصيل 👤' },
        { name: 'server', description: 'إحصائيات ومعلومات السيرفر بالكامل 📊' },
        { name: 'clear', description: 'تنظيف رسائل الشات بسرعة (للإدارة)', options: [{ name: 'عدد', type: 4, description: 'عدد الرسائل', required: true }] },
        { name: 'ban', description: 'حظر عضو من السيرفر 🔨', options: [{ name: 'عضو', type: 6, description: 'العضو المراد حظره', required: true }, { name: 'السبب', type: 3, description: 'سبب الحظر' }] },
        { name: 'kick', description: 'طرد عضو من السيرفر 🚪', options: [{ name: 'عضو', type: 6, description: 'العضو المراد طرده', required: true }, { name: 'السبب', type: 3, description: 'سبب الطرد' }] },
        { name: 'rank', description: 'عرض مستوى تفاعلك وبطاقتك (Level) 📊' },
        { name: 'setup-ticket', description: 'إنشاء رسالة نظام التذاكر (الدعم الفني) 🎫' }
    ];

    await client.application.commands.set(commands);
    console.log('✅ تم تسجيل كافة الأوامر والأنظمة الاحترافية بنجاح!');
});

// 1. نظام الترحيب المتطور (Welcome System)
client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.find(ch => ch.name.includes('welcome') || ch.name.includes('الترحيب'));
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`✨ عضو جديد انضم إلينا!`)
        .setDescription(`أهلاً بك <@${member.id}> في سيرفر **${member.guild.name}**!\n\nأنت العضو رقم **${member.guild.memberCount}** 🎉`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
    channel.send({ embeds: [embed] });
});

// 2. نظام التفاعل، الليفلات، ونظام الخط التلقائي (Levels & Auto-Line)
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    // أ) نظام الخط التلقائي في رومات الصور أو المنشورات
    if (message.channel.name.includes('صور') || message.channel.name.includes('media') || message.channel.name.includes('خط')) {
        // يمكنكِ وضع رابط خط السيرفر الخاص بكِ هنا
        message.channel.send('https://discordapp.com').catch(() => {});
    }

    // ب) نظام حساب النقاط والليفلات (XP)
    const userId = message.author.id;
    if (!xpDatabase.has(userId)) {
        xpDatabase.set(userId, { xp: 0, level: 1 });
    }

    const userData = xpDatabase.get(userId);
    userData.xp += Math.floor(Math.random() * 10) + 5; // يعطي ما بين 5 إلى 15 نقطة لكل رسالة

    const nextLevelXp = userData.level * 100;
    if (userData.xp >= nextLevelXp) {
        userData.level++;
        userData.xp = 0;
        message.reply(`🎉 مبروك يا <@${userId}>! لقد ارتفع مستواك إلى **المستوى ${userData.level}** 🚀`).then(m => setTimeout(() => m.delete(), 5000));
    }
    xpDatabase.set(userId, userData);
});

// 3. الاستجابة لجميع الأوامر (Interaction Management)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName, options } = interaction;

    // أمر المساعدة المطور
    if (commandName === 'help') {
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🛠️ قائمة أوامر البوت الخارق (المنافس لبروبوت)')
            .addFields(
                { name: '👤 الأوامر العامة:', value: '`/user` - `/server` - `/rank`' },
                { name: '🔨 الأوامر الإدارية:', value: '`/clear` - `/ban` - `/kick`' },
                { name: '🎫 أنظمة متطورة:', value: '`/setup-ticket` (لإنشاء نظام تذاكر ودعم فني)' }
            );
        await interaction.reply({ embeds: [embed] });
    }

    // أمر معلومات الحساب
    if (commandName === 'user') {
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle(`👤 معلومات حساب: ${interaction.user.username}`)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'ID الحساب:', value: interaction.user.id, inline: true },
                { name: 'تاريخ الإنشاء:', value: `<t:${Math.floor(interaction.user.createdTimestamp / 1000)}:R>`, inline: true }
            );
        await interaction.reply({ embeds: [embed] });
    }

    // أمر معلومات السيرفر
    if (commandName === 'server') {
        const embed = new EmbedBuilder()
            .setColor('#FFFF00')
            .setTitle(`📊 إحصائيات سيرفر ${interaction.guild.name}`)
            .addFields(
                { name: 'الأعضاء:', value: `${interaction.guild.memberCount}`, inline: true },
                { name: 'المالك:', value: `<@${interaction.guild.ownerId}>`, inline: true }
            );
        await interaction.reply({ embeds: [embed] });
    }

    // أمر مسح الشات
    if (commandName === 'clear') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) return interaction.reply({ content: '❌ لا تملك صلاحية!', ephemeral: true });
        const amount = options.getInteger('عدد');
        await interaction.channel.bulkDelete(amount, true);
        await interaction.reply({ content: `🧹 تم مسح **${amount}** رسالة بنجاح!`, ephemeral: true });
    }

    // أمر البان (الحظر)
    if (commandName === 'ban') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) return interaction.reply({ content: '❌ لا تملك صلاحية الحظر!', ephemeral: true });
        const user = options.getUser('عضو');
        const reason = options.getString('السبب') || 'بدون سبب';
        await interaction.guild.members.ban(user, { reason });
        await interaction.reply({ content: `🔨 تم حظر <@${user.id}> بنجاح. السبب: ${reason}` });
    }

    // أمر الكيك (الطرد)
    if (commandName === 'kick') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) return interaction.reply({ content: '❌ لا تملك صلاحية الطرد!', ephemeral: true });
        const member = options.getMember('عضو');
        const reason = options.getString('السبب') || 'بدون سبب';
        await member.kick(reason);
        await interaction.reply({ content: `🚪 تم طرد <@${member.id}> بنجاح. السبب: ${reason}` });
    }

    // أمر عرض اللفل (Rank)
    if (commandName === 'rank') {
        const data = xpDatabase.get(interaction.user.id) || { xp: 0, level: 1 };
        await interaction.reply({ content: `📊 **بطاقة تفاعلك:**\nالمستوى الحالي: **${data.level}**\nنقاط الخبرة (XP): **${data.xp}/${data.level * 100}**` });
    }

    // أمر تجهيز نظام التذاكر (Ticket Setup)
    if (commandName === 'setup-ticket') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: '❌ هذا الأمر للمسؤولين فقط!', ephemeral: true });
        
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎫 مركز الدعم الفني والتذاكر')
            .setDescription('إذا كنت بحاجة إلى مساعدة أو ترغب بالتواصل مع الإدارة، اضغط على الزر بالأسفل لفتح تذكرة خاصة بك.');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_ticket')
                .setLabel('فتح تذكرة 📩')
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
});

// 4. نظام إدارة التذاكر التفاعلي (Ticket Logic)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'open_ticket') {
        const channelName = `ticket-${interaction.user.username}`;
        
        // منع العضو من فتح أكثر من تذكرة بنفس الوقت
        const existingChannel = interaction.guild.channels.cache.find(ch => ch.name === channelName.toLowerCase());
        if (existingChannel) return interaction.reply({ content: '⚠️ لديك تذكرة مفتوحة بالفعل هنا: ' + `<#${existingChannel.id}>`, ephemeral: true });

        // إنشاء روم التذكرة ومنع بقية الأعضاء من رؤيته
        const ticketChannel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ]
        });

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle(`🎫 تذكرة جديدة: ${interaction.user.username}`)
            .setDescription('أهلاً بك، يرجى كتابة مشكلتك هنا وسيقوم فريق الإدارة بالرد عليك في أقرب وقت.');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('إغلاق التذكرة 🔒')
                .setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({ content: `<@${interaction.user.id}> | فريق الدعم`, embeds: [embed], components: [row] });
        await interaction.reply({ content: `✅ تم إنشاء تذكرتك بنجاح: <#${ticketChannel.id}>`, ephemeral: true });
    }


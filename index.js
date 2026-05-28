require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, ActivityType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// 1. تشغيل البوت وتجهيز الأوامر والـ Status الحركية
client.once('ready', async () => {
    console.log(`🚀 تم تشغيل الأقوى بنجاح: ${client.user.tag}`);
    
    // وضع حالة مميزة للبوت (Status)
    client.user.setActivity('Better than ProBot! 😉', { type: ActivityType.Custom });

    // تسجيل الأوامر الذكية (Slash Commands) في السيرفر تلقائياً
    const commands = [
        {
            name: 'help',
            description: 'عرض قائمة الأوامر الخارقة للبوت 🛠️',
        },
        {
            name: 'userinfo',
            description: 'عرض معلوماتك أو معلومات عضو آخر بالتفصيل 👤',
        },
        {
            name: 'clear',
            description: 'مسح الشات بسرعة فائقة (للإدارة فقط) 🧹',
            options: [{ name: 'عدد', type: 4, description: 'عدد الرسائل المراد مسحها', required: true }]
        },
        {
            name: 'server',
            description: 'عرض إحصائيات ومعلومات السيرفر بشكل احترافي 📊',
        }
    ];

    await client.application.commands.set(commands);
    console.log('✅ تم تحديث الأوامر الذكية بنجاح!');
});

// 2. نظام الترحيب التلقائي المتطور بالأعضاء الجدد (Welcome System)
client.on('guildMemberAdd', async (member) => {
    const welcomeChannel = member.guild.channels.cache.find(ch => ch.name.includes('welcome') || ch.name.includes('الترحيب'));
    if (!welcomeChannel) return;

    const welcomeEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`👋 أهلاً بك في السيرفر يا بطل!`)
        .setDescription(`مرحباً بك <@${member.id}> في **${member.guild.name}**!\n\n✨ أنت العضو رقم **${member.guild.memberCount}** في عائلتنا.`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setFooter({ text: 'نتمنى لك وقتاً ممتعاً!', iconURL: member.guild.iconURL() });

    welcomeChannel.send({ embeds: [welcomeEmbed] });
});

// 3. الاستجابة للأوامر الذكية (Slash Commands)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options } = interaction;

    // أمر المساعدة
    if (commandName === 'help') {
        const helpEmbed = new EmbedBuilder()
            .setColor('#00FF7F')
            .setTitle('🛠️ لوحة تحكم الأوامر')
            .setDescription('أهلاً بك! إليك الأوامر المتاحة حالياً والمصممة لتكون أسرع وأفضل:')
            .addFields(
                { name: '`/help`', value: 'عرض هذه القائمة اللطيفة.' },
                { name: '`/userinfo`', value: 'يظهر معلومات حسابك وتاريخ انضمامك.' },
                { name: '`/server`', value: 'يعرض معلومات السيرفر وعدد الأعضاء الحالي.' },
                { name: '`/clear`', value: 'لمسح الرسائل وتنظيف الروم بلمح البصر (للإدارة).' }
            )
            .setFooter({ text: 'تم التطوير خصيصاً لسيرفركم 🚀' });

        await interaction.reply({ embeds: [helpEmbed] });
    }

    // أمر معلومات الحساب
    if (commandName === 'userinfo') {
        const userEmbed = new EmbedBuilder()
            .setColor('#1E90FF')
            .setTitle(`👤 معلومات الحساب`)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'الاسم الكامل:', value: `${interaction.user.tag}`, inline: true },
                { name: 'المعرف الشخصي (ID):', value: `${interaction.user.id}`, inline: true },
                { name: 'تاريخ إنشاء الحساب:', value: `<t:${Math.floor(interaction.user.createdTimestamp / 1000)}:R>`, inline: false }
            );
        await interaction.reply({ embeds: [userEmbed] });
    }

    // أمر مسح الشات الإداري سريع الاستجابة
    if (commandName === 'clear') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: '❌ ليس لديك صلاحية مسح الرسائل!', ephemeral: true });
        }
        const amount = options.getInteger('عدد');
        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: '⚠️ يجب أن يكون العدد بين 1 و 100 رسالة.', ephemeral: true });
        }

        await interaction.channel.bulkDelete(amount, true);
        await interaction.reply({ content: `🧹 تم مسح **${amount}** رسالة بنجاح وبسرعة فائقة!`, ephemeral: true });
    }

    // أمر معلومات وإحصائيات السيرفر
    if (commandName === 'server') {
        const serverEmbed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle(`📊 إحصائيات سيرفر ${interaction.guild.name}`)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '👑 صاحب السيرفر:', value: `<@${interaction.guild.ownerId}>`, inline: true },
                { name: '👥 عدد الأعضاء الكلي:', value: `${interaction.guild.memberCount}`, inline: true },
                { name: '📅 تاريخ التأسيس:', value: `<t:${Math.floor(interaction.guild.createdTimestamp / 1000)}:F>`, inline: false }
            );
        await interaction.reply({ embeds: [serverEmbed] });
    }
});

// 4. نظام الحماية الذكي والتلقائي ضد السبام والروابط (Anti-Spam & Anti-Links)
const usersMap = new Map();
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    // حظر الروابط المزعجة تلقائياً لحماية السيرفر
    if (message.content.includes('discord.gg/') || message.content.includes('http')) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            await message.delete().catch(() => {});
            return message.channel.send(`⚠️ عذراً <@${message.author.id}>، يمنع نشر الروابط هنا لحماية السيرفر!`).then(m => setTimeout(() => m.delete(), 4000));
        }
    }

    // حماية ضد التكرار السريع (السبام)
    if (usersMap.has(message.author.id)) {
        const userData = usersMap.get(message.author.id);
        const { lastMessage, timer } = userData;
        let msgCount = userData.msgCount;
        
        if (Date.now() - lastMessage.createdTimestamp < 2000) {
            msgCount++;
            if (msgCount >= 4) { // إذا أرسل 4 رسائل في أقل من ثانيتين
                await message.delete().catch(() => {});
                message.channel.send(`🤫 هدأ اللعب قليلاً يا <@${message.author.id}>، ممنوع السبام!`).then(m => setTimeout(() => m.delete(), 3000));
            } else {
                usersMap.set(message.author.id, { msgCount, lastMessage: message, timer });
            }
        } else {
            clearTimeout(timer);
            const fn = setTimeout(() => usersMap.delete(message.author.id), 5000);
            usersMap.set(message.author.id, { msgCount: 1, lastMessage: message, timer: fn });
        }
    } else {
        const fn = setTimeout(() => usersMap.delete(message.author.id), 5000);
        usersMap.set(message.author.id, { msgCount: 1, lastMessage: message, timer: fn });
    }
});

client.login(process.env.DISCORD_TOKEN);

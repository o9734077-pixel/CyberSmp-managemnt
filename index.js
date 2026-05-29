const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { Rcon } = require('rcon-client'); 
const express = require('express');

// =============================================================
// 🌐 نظام منع النوم المطور (سيرفر ويب داخلي للاستضافة المجانية)
// =============================================================
const app = express();
app.get('/', (req, res) => {
    res.send({ status: "Online", uptime: process.uptime(), message: "Ultimate Bot is running 24/7!" });
});
app.listen(8080, () => console.log("⚡ [Web Server] Ready on port 8080"));

// =============================================================
// 🤖 إعدادات البوت والـ Intents الأساسية لقراءة البيانات
// =============================================================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// ذاكرة مؤقتة لحفظ البيانات (لأنك على استضافة مجانية)
const autoLineChannels = new Set(); // لحفظ رومات الخط التلقائي
const autoResponses = new Map();   // لحفظ الردود التلقائية (كلمة -> رد)

const LINE_URL = "https://media.discordapp.net/attachments/932674509461401600/932682689490866176/9.gif";

// =============================================================
// 🚀 تسجيل أوامر الـ Slash Commands في الديسكورد
// =============================================================
const commands = [
    // أمر الأوتو لاين /auto-line set channel
    new SlashCommandBuilder()
        .setName('auto-line')
        .setDescription('إعدادات نظام الخط التلقائي')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('تحديد روم للخط التلقائي')
                .addChannelOption(option => option.setName('channel').setDescription('اختر الروم').setRequired(true))
        ),
    // أمر الرد التلقائي /auto-respond set
    new SlashCommandBuilder()
        .setName('auto-respond')
        .setDescription('إعدادات نظام الرد التلقائي')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('إضافة كلمة ورد تلقائي مخصص')
                .addStringOption(option => option.setName('word').setDescription('الكلمة المفتاحية (مثال: السلام)').setRequired(true))
                .addStringOption(option => option.setName('reply').setDescription('الرد الذي سيقوم به البوت').setRequired(true))
        ),
    // أمر المساعدة العام
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('عرض قائمة أوامر البوت الشاملة')
];

client.once('ready', async () => {
    console.log(`✅ [Bot Active] Logged in as ${client.user.tag}`);
    
    // تسجيل الأوامر تلقائياً فور تشغيل البوت
    const rest = new REST({ version: '10' }).setToken(client.token);
    try {
        console.log('⏳ جاري تحديث أوامر الـ Slash Commands...');
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('🎉 تم تسجيل جميع أوامر الـ Slash Commands بنجاح!');
    } catch (error) {
        console.error('❌ حدث خطأ أثناء تسجيل الأوامر:', error);
    }
});

// =============================================================
// ⚡ معالجة وإدارة أوامر الـ Slash Commands (Interaction)
// =============================================================
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options } = interaction;

    // 1. معالجة أمر /auto-line set
    if (commandName === 'auto-line') {
        const subcommand = options.getSubcommand();
        if (subcommand === 'set') {
            const channel = options.getChannel('channel');
            autoLineChannels.add(channel.id);
            await interaction.reply({ content: `✅ تم تفعيل **الخط التلقائي** بنجاح في روم: ${channel}`, ephemeral: true });
        }
    }
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, REST, Routes, SlashCommandBuilder, ActivityType } = require('discord.js');
const { Rcon } = require('rcon-client'); 
const express = require('express');

// =============================================================
// 🌐 نظام منع النوم المطور (سيرفر ويب داخلي للاستضافة المجانية)
// =============================================================
const app = express();
app.get('/', (req, res) => {
    res.send({ status: "Online", uptime: process.uptime(), message: "CyberSMP Ultimate Bot is running 24/7!" });
});
app.listen(8080, () => console.log("⚡ [Web Server] Ready on port 8080"));

// =============================================================
// 🤖 إعدادات البوت والـ Intents الأساسية لقراءة البيانات
// =============================================================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// ذاكرة حفظ البيانات المؤقتة
const autoLineChannels = new Set(); 
const autoResponses = new Map();   

const LINE_URL = "https://discordapp.net";

// =============================================================
// 🚀 تسجيل وإعداد كافة الأوامر الشاملة (Slash Commands)
// =============================================================
const commands = [
    // 1. نظام الأوتو لاين المطور (تفعيل وإلغاء)
    new SlashCommandBuilder()
        .setName('auto-line')
        .setDescription('⚙️ إعدادات نظام الخط التلقائي')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('📍 تحديد روم للخط التلقائي')
                .addChannelOption(option => option.setName('channel').setDescription('اختر الروم المراد تفعيل الخط بها').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('❌ إزالة الخط التلقائي من روم')
                .addChannelOption(option => option.setName('channel').setDescription('اختر الروم المراد إلغاء الخط منها').setRequired(true))
        ),

    // 2. نظام الرد التلقائي المطور (إضافة وإزالة)
    new SlashCommandBuilder()
        .setName('auto-respond')
        .setDescription('⚙️ إعدادات نظام الرد التلقائي')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('➕ إضافة كلمة ورد تلقائي مخصص')
                .addStringOption(option => option.setName('word').setDescription('الكلمة المفتاحية (مثال: السلام)').setRequired(true))
                .addStringOption(option => option.setName('reply').setDescription('الرد الذي سيقوم به البوت').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('➖ حذف كلمة من الرد التلقائي')
                .addStringOption(option => option.setName('word').setDescription('اكتب الكلمة المراد حذف ردها').setRequired(true))
        ),

    // 3. تحكم ماين كرافت (RCON)
    new SlashCommandBuilder()
        .setName('mc')
        .setDescription('🎮 التحكم الكامل بسيرفر ماين كرافت عن بعد')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName('command').setDescription('اكتب الأمر الموجه لكنسول السيرفر (مثال: list أو op Name)').setRequired(true)),

    // 4. إعداد التيكت والدعم الفني
    new SlashCommandBuilder()
        .setName('setup-ticket')
        .setDescription('🎫 إنشاء منشور مركز الدعم الفني وتذاكر المساعدة')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    // 5. أوامر الإدارة والإشراف والحماية
    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('🧹 تنظيف وغسيل رسائل الشات بسرعة')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option => option.setName('amount').setDescription('عدد الرسائل المراد حذفها (1-100)').setRequired(true)),

    new SlashCommandBuilder()
        .setName('mute')
        .setDescription('🔇 كتم عضو مؤقتاً (Timeout)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => option.setName('user').setDescription('اختر العضو المراد كتمه').setRequired(true))
        .addIntegerOption(option => option.setName('minutes').setDescription('مدة الكتم بالدقائق').setRequired(true)),

    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('🚪 طرد عضو خارج السيرفر')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option => option.setName('user').setDescription('اختر العضو المراد طرده').setRequired(true)),

    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('🔨 حظر عضو نهائياً من السيرفر')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option => option.setName('user').setDescription('اختر العضو المراد حظره').setRequired(true)),

    // 6. أوامر عامة وتسلية وإحصائيات
    new SlashCommandBuilder()
        .setName('server-info')
        .setDescription('📊 عرض كافة إحصائيات ومعلومات السيرفر الحالية'),

    new SlashCommandBuilder()
        .setName('user-info')
        .setDescription('👤 عرض معلومات بطاقة حسابك المبرمجة')
        .addUserOption(option => option.setName('user').setDescription('اختر عضواً لرؤية معلوماته (اختياري)')),

    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('🏓 فحص سرعة استجابة اتصال البوت بالخوادم'),

    new SlashCommandBuilder()
        .setName('meme')
        .setDescription('🎭 إلقاء نكتة أو ميم عشوائي للتسلية وبث روح التفاعل'),

    new SlashCommandBuilder()
        .setName('help')
        .setDescription('📜 فتح الدليل الشامل لكافة أنظمة وأوامر البوت')
];

client.once('ready', async () => {
    console.log(`✅ [Bot Active] Logged in as ${client.user.tag}`);
    
    // تحديث الحالة التلقائية للبوت بناءً على الأعضاء
    setInterval(() => {
        const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        client.user.setActivity(`${totalMembers} بطل في CyberSMP 🛡️`, { type: ActivityType.Watching });
    }, 60000);

    // تسجيل الأوامر تلقائياً
    const rest = new REST({ version: '10' }).setToken(client.token);
    try {
        console.log('⏳ جاري تحديث الـ Slash Commands الشاملة...');
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('🎉 تم تسجيل كافة الأكواد والأنظمة المتكاملة بنجاح!');
    } catch (error) {
        console.error('❌ خطأ في تسجيل الأوامر الشاملة:', error);
    }
});

// =============================================================
// ⚡ معالجة وإدارة كافة الأوامر (Interaction Handlers)
// =============================================================
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options } = interaction;

    // 🟢 [أوامر الأوتو لاين]
    if (commandName === 'auto-line') {
        const subcommand = options.getSubcommand();
        const channel = options.getChannel('channel');

        if (subcommand === 'set') {
            autoLineChannels.add(channel.id);
            await interaction.reply({ content: `✅ تم تفعيل **الخط التلقائي** بنجاح في روم: ${channel}`, ephemeral: true });
        } else if (subcommand === 'remove') {
            autoLineChannels.delete(channel.id);
            await interaction.reply({ content: `❌ تم إلغاء تفعيل **الخط التلقائي** من روم: ${channel}`, ephemeral: true });
        }
    }

    // 🟢 [أوامر الرد التلقائي]
    if (commandName === 'auto-respond') {
        const subcommand = options.getSubcommand();
        
        if (subcommand === 'set') {
            const word = options.getString('word').toLowerCase().trim();
            const reply = options.getString('reply');
            autoResponses.set(word, reply);
            await interaction.reply({ content: `✅ تم إضافة الرد بنجاح!\n**الكلمة المفتاحية:** \`${word}\`\n**الرد المخصص:** ${reply}`, ephemeral: true });
        } else if (subcommand === 'remove') {
            const word = options.getString('word').toLowerCase().trim();
            if (autoResponses.has(word)) {
                autoResponses.delete(word);
                await interaction.reply({ content: `❌ تم حذف الرد التلقائي المخصص للكلمة: \`${word}\` بنجاح.`, ephemeral: true });
            } else {
                await interaction.reply({ content: `⚠️ الكلمة \`${word}\` غير مسجلة في قائمة الردود التلقائية أصلاً!`, ephemeral: true });
            }
        }
    }

    // 🟢 [أمر ماين كرافت]
    if (commandName === 'mc') {
        const mcCommand = options.getString('command');
        await interaction.deferReply(); // نمنح البوت وقتاً للاتصال بالسيرفر الخارجي

        try {
            const rcon = await Rcon.connect({
                host: 'ضع_هنا_IP_سيرفر_ماين_كرافت',
                port: 25575,
                password: 'ضع_هنا_باسورد_الـRCON'
            });
            const response = await rcon.send(mcCommand);
            await rcon.end();
            await interaction.editReply(`🎮 **استجابة كنسول السيرفر:**\n\`\`\`text\n${response || 'تم تنفيذ الأمر البرمجي بنجاح وبدون مخرجات نصية.'}\n\`\`\``);
        } catch (err) {
            await interaction.editReply('❌ فشل الاتصال بالسيرفر. تأكد من تفعيل خيار الـ RCON في ملف السيرفر وبيانات الاتصال.');
        }
    }

    // 🟢 [أمر إنشاء منشور التيكت]
    if (commandName === 'setup-ticket') {
        const row = new ActionRowBuilder().addComponents(


client.login(process.env.DISCORD_TOKEN);


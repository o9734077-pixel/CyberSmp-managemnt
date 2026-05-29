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

    // 2. معالجة أمر /auto-respond set
    if (commandName === 'auto-respond') {
        const subcommand = options.getSubcommand();
        if (subcommand === 'set') {
            const word = options.getString('word').toLowerCase().trim();
            const reply = options.getString('reply');
            
            autoResponses.set(word, reply);
            await interaction.reply({ content: `✅ تم إضافة الرد التلقائي بنجاح!\n**الكلمة:** ${word}\n**الرد:** ${reply}`, ephemeral: true });
        }
    }

    // 3. معالجة أمر /help
    if (commandName === 'help') {
        const helpEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('📜 قائمة أوامر البوت المطور')
            .setDescription('استخدم الأوامر التالية كـ **Slash Commands** مباشرة:')
            .addFields(
                { name: '📝 الخط التلقائي', value: '`/auto-line set channel: #الروم` - لتحديد روم يرسل فيها البوت الخط تلقائياً بعد كل رسالة.' },
                { name: '💬 الرد التلقائي', value: '`/auto-respond set word: الكلمة reply: الرد` - لضبط رد ذكي وخاص بالبوت.' }
            )
            .setTimestamp();
        await interaction.reply({ embeds: [helpEmbed] });
    }
});

// =============================================================
// 🧠 نظام الاستماع للرسائل (الخط التلقائي + الرد التلقائي)
// =============================================================
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const messageContent = message.content.toLowerCase().trim();

    // أولاً: التحقق من نظام الرد التلقائي الذكي
    if (autoResponses.has(messageContent)) {
        const responseText = autoResponses.get(messageContent);
        return message.reply({ content: responseText });
    }

    // ثانياً: التحقق من نظام الأوتو لاين (الخط التلقائي)
    if (autoLineChannels.has(message.channel.id)) {
        // ننتظر ثانية واحدة للتأكد من إرسال رسالة العضو أولاً، ثم نرسل الخط
        setTimeout(() => {
            message.channel.send({ content: LINE_URL }).catch(err => console.log("خطأ في إرسال الخط:", err.message));
        }, 1000);
    }
});

client.login('ضع_توكن_البوت_هنا');

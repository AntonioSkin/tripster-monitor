const puppeteer = require('puppeteer');
const fetch = require('node-fetch');

const urls = [
    "https://experience.tripster.ru/experience/51192/",
    "https://experience.tripster.ru/experience/57434/"
];

const selector = ".pricing-discount__price";
const token = "7650106942:AAEn9GnG5D_3x0c7EUDcjKios6jaYVSoAno";
const chatId = "371990536";

let lastPrices = {};

async function fetchPrice(url) {
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "domcontentloaded" });

        const price = await page.$eval(selector, el => el.innerText.trim());
        await browser.close();
        return price;
    } catch (error) {
        console.error("Ошибка получения цены:", error);
        return null;
    }
}

async function sendTelegramMessage(message) {
    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message }),
    });
}

async function checkAll() {
    for (const url of urls) {
        const price = await fetchPrice(url);
        if (price && lastPrices[url] && lastPrices[url] !== price) {
            const message = `🔔 Цена изменилась!\n${url}\nСтарая: ${lastPrices[url]}\nНовая: ${price}`;
            await sendTelegramMessage(message);
        }
        lastPrices[url] = price;
    }
}

setInterval(checkAll, 60 * 1000); // Проверять каждую минуту
console.log("✅ Мониторинг запущен!");


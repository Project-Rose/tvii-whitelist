import express from "express";
import chalk from "chalk";
import dayjs from "dayjs";
import config from "../config/config.json" with { type: "json" };
const app = express();
const port = config.http.port;
const endsWithSlash = (url) => {
    return url.endsWith("/") ? url : `${url}/`;
};
app.get("/whitelist?(.txt)?", (req, res) => {
    const country = req.query.country;
    const pidHeader = req.header("X-Nintendo-Current-Principal-ID");
    const pid = pidHeader ? parseInt(pidHeader, 16) : null;
    let region;
    let whitelist = "Invalid Request!";
    switch (country) {
        case "jp":
            region = 0;
            break;
        case "us":
            region = 1;
            break;
        case "eu":
            region = 2;
            break;
        default:
            region = 3;
            break;
    }
    ;
    const titleId = `0005003010013${region}0A`;
    if (region !== 3) {
        if (region === 0) {
            if (pid && config.whitelist.developerWhitelist.pids.includes(pid)) {
                whitelist = `<white-domain>${endsWithSlash(config.whitelist.developerWhitelist.urls.jp["white-domain"])}\n` +
                    `<gold-domain>${endsWithSlash(config.whitelist.developerWhitelist.urls.jp["gold-domain"])}\n` +
                    `<white-title-ID>${titleId}\n` +
                    `<top-page>${endsWithSlash(config.whitelist.developerWhitelist.urls.jp["top-page"])}\n` +
                    `<white-acr>${endsWithSlash(config.whitelist.developerWhitelist.urls.jp["white-acr"])}`;
                console.log(chalk.bold.cyanBright(`[INFO ${dayjs().format("HH:mm:ss")}] A developer has made a request to the whitelist server!`));
            }
            else if (pid && config.whitelist.stagingWhitelist.pids.includes(pid)) {
                whitelist = `<white-domain>${endsWithSlash(config.whitelist.stagingWhitelist.urls.jp["white-domain"])}\n` +
                    `<gold-domain>${endsWithSlash(config.whitelist.stagingWhitelist.urls.jp["gold-domain"])}\n` +
                    `<white-title-ID>${titleId}\n` +
                    `<top-page>${endsWithSlash(config.whitelist.stagingWhitelist.urls.jp["top-page"])}\n` +
                    `<white-acr>${endsWithSlash(config.whitelist.stagingWhitelist.urls.jp["white-acr"])}`;
                console.log(chalk.bold.cyanBright(`[INFO ${dayjs().format("HH:mm:ss")}] A tester has made a request to the whitelist server!`));
            }
            else if (pidHeader) {
                whitelist = `<white-domain>${endsWithSlash(config.whitelist.liveWhitelist.urls.jp["white-domain"])}\n` +
                    `<gold-domain>${endsWithSlash(config.whitelist.liveWhitelist.urls.jp["gold-domain"])}\n` +
                    `<white-title-ID>${titleId}\n` +
                    `<top-page>${endsWithSlash(config.whitelist.liveWhitelist.urls.jp["top-page"])}\n` +
                    `<white-acr>${endsWithSlash(config.whitelist.liveWhitelist.urls.jp["white-acr"])}`;
                console.log(chalk.bold.cyanBright(`[INFO ${dayjs().format("HH:mm:ss")}] A user has made a request to the whitelist server!`));
            }
            else {
                whitelist = "Please use Project Rosé on a Nintendo Wii U system!\n\nFor support, join our Discord!\nhttps://discord.gg/AaTsXndGun";
                console.warn(chalk.bold.yellowBright(`[INFO ${dayjs().format("HH:mm:ss")}] A user not on a Wii U has made a request to the whitelist server!`));
            }
        }
        else if (region === 1) {
            if (pid && config.whitelist.developerWhitelist.pids.includes(pid)) {
                whitelist = `<white-domain>${endsWithSlash(config.whitelist.developerWhitelist.urls.us["white-domain"])}\n` +
                    `<gold-domain>${endsWithSlash(config.whitelist.developerWhitelist.urls.us["gold-domain"])}\n` +
                    `<white-title-ID>${titleId}\n` +
                    `<top-page>${endsWithSlash(config.whitelist.developerWhitelist.urls.us["top-page"])}\n` +
                    `<white-acr>${endsWithSlash(config.whitelist.developerWhitelist.urls.us["white-acr"])}`;
                console.log(chalk.bold.cyanBright(`[INFO ${dayjs().format("HH:mm:ss")}] A developer has made a request to the whitelist server!`));
            }
            else if (pid && config.whitelist.stagingWhitelist.pids.includes(pid)) {
                whitelist = `<white-domain>${endsWithSlash(config.whitelist.stagingWhitelist.urls.us["white-domain"])}\n` +
                    `<gold-domain>${endsWithSlash(config.whitelist.stagingWhitelist.urls.us["gold-domain"])}\n` +
                    `<white-title-ID>${titleId}\n` +
                    `<top-page>${endsWithSlash(config.whitelist.stagingWhitelist.urls.us["top-page"])}\n` +
                    `<white-acr>${endsWithSlash(config.whitelist.stagingWhitelist.urls.us["white-acr"])}`;
                console.log(chalk.bold.cyanBright(`[INFO ${dayjs().format("HH:mm:ss")}] A tester has made a request to the whitelist server!`));
            }
            else if (pidHeader) {
                whitelist = `<white-domain>${endsWithSlash(config.whitelist.liveWhitelist.urls.us["white-domain"])}\n` +
                    `<gold-domain>${endsWithSlash(config.whitelist.liveWhitelist.urls.us["gold-domain"])}\n` +
                    `<white-title-ID>${titleId}\n` +
                    `<top-page>${endsWithSlash(config.whitelist.liveWhitelist.urls.us["top-page"])}\n` +
                    `<white-acr>${endsWithSlash(config.whitelist.liveWhitelist.urls.us["white-acr"])}`;
                console.log(chalk.bold.cyanBright(`[INFO ${dayjs().format("HH:mm:ss")}] A user has made a request to the whitelist server!`));
            }
            else {
                whitelist = "Please use Project Rosé on a Nintendo Wii U system!\n\nFor support, join our Discord!\nhttps://discord.gg/AaTsXndGun";
                console.warn(chalk.bold.yellowBright(`[INFO ${dayjs().format("HH:mm:ss")}] A user not on a Wii U has made a request to the whitelist server!`));
            }
        }
        else if (region === 2) {
            if (pid && config.whitelist.developerWhitelist.pids.includes(pid)) {
                whitelist = `<white-domain>${endsWithSlash(config.whitelist.developerWhitelist.urls.eu["white-domain"])}\n` +
                    `<gold-domain>${endsWithSlash(config.whitelist.developerWhitelist.urls.eu["gold-domain"])}\n` +
                    `<white-title-ID>${titleId}\n` +
                    `<top-page>${endsWithSlash(config.whitelist.developerWhitelist.urls.eu["top-page"])}\n` +
                    `<white-acr>${endsWithSlash(config.whitelist.developerWhitelist.urls.eu["white-acr"])}`;
                console.log(chalk.bold.cyanBright(`[INFO ${dayjs().format("HH:mm:ss")}] A developer has made a request to the whitelist server!`));
            }
            else if (pid && config.whitelist.stagingWhitelist.pids.includes(pid)) {
                whitelist = `<white-domain>${endsWithSlash(config.whitelist.stagingWhitelist.urls.eu["white-domain"])}\n` +
                    `<gold-domain>${endsWithSlash(config.whitelist.stagingWhitelist.urls.eu["gold-domain"])}\n` +
                    `<white-title-ID>${titleId}\n` +
                    `<top-page>${endsWithSlash(config.whitelist.stagingWhitelist.urls.eu["top-page"])}\n` +
                    `<white-acr>${endsWithSlash(config.whitelist.stagingWhitelist.urls.eu["white-acr"])}`;
                console.log(chalk.bold.cyanBright(`[INFO ${dayjs().format("HH:mm:ss")}] A tester has made a request to the whitelist server!`));
            }
            else if (pidHeader) {
                whitelist = `<white-domain>${endsWithSlash(config.whitelist.liveWhitelist.urls.eu["white-domain"])}\n` +
                    `<gold-domain>${endsWithSlash(config.whitelist.liveWhitelist.urls.eu["gold-domain"])}\n` +
                    `<white-title-ID>${titleId}\n` +
                    `<top-page>${endsWithSlash(config.whitelist.liveWhitelist.urls.eu["top-page"])}\n` +
                    `<white-acr>${endsWithSlash(config.whitelist.liveWhitelist.urls.eu["white-acr"])}`;
                console.log(chalk.bold.cyanBright(`[INFO ${dayjs().format("HH:mm:ss")}] A user has made a request to the whitelist server!`));
            }
            else {
                whitelist = "Please use Project Rosé on a Nintendo Wii U system!\n\nFor support, join our Discord!\nhttps://discord.gg/AaTsXndGun";
                console.warn(chalk.bold.yellowBright(`[INFO ${dayjs().format("HH:mm:ss")}] A user not on a Wii U has made a request to the whitelist server!`));
            }
        }
    }
    else {
        whitelist = "Invalid country query!";
        console.warn(chalk.bold.yellowBright(`[INFO ${dayjs().format("HH:mm:ss")}] A user has made a request to the whitelist server without a valid country query!`));
    }
    ;
    res.contentType("text/plain").send(whitelist);
});
app.listen(port, () => {
    console.log(chalk.bold.cyanBright(`[INFO ${dayjs().format("HH:mm:ss")}] Vino whitelist server running on: ${port}`));
});

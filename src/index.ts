import express, { type Request, type Response } from "express";
import chalk from "chalk";
import dayjs from "dayjs";

const app = express();
const port = process.env.HTTP_PORT;

app.get("/whitelist?(.txt)?", (req: Request, res: Response) => {
    const country = req.query.country;
    const pidHeader = req.header("X-Nintendo-Current-Principal-ID");
    const pid = String(pidHeader ? parseInt(pidHeader, 16) : null);
    
    let region: number;
    let whitelist: string = "Invalid Request!";
    
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
    };
    
    const titleId = `0005003010013${region}0A`;
    
    if (region !== 3) {
        if (region === 0) {
            if (pid && process.env.DEVELOPER_WHITELIST_PIDS?.includes(pid)) {
                whitelist = `<white-domain>https://tvii-dev.d1.jp.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<gold-domain>https://tvii-dev.d1.jp.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<white-title-ID>${titleId}\n` +
                `<top-page>https://tvii-dev.d1.jp.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<white-acr>acr-dev.d1.vino.wup.app.${process.env.DOMAIN}`;
                
                console.log(chalk.bold.cyanBright(`[INFO ${dayjs().format("HH:mm:ss")}] A developer has made a request to the whitelist server!`));
            } else if (pid && process.env.STAGING_WHITELIST_PIDS?.includes(pid)) {
                whitelist = `<white-domain>https://tvii-stg.s1.jp.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<gold-domain>https://tvii-stg.s1.jp.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<white-title-ID>${titleId}\n` +
                `<top-page>https://tvii-stg.s1.jp.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<white-acr>acr-stg.s1.vino.wup.app.${process.env.DOMAIN}`;
                
                console.log(chalk.bold.cyanBright(`[INFO ${dayjs().format("HH:mm:ss")}] A tester has made a request to the whitelist server!`));
            } else if (pidHeader) {
                whitelist = `<white-domain>https://tvii-prod.l1.jp.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<gold-domain>https://tvii-prod.l1.jp.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<white-title-ID>${titleId}\n` +
                `<top-page>https://tvii-prod.l1.jp.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<white-acr>acr-prod.l1.vino.wup.app.${process.env.DOMAIN}`;
                
                console.log(chalk.bold.cyanBright(`[INFO ${dayjs().format("HH:mm:ss")}] A user has made a request to the whitelist server!`));
            } else {
                whitelist = "Please use Project Rosé on a Nintendo Wii U system!\n\nFor support, join our Discord!\nhttps://discord.gg/AaTsXndGun";
                console.warn(chalk.bold.yellowBright(`[INFO ${dayjs().format("HH:mm:ss")}] A user not on a Wii U has made a request to the whitelist server!`));
            }
        } else if (region === 1) {
            if (pid && process.env.DEVELOPER_WHITELIST_PIDS?.includes(pid)) {
                whitelist = `<white-domain>https://tvii-dev.d1.us.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<gold-domain>https://tvii-dev.d1.us.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<white-title-ID>${titleId}\n` +
                `<top-page>https://tvii-dev.d1.us.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<white-acr>acr-dev.d1.vino.wup.app.${process.env.DOMAIN}`;
                
                console.log(chalk.bold.cyanBright(`[INFO ${dayjs().format("HH:mm:ss")}] A developer has made a request to the whitelist server!`));
            } else if (pid && process.env.STAGING_WHITELIST_PIDS?.includes(pid)) {
                whitelist = `<white-domain>https://tvii-stg.s1.us.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<gold-domain>https://tvii-stg.s1.us.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<white-title-ID>${titleId}\n` +
                `<top-page>https://tvii-stg.s1.us.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<white-acr>acr-stg.s1.vino.wup.app.${process.env.DOMAIN}`;
                
                console.log(chalk.bold.cyanBright(`[INFO ${dayjs().format("HH:mm:ss")}] A tester has made a request to the whitelist server!`));
            } else if (pidHeader) {
                whitelist = `<white-domain>https://tvii-prod.l1.us.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<gold-domain>https://tvii-prod.l1.us.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<white-title-ID>${titleId}\n` +
                `<top-page>https://tvii-prod.l1.us.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<white-acr>acr-prod.l1.vino.wup.app.${process.env.DOMAIN}`;
                
                console.log(chalk.bold.cyanBright(`[INFO ${dayjs().format("HH:mm:ss")}] A user has made a request to the whitelist server!`));
            } else {
                whitelist = "Please use Project Rosé on a Nintendo Wii U system!\n\nFor support, join our Discord!\nhttps://discord.gg/AaTsXndGun";
                console.warn(chalk.bold.yellowBright(`[INFO ${dayjs().format("HH:mm:ss")}] A user not on a Wii U has made a request to the whitelist server!`));
            }
        } else if (region === 2) {
            if (pid && process.env.DEVELOPER_WHITELIST_PIDS?.includes(pid)) {
                whitelist = `<white-domain>https://tvii-dev.d1.eu.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<gold-domain>https://tvii-dev.d1.eu.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<white-title-ID>${titleId}\n` +
                `<top-page>https://tvii-dev.d1.eu.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<white-acr>acr-dev.d1.vino.wup.app.${process.env.DOMAIN}`;
                
                console.log(chalk.bold.cyanBright(`[INFO ${dayjs().format("HH:mm:ss")}] A developer has made a request to the whitelist server!`));
            } else if (pid && process.env.STAGING_WHITELIST_PIDS?.includes(pid)) {
                whitelist = `<white-domain>https://tvii-stg.s1.eu.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<gold-domain>https://tvii-stg.s1.eu.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<white-title-ID>${titleId}\n` +
                `<top-page>https://tvii-stg.s1.eu.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<white-acr>acr-stg.s1.vino.wup.app.${process.env.DOMAIN}`;
                
                console.log(chalk.bold.cyanBright(`[INFO ${dayjs().format("HH:mm:ss")}] A tester has made a request to the whitelist server!`));
            } else if (pidHeader) {
                whitelist = `<white-domain>https://tvii-prod.l1.eu.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<gold-domain>https://tvii-prod.l1.eu.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<white-title-ID>${titleId}\n` +
                `<top-page>https://tvii-prod.l1.eu.vino.wup.app.${process.env.DOMAIN}/\n` +
                `<white-acr>acr-prod.l1.vino.wup.app.${process.env.DOMAIN}`;
                
                console.log(chalk.bold.cyanBright(`[INFO ${dayjs().format("HH:mm:ss")}] A user has made a request to the whitelist server!`));
            } else {
                whitelist = "Please use Project Rosé on a Nintendo Wii U system!\n\nFor support, join our Discord!\nhttps://discord.gg/AaTsXndGun";
                console.warn(chalk.bold.yellowBright(`[INFO ${dayjs().format("HH:mm:ss")}] A user not on a Wii U has made a request to the whitelist server!`));
            }
        }
    } else {
        whitelist = "Invalid country query!";
        console.warn(chalk.bold.yellowBright(`[INFO ${dayjs().format("HH:mm:ss")}] A user has made a request to the whitelist server without a valid country query!`));
    };
    
    res.contentType("text/plain").send(whitelist);
});

app.listen(port, () => {
    console.log(chalk.bold.cyanBright(`[INFO ${dayjs().format("HH:mm:ss")}] Vino whitelist server running on: ${port}`));
});

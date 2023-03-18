import express from "express";
import puppeteer from "puppeteer";

import * as dotenv from 'dotenv';
import spreadsheets from "./spreadsheets.js";
import Clusters from "./cluster.js";


const router = express.Router();
dotenv.config();

const built = async () => {
    const browser = await puppeteer.launch(
        {
            headless: true,
            slowMo: 20,
            devtools: false,
            defaultViewport: false
        }
    );
    const page = await browser.newPage();

    await page.goto('https://app.builtforteams.com/reports/timesheet_details');

    //log in
    await page.type('#user_email', process.env.USER_EMAIL);
    await page.type('#user_password', process.env.USER_PASSWORD);

    const submitLoginFormSelector = '.session-form-action > input[type="submit"]';
    await page.waitForSelector(submitLoginFormSelector);
    await page.click(submitLoginFormSelector);

    const reportTableSelector = "#report-table";
    await page.waitForSelector(reportTableSelector);


    const tableResults = await page.evaluate((reportTableSelector) => {

        const reporTable = document.querySelectorAll(reportTableSelector)[0];
        const rows = reporTable.querySelectorAll("tbody > tr");

        return [...rows].map((tr) => {
            const resultArray = [];

            tr.querySelectorAll("td").forEach(td => {
                if (td.innerText === '') {
                    return
                }
                const title = td.textContent.trim();
                if(title.includes('+')){
                    resultArray.push(`'${title}`);
                }else{
                    resultArray.push(title);
                };
                
            });

            if (resultArray.length < 12) {
                return
            }

            return resultArray;
        });

    }, reportTableSelector);


    const urls = await page.evaluate((reportTableSelector) => {

        const reporTable = document.querySelectorAll(reportTableSelector)[0];
        const rows = reporTable.querySelectorAll("tbody > tr");

        return [...rows].map((tr) => {
            const urls = [];

            tr.querySelectorAll("a").forEach((a) => {
                const url = a.toString();
                urls.push(url);
            });

            return urls;
        });

    }, reportTableSelector);

    Clusters(urls);

    let empty;
    
    spreadsheets(empty, tableResults);

    router.get('/', async (req, res) => {
        res.send('Alive!')
    })
};
built();

export default router
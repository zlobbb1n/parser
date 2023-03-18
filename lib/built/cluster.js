import { Cluster } from "puppeteer-cluster";
import spreadsheets from "./spreadsheets.js";

export default function Clusters(urls) {

    let statusTab = [];

    (async () => {
        console.log('Cluster is running...');

        const cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: 1,
            puppeteerOptions:
            {
                headless: true,
                slowMo: 20,
                devtools: false,
                defaultViewport: false
            },
            timeout: 60000
        });

        cluster.on('taskerror', (err, data) => {
            console.log(`Error crawling ${data}: ${err.message}`);
        });

        await cluster.task(async ({ page, data: url }) => {

            const startDate = '2023-02-01';
            const endDate = '2023-02-28';

            const stopDate = new Date(endDate);

            const startUrl = `${url}?start=${startDate}`;

            await page.goto(startUrl);
            await page.waitForSelector('#user_email');
            await page.type('#user_email', process.env.USER_EMAIL);
            await page.type('#user_password', process.env.USER_PASSWORD);

            const submitLoginFormSelector = '.session-form-action > input[type="submit"]';
            await page.waitForSelector(submitLoginFormSelector);
            await page.click(submitLoginFormSelector);


            while (true) {
                console.log('Parsing...');

                // temporary data store
                let data = [];

                //get profil name
                const profileNameSelector = 'body > div.main-content > div.content > div > div:nth-child(1) > div.profile-header > div.profile-header-info > div.profile-header-title-wrapper > div';
                await page.waitForSelector(profileNameSelector);

                const profileName = await page.$eval(profileNameSelector, (el) => el.textContent.trim());
                data.push(profileName);


                //get date
                const dateSelector = '#time-entries > div.secondary-actions > div:nth-child(1) > div > button';
                await page.waitForSelector(dateSelector);

                const date = await page.$eval(dateSelector, (el) => el.textContent.trim());
                data.push(date);

                const textFromDate = date.split(' ');
                const getMonthWithDay = textFromDate[3] + ' ' + textFromDate[4];
                const newDate = getMonthWithDay.split(',')
                newDate.pop();
                const newDateToString = newDate.toString() + ' 2023';
                const currDate = new Date(newDateToString);

                //checkpoint
                if (currDate > stopDate) {
                    break;
                }


                //get timesheet status
                const statusSelector = '#time-entries > div.secondary-actions > div:nth-child(2)';
                await page.waitForSelector(statusSelector);

                const statusText = await page.$eval(statusSelector, (el) => el.innerText);
                const SubmittedApprovedApprover = statusText.replace('Submitted:', '').replace('Approved:', '').replace('Approver:', '').split('\n');

                for (let date of SubmittedApprovedApprover) {

                    if (SubmittedApprovedApprover.length <= 2) {

                        data.push(date);
                        data.push('');
                        data.push('');
                        data.push(page.url());
                    } else {
                        data.push(date);
                    };
                };

                //get work time
                const ScheduledSelector = 'table:nth-child(1) > tfoot:nth-child(3) > tr:nth-child(1) > td:nth-child(9) > div:nth-child(1) > div:nth-child(2)';
                const OverUnderSelector = 'table:nth-child(1) > tfoot:nth-child(3) > tr:nth-child(1) > td:nth-child(9) > div:nth-child(1) > div:nth-child(3)';
                await page.waitForSelector(ScheduledSelector);

                const ScheduledText = await page.$eval(ScheduledSelector, (el) => el.innerText);
                const OverUnderText = await page.$eval(OverUnderSelector, (el) => el.innerText);

                if(data.length < 6){
                    data.push('');
                }
                data.push(ScheduledText);
                data.push(`'${OverUnderText}`);


                statusTab.push(data);

                //change timesheet range
                await page.click('#time-entries > div.secondary-actions > div:nth-child(1) > span > a:nth-child(2)');
                await page.waitForSelector(statusSelector);
                await page.waitForSelector(dateSelector);

                //clean data
                data = [];
                
            };

            spreadsheets(statusTab);
            statusTab = [];
            console.log('--------');
        });


        for (const url of urls) {
            for (const link of url) {
                cluster.queue(link);
            };
        };
        // await cluster.queue('https://app.builtforteams.com/people/558575/timesheets');
        // await cluster.queue('https://app.builtforteams.com/people/558550/timesheets');

    })();
};

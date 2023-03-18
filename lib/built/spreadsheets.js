import { google } from "googleapis";

export default function(statusTab, tableResults){
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    });
    

    // Create client instance for auth
    const client = auth.getClient();

    // Instance of GS API
    const googleSheets = google.sheets({
        version: 'v4',
        auth: client
    });

    const spreadsheetId = '1M6Gv6hVuFJ88A1JiR07b4yYJVQTioVq-HgPYiSpOJMI';

    // Write rows
    googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: 'Arkusz4!A:B',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: statusTab
        }
    });
    googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: 'Sheet2!A:B',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: tableResults
        }
    });
}
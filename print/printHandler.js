import dotenv from 'dotenv';
import ejs from 'ejs';
import fs from 'fs';
import puppeteer from 'puppeteer-core';

import { queryMetaObject } from '../shopify/query.js';
import { getGlobalID } from '../util/util.js';


var recipeCss = {
    style : fs.readFileSync('./public/styles.css','utf8')
};

var recipeJs = {
    script : fs.readFileSync('./public/script.js','utf8')
};


// Load environment variables
dotenv.config();

export async function printCustomerRecipe(req, res) {

    const recipeID = req.body.recipe_id; 
    const customerID = req.body.customer_id;
    const recipeUrl = req.body.recipe_url;
    const recipeGID = getGlobalID('metaobject', recipeID);

    const [outputFile, pdfBuffer] = await printRecipe(customerID, recipeGID, recipeUrl);

    // Set the response headers
    res.setHeader(
        'Content-Type', 'application/pdf',
        'Content-Disposition',
        `attachment; filename="${outputFile}"`
    );
    res.send(pdfBuffer);
}

export async function printRecipe(customerID, recipeGID, recipeUrl) {

    ejs.clearCache();

    const MetaObject = await queryMetaObject(recipeGID);
    console.log(MetaObject);

    console.log(`Printing recipe ID '${recipeGID} for customer ID '${customerID}`);

    const outputName = `${MetaObject.title}`.replaceAll(' ', '_');
    const outputFile = `${outputName}.pdf`;
    const outputDir = `./print/output`;

    MetaObject.url = recipeUrl;

    const pdfBuffer = await generatePdf(MetaObject, outputDir, outputName);

    return [outputFile, pdfBuffer];

};

async function generatePdf(recipeData, outputDir, fileName) {

    try {
        const html = await ejs.renderFile('./print/templateRecipe.ejs', 
            { 
                recipeData: recipeData, 
                recipeCss: recipeCss,
                recipeJs: recipeJs 
            }
        );

        if (process.env.ENV == "DEV" ) {
            console.debug('[DEBUG] Using local browser')
            var browser = await puppeteer.launch({
                // executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
                executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        });
        } else {
            var browser = await puppeteer.connect({ browserWSEndpoint: process.env.BROWSER_WS_ENDPOINT });
        }

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'load' });
        const pdfBuffer = await page.pdf({ format: 'A5' });

        if (process.env.ENV == "DEV" ) {
            console.debug(`[DEBUG] Generating debug files: ${outputDir}`);
            fs.writeFileSync(`${outputDir}/debug_${fileName}.html`, html);
            fs.writeFileSync(`${outputDir}/debug_${fileName}.pdf`, pdfBuffer);
        } 

        console.log(`PDF for ${recipeData.title} generated successfully!`);

        return Buffer.from(pdfBuffer);
        
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
};
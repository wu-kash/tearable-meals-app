import ejs from 'ejs';
import dotenv from 'dotenv';
import puppeteer from "puppeteer-core";
import fs from 'fs';

import { getGlobalID } from '../util/util.js'
import { queryMetaObject } from '../shopify/query.js'

// Load environment variables
dotenv.config();

export async function printCustomerRecipe(req, res) {

    const recipeID = req.body.recipe_id; 
    const customerID = req.body.customer_id;
    const recipeGID = getGlobalID('metaobject', recipeID);

    const MetaObject = await queryMetaObject(recipeGID);
    console.log(MetaObject);

    console.log(`Printing recipe ID '${recipeID} for customer ID '${customerID}`);

    const outputName = `${MetaObject.title}`.replaceAll(' ', '_');
    const outputFile = `${outputName}.pdf`;
    const outputDir = `./print/output`;
    const outputPdfPath = `./print/output/${outputFile}`;

    const pdfBuffer = await generatePdf(MetaObject, outputDir, outputName);

    // Set the response headers
    res.setHeader(
        'Content-Type', 'application/pdf',
        'Content-Disposition',
        `attachment; filename="${outputFile}"`
    );
    res.send(pdfBuffer);
}

async function generatePdf(recipeData, outputDir, fileName) {

    try {
        const html = await ejs.renderFile('./print/templateRecipe.ejs', { recipeData });

        if (process.env.ENV == "DEV" ) {
            console.debug('[DEBUG] Using local browser')
            var browser = await puppeteer.launch({
                executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
        });
        } else {
            var browser = await puppeteer.connect({ browserWSEndpoint: process.env.BROWSER_WS_ENDPOINT });
        }

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'load' });
        const pdfBuffer = await page.pdf({ format: 'A4' });

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
}
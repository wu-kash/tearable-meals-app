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
        // Render the template with dynamic data
        const html = await ejs.renderFile('./print/templateRecipe.ejs', { recipeData });
        const browser = await puppeteer.connect({ browserWSEndpoint: process.env.BROWSER_WS_ENDPOINT });
        const page = await browser.newPage();

        // Set the HTML content
        await page.setContent(html, { waitUntil: 'load' });
        fs.writeFileSync(`${outputDir}/debug_${fileName}.html`, html);
        // const pdfBuffer = await page.pdf({  path: `${outputDir}/${fileName}.pdf`, format: 'A4' });
        const pdfBuffer = await page.pdf({ format: 'A4' });
        fs.writeFileSync(`${outputDir}/debug_${fileName}.pdf`, pdfBuffer);

        console.log(`PDF for ${recipeData.title} generated successfully!`);

        return Buffer.from(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
}
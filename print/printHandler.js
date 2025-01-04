import puppeteer from "puppeteer";
import ejs from 'ejs';

import { getGlobalID } from '../util/util.js'
import { queryMetaObject } from '../shopify/query.js'

export async function printCustomerRecipe(req, res) {

    const recipeID = req.body.recipe_id; 
    const customerID = req.body.customer_id;
    const recipeGID = getGlobalID('metaobject', recipeID);

    const MetaObject = await queryMetaObject(recipeGID);
    console.log(MetaObject);

    console.log(`Printing recipe ID '${recipeID} for customer ID '${customerID}`);

    const outputName = `${MetaObject.title}`.replaceAll(' ', '_');
    const outputFile = `${outputName}.pdf`;
    const outputPdfPath = `./print/output/${outputFile}`;

    await generatePdf(MetaObject, outputPdfPath);

    res.download(outputPdfPath, outputFile, (err) => {
        if (err) {
            console.error('Error: Unable to download the PDF file')
            console.log(err)
        }
    });
    
    // fs.unlink(outputPdfPath, (err) => {
    //     if (err) {
    //         console.error(`Error removing file: ${err}`);
    //         return;
    //     }
    //     console.log(`File ${outputPdfPath} has been successfully removed.`);
    // });
}

async function generatePdf(recipeData, outputPath) {
    try {
        // Render the template with dynamic data
        const html = await ejs.renderFile('./print/templateRecipe.ejs', { recipeData });
        // Launch Puppeteer to generate the PDF
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set the HTML content to the rendered template
        await page.setContent(html);

        // Generate and save the PDF
        await page.pdf({ path: outputPath, format: 'A4' });

        await browser.close();

        console.log(`PDF for ${recipeData.title} generated successfully!`);
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
}
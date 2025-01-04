import ejs from 'ejs';
import pdf from 'html-pdf-node';

import { getGlobalID } from '../util/util.js'
import { queryMetaObject } from '../shopify/query.js'

export async function printCustomerRecipe(req, res) {

    const recipeID = req.body.recipe_id; 
    const customerID = req.body.customer_id;
    const recipeGID = getGlobalID('metaobject', recipeID);

    const MetaObject = await queryMetaObject(recipeGID);
    console.log(MetaObject);

    console.log(`Printing recipe ID '${recipeID} for customer ID '${customerID}`);

    const outputName = `${MetaObject.title.replace(/\s+/g, '_')}.pdf`;
    const pdfBuffer = await generatePdf(MetaObject);

    // Set the response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="${outputName}"`
    );
    res.send(pdfBuffer);

}

async function generatePdf(recipeData) {
    try {
        // Render the template with dynamic data
        const html = await ejs.renderFile('./print/templateRecipe.ejs', { recipeData });
        const pdfBuffer = await pdf.generatePdf({ content: html }, { format: 'A4' });
        
        console.log(`PDF for ${recipeData.title} generated successfully!`);

        return pdfBuffer;
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
}
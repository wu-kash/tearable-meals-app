import pdf from "pdf-creator-node";
import { promises as fsP } from 'fs';
import fs from 'fs';

import { getGlobalID } from '../util/util.js'
import { queryMetaObject } from '../shopify/query.js'

var html = fs.readFileSync("./print/template.html", "utf8");


var options = {
    format: "A4",
    orientation: "portrait",
    border: "10mm"
    // header: {
    //     height: "45mm",
    //     contents: '<div style="text-align: center;">Author: Shyam Hajare</div>'
    // },
    // footer: {
    //     height: "28mm",
    //     contents: {
    //         first: 'Cover page',
    //         2: 'Second page', // Any page number is working. 1-based index
    //         default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
    //         last: 'Last Page'
    //     }
    // }
};

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

    var document = {
        html: html,
        data: {
          recipeData: MetaObject,
        },
        path: outputPdfPath,
        type: "",
      };

    // const pdfOutput = await pdf.create(document, options);

    await pdf
        .create(document, options)
        .then((res) => {
            console.log(res);
            
    })
        .catch((error) => {
            console.error(error);
    });

    await waitForFile(outputPdfPath);

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

async function waitForFile(filePath, interval = 1000) {
    while (true) {
      try {
        await fsP.access(filePath);
        console.log(`${filePath} is ready.`);
        break;
      } catch {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
  };
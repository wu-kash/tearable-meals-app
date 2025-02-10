const conversions = {
    imperial: {
        Lb: { metric: 453.592, unit: 'g' },
      Oz: { metric: 28.3495, unit: 'g' },
    },
    metric: {
      gLb: { imperial: 1/453.592, unit: 'Lb' },
      gOz: { imperial: 1/28.3495, unit: 'Oz' },
      kg: { imperial: 1000/453.592, unit: 'Lb' },
    },
    temperature: {
        toCelsius: (f) => ((f - 32) * 5) / 9,
      toFahrenheit: (c) => (c * 9) / 5 + 32,
    }
  };
  
  function convertValues(value, unit, unitPreference) {
  
    console.log(`${value} ${unit}`);
    
    // A smaller weight should convert to Oz
    if (unitPreference == 'Imperial') {
      if (unit == 'g') {
          if (value > 500) {
          unit = 'gLb';
        } else {
          unit = 'gOz';
          }
      }
    }
  
    // Weights
    if (unit in conversions.imperial && unitPreference == 'Metric') {
   
       const newValue = roundOffValue(value * conversions.imperial[unit]?.metric);
          const newUnit = conversions.imperial[unit]?.unit;
       return [newValue, newUnit];
    }
    
    if (unit in conversions.metric && unitPreference == 'Imperial') {
       const newValue = roundOffValue(value * conversions.metric[unit]?.imperial);
          const newUnit = conversions.metric[unit]?.unit;
       return [newValue, newUnit];
    }
    
    // Temperature
    if (unit === "F" && unitPreference == 'Metric') {
        const newValue = roundOffTemperature(conversions.temperature.toCelsius(value));
        const newUnit = 'C';
       return [newValue, newUnit];
    }
    
    if (unit === "C" && unitPreference == 'Imperial') {
        const newValue = roundOffTemperature(conversions.temperature.toFahrenheit(value));
        const newUnit = 'F';
      return [newValue, newUnit];
    }
    
    return [value, unit];
}


///////////////////////////////////////////////////
// FORMATTING
///////////////////////////////////////////////////



function formatSelector(selector, unitPreference) {
    const elements = document.querySelectorAll(selector);

    Array.from(elements).forEach(element => {
        let text = element.innerHTML;
        text = processText(text, unitPreference);
        element.innerHTML = text;
    });
}

function processText(text, unitPreference) {

    const stylingStart = `<span>`;
    const stylingEnd = `</span>`;
  
    // tempFToC{ValueF}
    const regexTempFToC = /tempFToC\{(\d+)\}/g;
    text = text.replace(regexTempFToC, (match, p1) => {
        let fahrenheit = parseFloat(p1);
        let celsius = fahrenheit;
        let units = '';
        [celsius, units] = convertValues(fahrenheit, 'F', unitPreference);
      
        return `${stylingStart}${celsius}°${units}${stylingEnd}`;
    });
  
    // tempC{ValueC}
    const regexTempC = /tempC\{(\d+)\}/g;
    text = text.replace(regexTempC, (match, p1) => {
        let celsius = parseFloat(p1);
        let fahrenheit = celsius;
        let units = '';
        [celsius, units] = convertValues(celsius, 'C', unitPreference);
        return `${stylingStart}${celsius}°${units}${stylingEnd}`;
    });
  
    // FRACTION{Value1}{Value2}
    const fracRegex = /FRACTION\{(\d+)\}\{(\d+)\}/g;
    text = text.replace(fracRegex, (match, numerator, denominator) => {
        // return `<sup>${numerator}</sup>&frasl;<sub>${denominator}</sub>`;
        // return `&frac${numerator}${denominator}`;
  
        return `<sup>${numerator}</sup>&#x2044;<sub>${denominator}</sub>`;  
    });
  
    // INGREDIENT{text}
    const ingredientRegex = /INGREDIENT\{(.*?)\}/g;
    text = text.replace(ingredientRegex, (match, ingredient) => {
        return `<b>${ingredient}</b>`;
    });
  
  
    return text;
  }


function formatIngredient(ingredientName, amount=null, units=null) {

    /* NOTE The margin-right is added to seperate the ingredients from the steps on the right */
    if (amount==null || amount=='') {
        return `${ingredientName}`;
    } else if (units==null || units=='') {
        return `${ingredientName} <span style="font-size: 0.75em; margin-right: 1em;">(${amount})</span>`;
    } else {
        return `${ingredientName} <span style="font-size: 0.75em; margin-right: 1em;">(${amount} ${units})</span>`;
    }
}

function formatHeading(headingName) {
    return `<b>${headingName}</b>`;
}

function addIngredientToList(ingredientName, amount, units, unitPreference) {

    const rawAmount = amount;
    const rawUnits = units;
  
    [amount, units] = convertValues(amount, units, unitPreference);
     
    console.log(`Converted from ${rawAmount} [${rawUnits}] -> ${amount} [${units}] `);
  
    const formattedIngredient = formatIngredient(ingredientName, amount, units);
    const li = document.createElement('li');
    li.className = 'text-ingredient-item';
    li.innerHTML = processText(formattedIngredient);
    document.getElementById('ingredientList').appendChild(li);
}

function addIngredientHeadingToList(headingName) {

    const ingredientHeadingRegex = /HEADING\{(.*?)\}/g;
    var extractedHeadingName = '[ERROR]';
    headingName = headingName.replace(ingredientHeadingRegex, (match, headingName) => {
        extractedHeadingName = `${headingName}`;
    });

    const formattedHeading = formatHeading(extractedHeadingName);
    const li = document.createElement('li');
    li.className = 'text-ingredient-heading';
    li.innerHTML = formattedHeading;
    document.getElementById('ingredientList').appendChild(li);
}

function addPreparationStepToList(step) {
    const li = document.createElement('li');
    li.className = 'preparation-step';
    li.id = 'step-text';
    li.textContent = step;
    document.getElementById('preparationList').appendChild(li);
}

function addCookingStepToList(step) {
    const li = document.createElement('li');
    li.className = 'cooking-step';
    li.id = 'step-text';
    li.textContent = step;
    document.getElementById('cookingList').appendChild(li);
}


function roundOffValue(value) {
    if (value > 500) {
        return Math.round(value / 50) * 50;
    } else if (value > 200) {
        return Math.round(value / 25) * 25;
    } else {
        return Math.round(value / 10) * 10;
    }
}

function roundOffTemperature(value) {
    return Math.round(value / 5) * 5;
}

function calculateDocumentHeight() {
    // Calculate total document height in pixels
    var body = document.body,
    html = document.documentElement;

    var height = Math.max( body.scrollHeight, body.offsetHeight, 
        html.clientHeight, html.scrollHeight, html.offsetHeight );
    
    height = Math.max( body.scrollHeight);

    // Assuming a standard DPI of 96
    const dpi = 96;

    // Convert pixels to inches
    var totalHeightInches = height / dpi;
    totalHeightInches = totalHeightInches.toFixed(2);

    console.log(body.scrollHeight/dpi);
    console.log(body.offsetHeight/dpi);
    console.log(html.clientHeight/dpi);
    console.log(html.scrollHeight/dpi);
    console.log(html.offsetHeight/dpi);

    console.log(`${totalHeightInches} inches`);

    if (totalHeightInches > 8.4) {
        document.body.style.backgroundColor = 'red';
        console.log('Recipe is too long!');
    } else {
        document.body.style.backgroundColor = ''; // Reset to default
    }

    window.printHeight = {
        inches: totalHeightInches
    };

    return totalHeightInches;
}

window.onbeforeprint = function() {
    calculateDocumentHeight(); // Call the function before printing
};

window.onafterprint = function() {
    calculateDocumentHeight(); // Call the function before printing
};

function resizeElement() {

    const currentWidth = document.body.style.width
    document.body.style.width = '359px'; // Do one less pixel than min width

    // Fix positioning for Preparation and Cooking headings by
    // Cooking: Offset Cooking heading by setting left margin to width of ingredients list
    const ingredientsListWidth = document.querySelector('.div-ingredients').offsetWidth;
    const ingredientsTitleWidth = document.getElementById('title-ingredients').offsetWidth;
    const stepTextOffset = document.getElementById('step-text').offsetWidth;
    document.getElementById('title-instructions').style.marginLeft  = ingredientsListWidth + 'px';
    document.getElementById('title-preparation').style.marginLeft  = (ingredientsListWidth-ingredientsTitleWidth) + 'px';
    
    // NOTE Where does this 40 come from???
    document.querySelector('.text-preparation-list').style.marginLeft  = (ingredientsListWidth-40) + 'px';

    // Return to original width
    document.body.style.width = currentWidth;
}

window.onload = function() {

};

function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}

function generateUrlQr(url) {

    if (url) {
        // Add 'https://' if the user doesn't provide it
        if (!url.match(/^https?:\/\//)) {
            url = `https://${url}`;
        }

        // Generate QR code as a data URL
        const qrCode = new QRCode(document.createElement('div'), {
            text: url,
            width: 200,
            height: 200,
        });

        document.getElementById('qr-link').href =  `${url}`;

        setTimeout(() => {
            const canvas = qrCode._el.querySelector('canvas');
            if (canvas) {
            const qrDataUrl = canvas.toDataURL();
            document.getElementById('qr-code').src = qrDataUrl;
            }
        }, 50);
        } else {
        alert('Please enter a valid URL.');
    }
}

function loadRecipe() {

    const unitPreference = 'Metric';

    // Convert  placeholders when the document is ready
    formatSelector('li', unitPreference);
    formatSelector('b', unitPreference);

    resizeElement();
}

document.addEventListener('DOMContentLoaded', function() {

    setTimeout(function() {
        loadRecipe();
        resizeElement();

    }, 50);
    loadRecipe();
});
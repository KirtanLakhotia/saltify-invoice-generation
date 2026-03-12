// =============================
// PDF EXTRACTION
// =============================

// const { Console } = require("console");

document.addEventListener("DOMContentLoaded", function () {

    const upload = document.getElementById("pdfUpload");

    // If we are on upload page
    if (upload) {
        upload.addEventListener("change", function (event) {
            const file = event.target.files[0];
            if (file) extractText(file);
        });
    }

    // If we are on invoice page
    if (document.getElementById("i_orderId")) {
        loadInvoiceData();
         
    }
    if (document.getElementById("p_date")) {
        loadPackingData();
    }
        
});

async function extractText(file) {

    const reader = new FileReader();

    reader.onload = async function () {

        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;

        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            textContent.items.forEach(item => {
                fullText += item.str + "\n";
            });
        }

        parseData(fullText);
    };

    reader.readAsArrayBuffer(file);
}


// =============================
// PARSE AMAZON DATA
// =============================



/**
 * Maps a country name or address string to its 3-letter currency code.
 * Generalized to handle lowercase conversions and edge cases.
 */
function getCurrencyByCountry(addressString) {
    if (!addressString) return "USD"; // Safe default

    // Lowercase the input to handle "CANADA", "Canada", or "canada" seamlessly
    const normalizedText = addressString.toLowerCase().trim();

    // Mapping of major ecommerce countries and variations to their currencies
    const currencyMap = {
        // North America
        "canada": "CAD",
        "united states": "USD",
        "united states of america": "USD",
        "usa": "USD",
        "us": "USD",
        "mexico": "MXN",

        // Europe (Non-Euro)
        "united kingdom": "GBP",
        "uk": "GBP",
        "great britain": "GBP",
        "switzerland": "CHF",
        "sweden": "SEK",
        "norway": "NOK",
        "denmark": "DKK",

        // Eurozone
        "germany": "EUR",
        "france": "EUR",
        "italy": "EUR",
        "spain": "EUR",
        "netherlands": "EUR",
        "belgium": "EUR",
        "ireland": "EUR",
        "austria": "EUR",

        // Asia / Pacific
        "australia": "AUD",
        "new zealand": "NZD",
        "japan": "JPY",
        "china": "CNY",
        "india": "INR",
        "south korea": "KRW",
        "singapore": "SGD",
        "hong kong": "HKD",

        // Middle East / Africa
        "united arab emirates": "AED",
        "uae": "AED",
        "saudi arabia": "SAR",
        "south africa": "ZAR",

        // South America
        "brazil": "BRL",
        "argentina": "ARS",
        "colombia": "COP"
    };

    // Edge Case Handling: Loop through the keys and check if the normalized text 
    // *contains* the country name. This prevents failures if the OCR merged 
    // the country with a zip code (e.g., "v5v 3c3 canada").
    for (const [country, currency] of Object.entries(currencyMap)) {
        // Using regex boundaries \b so "us" doesn't match the letters inside "australia"
        const regex = new RegExp(`\\b${country}\\b`, "i");
        if (regex.test(normalizedText)) {
            return currency;
        }
    }

    // Default fallback if no recognized country is found
    return "USD"; 
}

// function parseData(text) {

    
// const orderId = text.match(/Order ID:\s*([\d\-]+)/)?.[1] || "";
// // Matches: Feb 7, 2026 inside the table artifact "Order Date: ","Sat, Feb 7, 2026
// const orderDate = text.match(/Order Date:[\s\S]*?([A-Za-z]{3}\s+\d{1,2},\s+\d{4})/)?.[1] || "";
// const shipTo = text.match(/Ship To:\s*\n([^\n]+)/)?.[1]?.trim() || "";


// let address = (text.match(/Ship To:\s*\n([\s\S]*?)Order ID:/)?.[1] || "")
//               .replace(/\n\s*\n/g, "\n")
//               .trim();
// let rawAddress = (text.match(/Ship To:\s*\n([\s\S]*?)Order ID:/)?.[1] || "")
//                   .replace(/\n/g, " ")     // remove all line breaks
//                   .replace(/\s+/g, " ")    // remove extra spaces
//                   .trim();

// // Split words evenly into 2 lines
// let words = rawAddress.split(" ");
// let mid = Math.ceil(words.length / 2);

// // let address = words.slice(0, mid).join(" ") + "\n" +
// //               words.slice(mid).join(" ");


// const quantity = text.match(/\n(\d+)\s+Saltify/)?.[1] || "";
// const unitPrice = text.match(/\nCA\$([\d\.]+)/)?.[1] || "";
// // Matches: CA$11.00 which appears before "Item subtotal"
// const subtotal = text.match(/CA\$([\d\.]+)\s*[\r\n]*Item subtotal/)?.[1] || "";
// // Extracts (100 g) OR (250 g) OR (500 g)
// const producType = text.match(/\((\d+\s?g)\)/i)?.[1] || "";


//     // Fill editable form
//     document.getElementById("invoiceNo").value = "SALT-EXP-CA-26-010";
//     document.getElementById("orderId").value = orderId;
//     document.getElementById("orderDate").value = orderDate;
//     document.getElementById("shipTo").value = shipTo;
//     document.getElementById("shippingAddress").value = address;
//     document.getElementById("quantity").value = quantity;
//     document.getElementById("unitPrice").value = unitPrice;
//     document.getElementById("itemSubtotal").value = subtotal;
//     document.getElementById("productType").value = producType;
//     const productOptions = {
//         "100 g": { dimension: "18 x 10 x 5 cm", net: 0.1, gross: 0.196 },
//         "250 g": { dimension: "18 x 10 x 11 cm", net: 0.25, gross: 0.38 },
//         "500 g": { dimension: "18 x 10 x 11 cm", net: 0.5, gross: 0.65 },
//     };
//     document.getElementById("dimension").value = productOptions[producType]?.dimension || "1";
//     document.getElementById("netWeight").value = productOptions[producType]?.net || "1";
//     document.getElementById("grossWeight").value = productOptions[producType]?.gross || "1";
// }

// its second ----------------------------------------------------------------------------------------------------------------------------

// function parseData(text) {
//     // 1. Order ID
//     const orderIdMatch = text.match(/Order ID:\s*([\d\-]+)/i);
//     const orderId = orderIdMatch ? orderIdMatch[1] : "";

//     // 2. Order Date (Matches standard Month DD, YYYY anywhere in the text)
//     const orderDateMatch = text.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}/i);
//     const orderDate = orderDateMatch ? orderDateMatch[0] : "";


//     // let address = "";
//     // // Captures the block between "Ship To:" and "Order ID:" (or "Amazon")
//     // const addressBlockMatch = text.match(/Ship To:\s*\n([\s\S]*?)(?:Order ID:|Amazon\b)/i);
//     // if (addressBlockMatch) {
//     //     let addressLines = addressBlockMatch[1].split('\n')
//     //         .map(line => line.trim())
//     //         .filter(line => line.length > 0);
        
//     //     if (addressLines.length > 0) {
//     //         shipTo = addressLines.shift(); // The first line is always the Name
//     //     }
//     //     // Join the remaining lines into a clean, single-line address
//     //     address = addressLines.join(" ");
//     // }
    

//     let address = (text.match(/Ship To:\s*\n([\s\S]*?)Order ID:/)?.[1] || "")
//               .replace(/\n\s*\n/g, "\n")
//               .trim();
// let rawAddress = (text.match(/Ship To:\s*\n([\s\S]*?)Order ID:/)?.[1] || "")
//                   .replace(/\n/g, " ")     // remove all line breaks
//                   .replace(/\s+/g, " ")    // remove extra spaces
//                   .trim();

// // Split words evenly into 2 lines
// let words = rawAddress.split(" ");
// let mid = Math.ceil(words.length / 2);


//     // 4. Quantity (Checks table format or plain text format)
//     const qtyMatch = text.match(/"?(\d+)\s*"?\s*,\s*"?Saltify/i) || text.match(/\n(\d+)\s+Saltify/i);
//     const quantity = qtyMatch ? qtyMatch[1] : "1";

//     // 5. Product Type (Handles split lines and US oz conversions)
//     // Looks for the number immediately following "Powdered ("
//     const weightMatch = text.match(/Powdered\s*\(\s*(\d+)/i);
//     const weightNum = weightMatch ? weightMatch[1] : "100";
//     const producType = `${weightNum} g`; // Reconstructs cleanly to match your dictionary keys

//     // 6. Unit Price (Handles CA$ and US$)
//     const unitPriceMatch = text.match(/"(?:CA)?\$([\d\.]+)\s*"/i) || text.match(/(?:CA)?\$([\d\.]+)/i);
//     const unitPrice = unitPriceMatch ? unitPriceMatch[1] : "";

//     // 7. Item Subtotal
//     let subtotalMatch = text.match(/Item subtotal\s*(?:CA)?\$([\d\.]+)/i) ||
//                         text.match(/(?:CA)?\$([\d\.]+)\s*[\r\n]*Item subtotal/i) ||
//                         text.match(/"Item subtotal[\s\S]*?"\s*,\s*"(?:CA)?\$([\d\.]+)/i);
//     let subtotal = subtotalMatch ? subtotalMatch[1] : "";
    
//     // Mathematical fallback: If table layout hides the subtotal, calculate it
//     if (!subtotal && unitPrice && quantity) {
//         subtotal = (parseFloat(unitPrice) * parseInt(quantity, 10)).toFixed(2);
//     }


//     // Extract Currency using the new mapping!
//     const currencyCode = getCurrencyByCountry(rawAddress);

//     // 8. Fill editable form
//     document.getElementById("invoiceNo").value = "SALT-EXP-CA-26-010"; 
//     document.getElementById("orderId").value = orderId;
//     document.getElementById("orderDate").value = orderDate;
//     // document.getElementById("shipTo").value = shipTo;
//     document.getElementById("shippingAddress").value = address;
//     document.getElementById("quantity").value = quantity;
//     document.getElementById("unitPrice").value = unitPrice;
//     document.getElementById("itemSubtotal").value = subtotal;
//     document.getElementById("productType").value = producType;
//     document.getElementById("currency").value = currencyCode; // Default to CAD, can be adjusted based on unit price extraction

//     const productOptions = {
//         "100 g": { dimension: "18 x 10 x 5 cm", net: 0.1, gross: 0.196 },
//         "250 g": { dimension: "18 x 10 x 11 cm", net: 0.25, gross: 0.38 },
//         "500 g": { dimension: "18 x 10 x 11 cm", net: 0.5, gross: 0.65 },
//     };
    
//     // Map the cleaned product type to your dictionary
//     const options = productOptions[producType] || productOptions["100 g"];
//     document.getElementById("dimension").value = options.dimension;
//     document.getElementById("netWeight").value = options.net;
//     document.getElementById("grossWeight").value = options.gross;
// }
// =============================
// GO TO INVOICE PAGE
// =============================

function fillForm(data) {

    document.getElementById("invoiceNo").value = data.invoiceNo || "SALT-EXP-CA-26-010";
    document.getElementById("orderId").value = data.orderId || "";
    document.getElementById("orderDate").value = data.orderDate || "";
    document.getElementById("shippingAddress").value = data.address || "";
    document.getElementById("quantity").value = data.quantity || "1";
    document.getElementById("unitPrice").value = data.unitPrice || "";
    document.getElementById("itemSubtotal").value = data.subtotal || "";
    document.getElementById("productType").value = data.productType || "100 g";
    document.getElementById("currency").value = data.currency || "USD";

    const productOptions = {
        "100 g": { dimension: "18 x 10 x 5 cm", net: 0.1, gross: 0.196 },
        "250 g": { dimension: "18 x 10 x 11 cm", net: 0.25, gross: 0.38 },
        "500 g": { dimension: "18 x 10 x 11 cm", net: 0.5, gross: 0.65 },
    };

    const options = productOptions[data.productType] || productOptions["100 g"];

    document.getElementById("dimension").value = options.dimension;
    document.getElementById("netWeight").value = options.net;
    document.getElementById("grossWeight").value = options.gross;
}   

async function parseData(text) {

    const API_KEY = "AIzaSyCGpDVqFYVXattDUBFhTYgToVonPQMAUWM";

    const prompt = `
You are an invoice parser.
Text can be in diffrent languages but you have to give output in english.
Extract the following fields from the text and return ONLY valid JSON.

Fields:
invoiceNo
orderId
orderDate
address
quantity
unitPrice
subtotal
productType
currency

Rules:
- If a field is missing return ""
- shipping address should not be in one line keep it like given in the text also dont leave next line blank. 
- productType should be like "100 g", "250 g", "500 g"
- currency should be 3 letter code (USD, CAD, INR, EUR) and respectively for other countries.
- Return JSON only.

Text:
${text}
`;
    console.log("Prompt sent to Gemini:", prompt);
    const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt }
                        ]
                    }
                ]
            })
        }
    );
    console.log("Raw API Response:", response);
    const data = await response.json();

    let aiText = data.candidates[0].content.parts[0].text;

    // remove markdown if Gemini adds ```json
    aiText = aiText.replace(/```json|```/g, "").trim();

    const result = JSON.parse(aiText);

    fillForm(result);
}


function goToInvoice() {

    const data = {
        invoiceNo: document.getElementById("invoiceNo").value,
        orderId: document.getElementById("orderId").value,
        orderDate: document.getElementById("orderDate").value,
        // shipTo: document.getElementById("shipTo").value,
        address: document.getElementById("shippingAddress").value,
        quantity: document.getElementById("quantity").value,
        unitPrice: document.getElementById("unitPrice").value,
        subtotal: document.getElementById("itemSubtotal").value,
        productType: document.getElementById("productType").value,
        dimension: document.getElementById("dimension").value,
        netWeight: document.getElementById("netWeight").value,
        grossWeight: document.getElementById("grossWeight").value,
        currency: document.getElementById("currency").value
    };

    localStorage.setItem("invoiceData", JSON.stringify(data));

    window.location.href = "invoice.html";
}

function goToPacking() {

    const data = {
        invoiceNo: document.getElementById("invoiceNo").value,
        orderId: document.getElementById("orderId").value,
        orderDate: document.getElementById("orderDate").value,
        // shipTo: document.getElementById("shipTo").value,
        address: document.getElementById("shippingAddress").value,
        quantity: document.getElementById("quantity").value,
        unitPrice: document.getElementById("unitPrice").value,
        subtotal: document.getElementById("itemSubtotal").value,
        productType: document.getElementById("productType").value,
        dimension: document.getElementById("dimension").value,
        netWeight: document.getElementById("netWeight").value,
        grossWeight: document.getElementById("grossWeight").value,
        currency: document.getElementById("currency").value
    };

    // Save everything in same storage
    localStorage.setItem("packingData", JSON.stringify(data));

    // Redirect to packing page
    window.location.href = "packing.html";
}


// =============================
// LOAD DATA ON INVOICE PAGE
// =============================

function loadInvoiceData() {

    const data = JSON.parse(localStorage.getItem("invoiceData"));
    if (!data) return;
    
    document.getElementById("i_invoiceNo").innerText = data.invoiceNo;
    document.getElementById("i_orderId").innerText = data.orderId;
    document.getElementById("i_orderDate").innerText = data.orderDate;
    // document.getElementById("i_shipTo").innerText = data.shipTo;
    document.getElementById("i_address").innerText = data.address;
    document.getElementById("i_quantity").innerText = data.quantity;
    document.getElementById("i_unitPrice").innerText = data.unitPrice;
    document.querySelectorAll(".i_itemSubtotal").forEach(el => {
        el.innerText = data.subtotal;
    });
    // document.getElementById("i_dimension").textContent = data.dimension;
    document.getElementById("i_netWeight").innerText = data.netWeight;
    document.getElementById("i_grossWeight").innerText = data.grossWeight;
    // document.getElementById("i_currency").innerText = data.currency;
    document.querySelectorAll(".i_currency").forEach(el => {
     el.textContent = data.currency;
});
}

// load package data on packing slip page

function loadPackingData() {

    const data = JSON.parse(localStorage.getItem("packingData"));
    if (!data) return;
    console.log("Packing Data Loaded:", data);
    document.getElementById("p_invoiceNo").innerText = data.invoiceNo;
    document.getElementById("p_date").innerText = data.orderDate;
    document.getElementById("p_address").innerText = data.address;
    document.getElementById("p_quantity").innerText = data.quantity;
    document.getElementById("p_productType").innerText = data.productType;
    document.getElementById("p_dimension").innerText = data.dimension;
    document.getElementById("p_netWeight").innerText = data.netWeight;
    document.getElementById("p_grossWeight").innerText = data.grossWeight;
    document.getElementById("p_currency").innerText = data.currency;
}


// =============================
// DOWNLOAD PDF
// =============================
function downloadPDF() {
    const element = document.getElementById("invoice");
    const invoice_number = document.getElementById("i_invoiceNo").innerText || "Invoice";
    const opt = {
        margin: 0,
        filename: `${invoice_number}_Invoice.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}


function downloadPackingPDF() {

    const element = document.getElementById("packing");
    const invoice_number = document.getElementById("p_invoiceNo").innerText || "Packing_List";

    html2pdf().set({
        margin: 0,
        filename: `${invoice_number}_PackingList.pdf`,
        html2canvas: { scale: 2, scrollY: 0, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: [] }
    }).from(element).save();
}






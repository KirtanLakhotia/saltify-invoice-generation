// =============================
// PDF EXTRACTION
// =============================

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

function parseData(text) {

const orderId = text.match(/Order ID:\s*([\d\-]+)/)?.[1] || "";
// Matches: Feb 7, 2026 inside the table artifact "Order Date: ","Sat, Feb 7, 2026
const orderDate = text.match(/Order Date:[\s\S]*?([A-Za-z]{3}\s+\d{1,2},\s+\d{4})/)?.[1] || "";
const shipTo = text.match(/Ship To:\s*\n([^\n]+)/)?.[1]?.trim() || "";
let address = (text.match(/Ship To:\s*\n([\s\S]*?)Order ID:/)?.[1] || "")
              .replace(/\n\s*\n/g, "\n")
              .trim();
const quantity = text.match(/\n(\d+)\s+Saltify/)?.[1] || "";
const unitPrice = text.match(/\nCA\$([\d\.]+)/)?.[1] || "";
// Matches: CA$11.00 which appears before "Item subtotal"
const subtotal = text.match(/CA\$([\d\.]+)\s*[\r\n]*Item subtotal/)?.[1] || "";
// Extracts (100 g) OR (250 g) OR (500 g)
const producType = text.match(/\((\d+\s?g)\)/i)?.[1] || "";

    // Fill editable form
    document.getElementById("orderId").value = orderId;
    document.getElementById("orderDate").value = orderDate;
    document.getElementById("shipTo").value = shipTo;
    document.getElementById("shippingAddress").value = address;
    document.getElementById("quantity").value = quantity;
    document.getElementById("unitPrice").value = unitPrice;
    document.getElementById("itemSubtotal").value = subtotal;
    document.getElementById("productType").value = producType;
}


// =============================
// GO TO INVOICE PAGE
// =============================

function goToInvoice() {

    const data = {
        orderId: document.getElementById("orderId").value,
        orderDate: document.getElementById("orderDate").value,
        shipTo: document.getElementById("shipTo").value,
        address: document.getElementById("shippingAddress").value,
        quantity: document.getElementById("quantity").value,
        unitPrice: document.getElementById("unitPrice").value,
        subtotal: document.getElementById("itemSubtotal").value,
        productType: document.getElementById("productType").value
    };

    localStorage.setItem("invoiceData", JSON.stringify(data));

    window.location.href = "invoice.html";
}


// =============================
// LOAD DATA ON INVOICE PAGE
// =============================

function loadInvoiceData() {

    const data = JSON.parse(localStorage.getItem("invoiceData"));
    if (!data) return;

    document.getElementById("i_orderId").innerText = data.orderId;
    document.getElementById("i_orderDate").innerText = data.orderDate;
    // document.getElementById("i_shipTo").innerText = data.shipTo;
    document.getElementById("i_address").innerText = data.address;
    document.getElementById("i_quantity").innerText = data.quantity;
    document.getElementById("i_unitPrice").innerText = data.unitPrice;
    document.getElementById("i_itemSubtotal").innerText = data.subtotal;
}


// =============================
// DOWNLOAD PDF
// =============================
function downloadPDF() {
    const element = document.getElementById("invoice");

    const opt = {
        margin: 0,
        filename: 'Commercial_Export_Invoice.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}

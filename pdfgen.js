const express = require('express');

const app = express();
const ejs = require('ejs');
const pdf = require('html-pdf');
const path = require('path');
const util = require("util");
const { v4 } = require('uuid');

const renderFile = util.promisify(ejs.renderFile);

const createPdf = (data, options) => new Promise((resolve, reject) => {
    pdf.create(data, options).toFile('certificates/cert.pdf', (err, success) => {
        if (err) return reject(err);
        resolve(success);
    })
})

// app.get("/pdf", (req, res, next) => {
//     const name = "bob";
//     ejs.renderFile("views/cert-template.ejs", {name}, (err, data) => {
//         if (err) {
//             console.log(err)
//             res.send(err.message);
//         } else {
//             const options = {
//                 "height": "11.25in",
//             "width": "8.5in",
//             "header": {
//                 "height": "20mm"
//             },
//             "footer": {
//                 "height": "20mm",
//             },
//             path: __dirname
//             };
//             pdf.create(data, options).toFile('cert.pdf', (err, data) => {
//                 if (err) return res.send(err.message);
//                 res.send("File created");
//             })
//         }
//     })
// })

app.get("/pdf", async (req, res, next) => {
    const name = "bob";
    const data = await renderFile("views/cert-template.ejs" , {name} );
    const options = {
                height: "11.25in",
            width: "8.5in",
            header: {
                height: "20mm"
            },
            footer: {
                "height": "20mm",
            }
            };
    const response = await createPdf(data, options);
    // response : {filename: "/Users/admin/projects/fullstack_proj/backend/cert.pdf"}
    res.json({message: response});
})


//
app.listen(4000, () => console.log("listening on port 4000"))
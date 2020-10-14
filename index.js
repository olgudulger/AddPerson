const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const _ = require("underscore");
const https = require("https");
const mysql = require('mysql');
const dateFormater = require('dateformat');

//Projeyi dinleyecek portu belirledik.
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`localhost:${port} -> üzerinden apiye ulaşabilirsiniz !!! `);
});

//Database connection bilgileri.
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'olgudb'
});



//Gönderilen post datasını obje olarak yakalamak için bodyParser kullandık.
app.use(bodyParser.json());

// Gelen body'den name parametresini aldık ve bunu RestAPI'ye http request yaptık , dönen sonucu güncel tarih ile olgudb'de person tablosuna yazdık.
app.post("/addData/", (req, res, next) => {
    let body = _.pick(req.body, "name");
    let personName = body.name;

    https.get("https://api.agify.io?name=" + personName, resp => {
        let data = "";
        resp.on("data", chunk => {
            data += chunk;
        });

        resp.on("end", () => {
            const url = JSON.parse(data);
            console.log(url);
            const now = dateFormater(new Date(), "yyyy-mm-dd HH:MM:ss");
            const query = connection.query("INSERT INTO olgudb.person (Name, Age, Count,CreateDate) VALUES ('" + url.name + "', '" + url.age + "', '" + url.count + "', '" + now + "');", function (err, result) {
                if (err) throw err;
            });

            const returnData = {
                message: "Ekleme Basarili",
                data: {
                    "name": url.name,
                    "age": url.age,
                    "count": url.count,
                    "createDate": now
                }
            };

        res.write(JSON.stringify(returnData));
        res.end();

        });

    })
        .on("error", err => {
            console.log("Error: " + err.message);
        });


});
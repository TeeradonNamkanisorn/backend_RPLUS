const CC = require('currency-converter-lt');

const currencyConverter = new CC();

module.exports.USDtoTHB = (usd) => currencyConverter.from("USD").to("THB").amount(usd).convert();
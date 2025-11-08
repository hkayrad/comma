import express from 'express';
import { parseStringPromise } from 'xml2js';
import dataMiddleware from '../utils/middleware';

const router = express.Router();

router.use(dataMiddleware);

router.get('/', async (req, res) => {
    try {
        const response = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml");
        const xmlData = await response.text();

        const result = await parseStringPromise(xmlData);

        const currencies = result.Tarih_Date.Currency;

        const usd = currencies.find((c: any) => c.$.Kod === 'USD');
        const eur = currencies.find((c: any) => c.$.Kod === 'EUR');
        const gbp = currencies.find((c: any) => c.$.Kod === 'GBP');

        const data = {
            date: result.Tarih_Date.$.Tarih,
            usd: {
                forexBuying: usd.ForexBuying[0],
                forexSelling: usd.ForexSelling[0],
                banknoteBuying: usd.BanknoteBuying[0],
                banknoteSelling: usd.BanknoteSelling[0],
            },
            eur: {
                forexBuying: eur.ForexBuying[0],
                forexSelling: eur.ForexSelling[0],
                banknoteBuying: eur.BanknoteBuying[0],
                banknoteSelling: eur.BanknoteSelling[0],
            },
            gbp: {
                forexBuying: gbp.ForexBuying[0],
                forexSelling: gbp.ForexSelling[0],
                banknoteBuying: gbp.BanknoteBuying[0],
                banknoteSelling: gbp.BanknoteSelling[0],
            }
        }

        res.send(data);
    } catch (error) {
        console.error("Error fetching TCMB data:", error);
        res.status(500).json({ success: false, message: "Error fetching TCMB data" });
    }
});


export default router;
import axios from 'axios';
import * as cheerio from 'cheerio';

// Configuration
// You should probably move this to environment variables
const SAWERIA_USERNAME = "gadingkencana";
const BACKEND = 'https://backend.saweria.co';
const FRONTEND = 'https://saweria.co';

const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15'
};

async function createPaymentString(saweriaUsername: string, amount: number, sender: string, email: string, pesan: string) {
    if (!saweriaUsername || !amount || !sender || !email) {
        throw new Error("Parameter is missing!");
    }
    if (amount < 1000) {
        throw new Error("Minimum amount is 1000");
    }

    try {
        const response = await axios.get(`${FRONTEND}/${saweriaUsername}`, {
            headers,
            timeout: 5000
        });

        const $ = cheerio.load(response.data);
        const nextDataScript = $('#__NEXT_DATA__').html();

        if (!nextDataScript) {
            throw new Error("Saweria account not found (Script missing)");
        }

        const nextData = JSON.parse(nextDataScript);
        const userId = nextData?.props?.pageProps?.data?.id;

        if (!userId) {
            throw new Error("Saweria account not found (ID missing)");
        }

        const payload = {
            agree: true,
            notUnderage: true,
            message: pesan || "Support Comicku",
            amount: parseInt(amount.toString()),
            payment_type: "qris",
            vote: "",
            currency: "IDR",
            customer_info: {
                first_name: sender,
                email: email,
                phone: ""
            }
        };

        const postResponse = await axios.post(`${BACKEND}/donations/${userId}`, payload, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });

        return postResponse.data.data;
    } catch (error: any) {
        console.error("Saweria Create Error:", error.message);
        if (error.response) {
            throw new Error(error.response.data?.message || "Request failed");
        }
        throw error;
    }
}

export async function createPaymentQr(amount: number, sender: string, email: string, pesan: string) {
    // Assuming hardcoded or configurable username for now
    const username = process.env.SAWERIA_USERNAME || "gadingkencana";
    const paymentDetails = await createPaymentString(username, amount, sender, email, pesan);
    return {
        qr_string: paymentDetails.qr_string,
        id: paymentDetails.id
    };
}

export async function checkPaymentStatus(transactionId: string) {
    try {
        const response = await axios.get(`${BACKEND}/donations/qris/${transactionId}`, {
            headers,
            timeout: 5000
        });

        // Saweria logic: if qr_string is empty, it means paid?
        // Based on user provided snippet: return data.qr_string === "";
        const data = response.data.data || {};
        return data.qr_string === "";
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
             // Or logic from user: throw "Transaction ID is not found!"
             return false;
        }
        return false;
    }
}

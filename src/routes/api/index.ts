import express from "express";
import { ActionGetResponse, ActionPostRequest, ActionPostResponse, ACTIONS_CORS_HEADERS, createPostResponse, MEMO_PROGRAM_ID } from "@solana/actions";
import { clusterApiUrl, ComputeBudgetProgram, Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
const router = express.Router()

router.get("/get", (req, res) => {
    
    const requestUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);

     const iconUrl = requestUrl.origin + '/img/mario.JPG';

    const payload : ActionGetResponse = {
      icon: iconUrl,
      label: "Transfer",
      description: "Send me some SOL 🙃",
      title: "Transfer Native SOL",
      links: {
        actions: [
            {
                label: "Send 1 SOL 🙂",
                 href: `${requestUrl.origin}/api/v1/blink/action?amount=1`
            },
            {
                label: "Send 5 SOL 😎",
                 href: `${requestUrl.origin}/api/v1/blink/action?amount=5`
            },
            {
                label: "Send 10 SOL 🫣",
                 href: `${requestUrl.origin}/api/v1/blink/action?amount=10`
            },
            {
                label: "Send SOL 😋",
                 href: `${requestUrl.origin}/api/v1/blink/action?amount=`,
                parameters: [
                    {
                        name: "amount",
                        label: "Enter the amount of SOL to send",
                        required: true
                    }
                ]
            }
        ]
      }
    }

    res.set(ACTIONS_CORS_HEADERS);

    return res.json(payload);
})

router.post("/action", async (req, res) => {
    const amountStr  = req.query.amount as string;
    const amount = amountStr ? parseFloat(amountStr) : 0;
 
    try { 
        // console.log(process.env.DEFAULT_SOL_ADDRESS)
        // @ts-ignore
     let toPubkey = new PublicKey('7Gj6AiSg1QDwbK5iCHJziSuPP4Y3w3NJu3LRi8JJNFF6');
     
     const body : ActionPostRequest =  req.body;
 
     let account: PublicKey;

     try {
         account = new PublicKey(body.account);
     } catch (err) {
        res.set(ACTIONS_CORS_HEADERS);
        return res.status(400).json('Invalid "account" provided');
     }
 
     const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
 
     const minimumBalance = await connection.getMinimumBalanceForRentExemption(0);
 
     if(amount * LAMPORTS_PER_SOL < minimumBalance) {
         throw `account may not be rent exmpted`;
     }

     console.log('Account: ', account, 'to pub: ', toPubkey)

 
     const transaction = new Transaction();
 
     transaction.add(
        SystemProgram.transfer({
          fromPubkey: account,
          toPubkey: toPubkey,
          lamports: amount * LAMPORTS_PER_SOL,
        }),
      );

     transaction.feePayer = account;

     
     transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
 
     const payload : ActionPostResponse = await createPostResponse({
         fields: {
             transaction,
             message: `Sent ${amount} SOL to ${toPubkey.toString()}`,
         }
     })

     console.log('second')
     res.set(ACTIONS_CORS_HEADERS);
     return res.json(payload);
    } catch (err) {
        console.log(err);
        res.set(ACTIONS_CORS_HEADERS);
        return res.json("An unknown error occurred");
    }
})

module.exports = router
"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIP_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function createCheckoutSession(credits: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${credits} eros credits`,
          },
          unit_amount: Math.round((credits / 50) * 100), // the amount per dollar and multiply by 100  cents
        },
        quantity: 1,
      },
    ],

    customer_creation: "always",
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/create`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    client_reference_id: userId.toString(), // to know which user is buying
    // to keep track of how many credits they have bought
    metadata: {
      credits,
    },
  });

  return redirect(session.url!);
}

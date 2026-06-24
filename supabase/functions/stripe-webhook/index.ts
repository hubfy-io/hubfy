import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@17?target=denonext";

// No CORS needed — this is called by Stripe servers, not browsers

/* ─── Idempotency: track processed event IDs to prevent duplicates ─── */
const processedEvents = new Set<string>();
const MAX_PROCESSED_EVENTS = 1000;

function markEventProcessed(eventId: string) {
  if (processedEvents.size >= MAX_PROCESSED_EVENTS) {
    // Evict oldest entries (Set iterates in insertion order)
    const it = processedEvents.values();
    for (let i = 0; i < 200; i++) it.next();
    const toKeep = new Set<string>();
    for (const v of it) toKeep.add(v);
    processedEvents.clear();
    for (const v of toKeep) processedEvents.add(v);
  }
  processedEvents.add(eventId);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const stripe = new Stripe(stripeSecretKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Verify webhook signature (required for Deno)
    const signature = req.headers.get("Stripe-Signature");
    if (!signature) {
      return new Response("Missing Stripe-Signature", { status: 400 });
    }

    const body = await req.text();
    const cryptoProvider = Stripe.createSubtleCryptoProvider();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );

    console.log(`Stripe webhook received: ${event.type} (${event.id})`);

    // 2. Idempotency check — skip already-processed events
    if (processedEvents.has(event.id)) {
      console.log(`Stripe webhook duplicate skipped: ${event.id}`);
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Handle events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const tenantId = session.metadata?.tenant_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!tenantId) {
          console.error("checkout.session.completed: missing tenant_id in metadata");
          break;
        }

        // Upsert subscription record
        await supabaseAdmin.from("subscriptions").upsert(
          {
            tenant_id: tenantId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: "active",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "tenant_id" }
        );

        console.log(`Subscription created for tenant ${tenantId}`);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        // Fetch subscription details from Stripe for period info
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "active",
            stripe_price_id: subscription.items.data[0]?.price?.id || null,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscriptionId);

        console.log(`Invoice paid for subscription ${subscriptionId}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscriptionId);

        console.log(`Payment failed for subscription ${subscriptionId}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: subscription.status,
            stripe_price_id: subscription.items.data[0]?.price?.id || null,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        console.log(`Subscription updated: ${subscription.id} → ${subscription.status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "canceled",
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        console.log(`Subscription canceled: ${subscription.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    markEventProcessed(event.id);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("stripe-webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Webhook processing failed" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * Daily Reminders Edge Function
 *
 * This function should be scheduled via Supabase cron (pg_cron)
 * to run daily. It checks for unsettled obligations older than 3 days
 * and creates reminder notifications for debtors.
 *
 * To schedule, add to your database:
 * SELECT cron.schedule(
 *   'daily-reminders',
 *   '0 9 * * *',  -- Every day at 9 AM
 *   $$SELECT net.http_post(
 *     url := current_setting('app.settings.supabase_url') || '/functions/v1/daily-reminders',
 *     headers := jsonb_build_object(
 *       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
 *       'Content-Type', 'application/json'
 *     )
 *   )$$
 * );
 */

Deno.serve(async (req) => {
  try {
    // Authentication: verify the caller has a valid service role key
    // The scheduled pg_cron job sends the service role key in the Authorization header
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!authHeader || authHeader !== `Bearer ${supabaseServiceKey}`) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find unsettled obligations older than 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: obligations, error: fetchError } = await supabase
      .from("obligations")
      .select("id, debtor_id, creditor_id, original_amount, settled_amount, created_at")
      .in("status", ["pending", "partially_settled"])
      .lt("created_at", threeDaysAgo.toISOString());

    if (fetchError) {
      throw new Error(`Failed to fetch obligations: ${fetchError.message}`);
    }

    if (!obligations || obligations.length === 0) {
      return new Response(
        JSON.stringify({ message: "No reminders needed", count: 0 }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Group by debtor to avoid multiple notifications
    const debtorObligations = new Map<string, Array<typeof obligations[0]>>();

    for (const obligation of obligations) {
      const existing = debtorObligations.get(obligation.debtor_id) || [];
      existing.push(obligation);
      debtorObligations.set(obligation.debtor_id, existing);
    }

    let notificationsCreated = 0;

    // Create notifications for each debtor
    for (const [debtorId, obs] of debtorObligations) {
      const totalOwed = obs.reduce((sum, o) => {
        const remaining = o.original_amount - o.settled_amount;
        return sum + remaining;
      }, 0);

      const creditorIds = [...new Set(obs.map((o) => o.creditor_id))];

      // Check if user has daily reminder enabled
      const { data: profile } = await supabase
        .from("profiles")
        .select("notification_preferences")
        .eq("id", debtorId)
        .single();

      const prefs = profile?.notification_preferences;
      if (prefs && !prefs.daily_reminder) {
        continue; // Skip if daily reminders are disabled
      }

      // Create notification
      const { error: notifError } = await supabase.rpc("create_notification", {
        p_user_id: debtorId,
        p_type: "reminder",
        p_title: "Settlement Reminder",
        p_body: `You have ₹${totalOwed} in unsettled debts from ${creditorIds.length} transaction${creditorIds.length > 1 ? "s" : ""}. Tap to settle up.`,
        p_data: JSON.stringify({
          obligation_ids: obs.map((o) => o.id),
          total_owed: totalOwed,
        }),
      });

      if (!notifError) {
        notificationsCreated++;
      }
    }

    return new Response(
      JSON.stringify({
        message: "Daily reminders processed",
        obligationsChecked: obligations.length,
        notificationsCreated,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

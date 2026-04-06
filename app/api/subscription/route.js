import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ isPro: false, usageCount: 0 });
    }

    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('status, usage_count')
      .eq('user_id', user.id)
      .maybeSingle();

    return NextResponse.json({
      isPro: subscription?.status === 'active',
      usageCount: subscription?.usage_count ?? 0,
    });
  } catch (error) {
    return NextResponse.json({ isPro: false, usageCount: 0 });
  }
}

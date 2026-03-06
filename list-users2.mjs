import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

async function listUsers() {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
        console.error('Error fetching users:', error)
        return
    }

    console.log(`Supabase Users (${users.length}):`)
    users.forEach(u => console.log(`- ${u.email} (ID: ${u.id})`))
}

listUsers()

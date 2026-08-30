import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase-admin'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autenticado.' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.substring(7)

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )

    // Verificar el token enviado por el navegador
    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser(accessToken)

    if (userError || !user) {
      return NextResponse.json(
        { error: 'No autenticado.' },
        { status: 401 }
      )
    }

    // Verificar administrador activo
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, rol, activo')
      .eq('id', user.id)
      .single()

    if (
      profileError ||
      !profile ||
      profile.rol !== 'admin' ||
      profile.activo !== true
    ) {
      return NextResponse.json(
        { error: 'No autorizado.' },
        { status: 403 }
      )
    }

    const { id: targetUserId } = await context.params

    // Impedir que el administrador se elimine a sí mismo
    if (targetUserId === user.id) {
      return NextResponse.json(
        {
          error:
            'No puedes eliminar tu propia cuenta de administrador.',
        },
        { status: 400 }
      )
    }

    // Verificar que el usuario objetivo exista
    const { data: targetProfile, error: targetProfileError } =
      await supabaseAdmin
        .from('profiles')
        .select('id, rol, activo')
        .eq('id', targetUserId)
        .maybeSingle()

    if (targetProfileError) {
      console.error(targetProfileError)

      return NextResponse.json(
        { error: 'No se pudo verificar el usuario.' },
        { status: 500 }
      )
    }

    if (!targetProfile) {
      return NextResponse.json(
        { error: 'Usuario no encontrado.' },
        { status: 404 }
      )
    }

    // Eliminar el profile y sus datos relacionados mediante CASCADE
    const { error: profileDeleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', targetUserId)

    if (profileDeleteError) {
      console.error(profileDeleteError)

      return NextResponse.json(
        {
          error:
            'No se pudieron eliminar los datos del usuario.',
        },
        { status: 500 }
      )
    }

    // Eliminar la cuenta de Authentication
    const { error: authDeleteError } =
      await supabaseAdmin.auth.admin.deleteUser(targetUserId)

    if (authDeleteError) {
      console.error(authDeleteError)

      return NextResponse.json(
        {
          error:
            'Los datos de CHRVM fueron eliminados, pero no se pudo eliminar la cuenta de autenticación.',
          authCleanupRequired: true,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado completamente.',
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}

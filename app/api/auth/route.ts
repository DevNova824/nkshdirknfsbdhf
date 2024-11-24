// app/api/auth/route.ts

/**
 * This project was developed by Nikandr Surkov.
 * You may not use this code if you purchased it from any source other than the official website https://nikandr.com.
 * If you purchased it from the official website, you may use it for your own projects,
 * but you may not resell it or publish it publicly.
 * 
 * Website: https://nikandr.com
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * Telegram: https://t.me/nikandr_s
 * Telegram channel for news/updates: https://t.me/clicker_game_news
 * GitHub: https://github.com/nikandr-surkov
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateTelegramWebAppData } from '@/utils/server-checks'
import { encrypt, SESSION_DURATION } from '@/utils/session'

export async function POST(request: Request) {
    const isLocalhost = request.headers.get('host')?.includes('localhost');
    const isAdminAccessEnabled = process.env.ACCESS_ADMIN === 'true';

    if (!isLocalhost || !isAdminAccessEnabled) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    try {
        const { initData } = await request.json()

        // Validate the initData is present
        if (!initData) {
            console.error('Missing initData in request')
            return NextResponse.json(
                { message: 'Missing initData' },
                { status: 400 }
            )
        }

        const { message, validatedData, user } = validateTelegramWebAppData(initData)

        console.log("Message", message)

        if (!validatedData) {
            console.error('Telegram validation failed for initData:', initData)
            return NextResponse.json(
                { message: 'Authentication failed' },
                { status: 401 }
            )
        }

        const expires = new Date(Date.now() + SESSION_DURATION)
        const session = await encrypt({ user, expires })

        cookies().set("session", session, {
            expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        })

        return NextResponse.json({ message: 'Authentication successful' })

    } catch (error) {
        console.error('Auth error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
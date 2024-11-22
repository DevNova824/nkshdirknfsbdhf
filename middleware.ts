// middleware.tsx

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
import type { NextRequest } from 'next/server'
import { getSession, updateSession } from './utils/session'

export async function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const initData = url.searchParams.get('initData');
    console.log("Middleware init data: ", initData);

    // Allow authentication endpoints without session check
    if (request.nextUrl.pathname === '/api/auth') {
        return NextResponse.next()
    }

    // Handle API routes
    if (request.nextUrl.pathname.startsWith('/api')) {
        try {
            const session = await getSession()
            if (!session) {
                return new NextResponse(
                    JSON.stringify({ error: 'Unauthorized' }),
                    {
                        status: 401,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                )
            }

            // Update session only if it exists
            return updateSession(request)
        } catch (error) {
            console.error('Session verification error:', error)
            return new NextResponse(
                JSON.stringify({ error: 'Session verification failed' }),
                {
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/api/:path*'
    ]
}
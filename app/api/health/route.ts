import { NextResponse } from 'next/server'

export function GET(): NextResponse {
	return new NextResponse("{ status: 'Online' }")
}

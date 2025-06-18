import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { logger } from './logger'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

export function handleApiError(error: unknown): NextResponse {
  // Log the error
  if (error instanceof Error) {
    logger.error('API Error: ' + error.message, { 
      stack: error.stack,
      name: error.name 
    })
  } else {
    logger.error('API Error: Unknown error', { error })
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      },
      { status: 400 }
    )
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          error: 'A record with this value already exists',
          field: error.meta?.target
        },
        { status: 409 }
      )
    }

    // Record not found
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      )
    }

    // Foreign key constraint
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Referenced record does not exist' },
        { status: 400 }
      )
    }
  }

  // Handle custom API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    )
  }

  // Handle standard errors
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message = process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }

  // Fallback for unknown errors
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  )
}

// Async error wrapper for API routes
export function asyncHandler<T extends (...args: any[]) => Promise<any>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }) as T
}
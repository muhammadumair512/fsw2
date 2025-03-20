import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import AuthError from './types/AuthError';
import NotFoundError from './types/NotFoundError';
import ValidationError from './types/ValidationError';

export function handleErrors(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.errors.reduce((acc, err) => {
          const field = err.path.join('.');

          if (!acc[field]) acc[field] = [];
          acc[field].push(err.message);

          return acc;
        }, {} as Record<string, string[]>),
      },
      { status: 400 },
    );
  }

  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        error: 'Validation Error',
        message: error.message,
      },
      { status: 400 },
    );
  }
  
  if (error instanceof PrismaClientKnownRequestError) {
    // Handle Prisma errors
    switch (error.code) {
    case 'P2002':
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'A record with this identifier already exists.',
        },
        { status: 409 },
      );

    case 'P2025': {
      const entityName = error.meta?.cause || 'Record';
      
      return NextResponse.json(
        {
          error: 'Not Found',
          message: `${entityName} not found.`,
        },
        { status: 404 },
      );
    }

    default:
      return NextResponse.json(
        {
          error: 'Database Error',
          message: 'An error occurred while accessing the database.',
        },
        { status: 500 },
      );
    }
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json(
      {
        error: 'Not found',
        message: error.message,
      },
      { status: 404 },
    );
  }

  if (error instanceof AuthError) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: error.message,
      },
      { status: 401 },
    );
  }

  return NextResponse.json(
    {
      error: 'Internal server error',
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    },
    { status: 500 },
  );
}

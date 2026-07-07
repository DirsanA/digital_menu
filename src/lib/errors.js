export class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid data') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export function handleApiError(error) {
  if (error instanceof AppError) {
    return Response.json(
      { success: false, message: error.message },
      { status: error.status }
    );
  }

  console.error('Unhandled error:', error);
  return Response.json(
    { success: false, message: 'Internal Server Error' },
    { status: 500 }
  );
}

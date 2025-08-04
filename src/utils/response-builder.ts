type ResponsePayload<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  statusCode?: number;
  error?: any;
};

export class ResponseBuilder {
  private static extractMeta<T>(data?: T): { data: T; meta?: any } {
    if (data && typeof data === "object" && "meta" in data && "data" in data) {
      const { meta, data: actualData } = data as any;
      return { data: actualData, meta };
    }
    return { data: data as T };
  }

  static success<T>(
    message: string,
    data?: T,
    statusCode = 200
  ): ResponsePayload<T> {
    const { data: parsedData, meta } = this.extractMeta(data);
    return {
      success: true,
      message,
      data: parsedData,
      meta,
      statusCode,
    };
  }

  static error(
    message: string,
    error?: any,
    statusCode = 500
  ): ResponsePayload {
    return {
      success: false,
      message,
      error,
      statusCode,
    };
  }

  static created<T>(message: string, data?: T): ResponsePayload<T> {
    return this.success(message, data, 201);
  }

  static badRequest(message: string, error?: any): ResponsePayload {
    return this.error(message, error, 400);
  }

  static unauthorized(message = "Unauthorized"): ResponsePayload {
    return this.error(message, null, 401);
  }

  static notFound(message = "Not Found"): ResponsePayload {
    return this.error(message, null, 404);
  }

  static validationError(
    message = "Validation Error",
    error?: any
  ): ResponsePayload {
    return this.error(message, error, 422);
  }
}

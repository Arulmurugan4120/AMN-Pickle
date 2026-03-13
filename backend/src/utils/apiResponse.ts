import { Response } from 'express';

export class ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  stack?: string;

  constructor(success: boolean, message: string, data?: any) {
    this.success = success;
    this.message = message;
    if (data) this.data = data;
  }

  static success(res: Response, message: string = 'Success', data: any = null, statusCode: number = 200) {
    return res.status(statusCode).json(new ApiResponse(true, message, data));
  }

  static error(res: Response, message: string = 'Error', statusCode: number = 500, error: any = null) {
    const response = new ApiResponse(false, message);
    if (process.env.NODE_ENV !== 'production' && error) {
      response.stack = error.stack;
    }
    return res.status(statusCode).json(response);
  }
}

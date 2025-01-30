import { NextFunction, Request, Response } from "express";

export class CustomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  if (err instanceof CustomError) {
    const { statusCode, message } = err;

    res.status(statusCode).json({ statusCode, success: false, message });
    return;
  }
  res
    .status(500)
    .json({ statusCode: 500, success: false, message: "Something went wrong" });
};
 
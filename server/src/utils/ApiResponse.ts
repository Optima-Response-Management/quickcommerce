export class ApiResponse<T = unknown> {
  success = true;
  constructor(
    public message: string,
    public data?: T
  ) {}
}
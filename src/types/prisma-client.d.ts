declare module "@prisma/client" {
  export class PrismaClient {
    [key: string]: any;
    constructor(options?: Record<string, unknown>);
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
  }
}

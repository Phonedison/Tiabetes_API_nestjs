import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodType } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: any): unknown {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException(result.error.issues);
    }

    return result.data;
  }
}

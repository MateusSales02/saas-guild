import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class UpdateEventDto extends PartialType(CreateEventDto) {}

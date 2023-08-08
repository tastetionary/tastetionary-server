import { PartialType } from '@nestjs/mapped-types';
import { CreatePlaygroundDto } from './create-playground.dto';

export class UpdatePlaygroundDto extends PartialType(CreatePlaygroundDto) {}

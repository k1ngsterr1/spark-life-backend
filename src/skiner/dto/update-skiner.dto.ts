import { PartialType } from '@nestjs/mapped-types';
import { CreateSkinerDto } from './create-skiner.dto';

export class UpdateSkinerDto extends PartialType(CreateSkinerDto) {}

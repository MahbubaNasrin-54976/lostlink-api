import { IsEnum } from 'class-validator';

import { FraudFlagStatus } from '../../common/enums/fraud-flag-status.enum.js';

export class ReviewFraudFlagDto {
  @IsEnum(FraudFlagStatus)
  status: FraudFlagStatus;
}
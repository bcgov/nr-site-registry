import { ParcelDescriptionDto } from '../../dto/parcelDescription.dto';

type ParcelDescriptionsServiceResult = {
  data: ParcelDescriptionDto[];
  count: number;
  page: number;
  pageSize: number;
  success: boolean;
  message: string;
};

export { ParcelDescriptionsServiceResult };

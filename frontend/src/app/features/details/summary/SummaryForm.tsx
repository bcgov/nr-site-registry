import { FC } from 'react';
import { IFormField } from '../../../components/input-controls/IFormField';
import Form from '../../../components/form/Form';
import { Sites } from '../../site/dto/Site';

interface SummaryFormProps {
  formRows: IFormField[][];
  sitesDetails: Sites;
  edit: boolean;
  srMode: boolean;
  changeHandler: (
    graphQLPropertyName: any,
    value: String | [Date, Date],
  ) => void;
}

const SummaryForm: FC<SummaryFormProps> = ({
  formRows,
  sitesDetails,
  edit,
  srMode,
  changeHandler,
}) => {
  return (
    <form onSubmit={() => {}}>
      <Form
        editMode={edit}
        srMode={srMode}
        formRows={formRows}
        formData={sitesDetails}
        handleInputChange={changeHandler}
      />
    </form>
  );
};

export default SummaryForm;

import { Mode } from "fs";
import { UserMode } from "../../helpers/requests/userMode";
import { IFormField } from "../form/IFormField";

export interface ISort {
    editMode: boolean;
    formData: any;
    formRows?: IFormField[][];
    handleSortChange:  (graphQLPropertyName: any, value: string | [Date, Date]) => void;
}
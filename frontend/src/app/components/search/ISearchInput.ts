export interface ISearchInput {
  label?: string;
  searchTerm: string;
  handleSearchChange: (event: any) => void;
  clearSearch: () => void;
  options?: string[];
  optionSelectHandler?: (event: any) => void;
  createNewLabel?: string;
  createNewHandler?: (event: any) => void;
  placeHolderText?: string;
}

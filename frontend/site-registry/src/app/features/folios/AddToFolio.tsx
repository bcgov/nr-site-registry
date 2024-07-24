import React, { FC, useEffect, useState } from "react";
import SearchInput from "../../components/search/SearchInput";
import { useDispatch, useSelector } from "react-redux";
import { addSiteToFolio, fetchFolioItems, folioItems } from "./FolioSlice";
import { FolioContentDTO } from "./dto/Folio";
import { getUser } from "../../helpers/utility";
import { AppDispatch } from "../../Store";


interface ColumnProps {
    className: string;
    selectedRows: any[];
  }

const AddToFolio: FC<ColumnProps> = ({className,selectedRows}) => {

  const [folioSearchTerm, SetFolioSearchTeam] = useState("");
  const folioDetails = useSelector(folioItems);

  const loggedInUser = getUser();
  const dispatch = useDispatch<AppDispatch>();

  const handleFolioSelect = (folioId: string) => {
    let selectedFolio = folioDetails.filter(
      (x: any) => x.folioId === folioId
    )[0];

    if(selectedRows.length === 0 )
    {
        alert('Please select one or more sites to be added to folio');
        return;
    }

    // const sitesToAdd = selectedRows.map((row:any) => {
    //     return {
    //      userId: loggedInUser?.profile.sub ?? "",
    //      folioId: selectedFolio.id+"",
    //      id: parseInt(selectedFolio.id),
    //      siteId: row.id,
    //      whoCreated: loggedInUser?.profile.given_name ?? "",
    //      price: 200.11,
    //    }
    //  })[0]
  
    // console.log("selectedFolio", selectedFolio);
    // let dto: FolioContentDTO = {
    //   siteId: details.id,
    //    + "",
      
    //   whoCreated: loggedInUser?.profile.given_name ?? "",
    //   userId: loggedInUser?.profile.sub ?? "",
    // };

   let rows =  selectedRows.map(row=>{
        return {
            siteId: row.id,
            folioId:  selectedFolio.id + "",
            id: parseInt(selectedFolio.id),
            whoCreated: loggedInUser?.profile.given_name ?? "",
            userId: loggedInUser?.profile.sub ?? "",
        }
    })

    // let dto: FolioContentDTO = {
       
    //   };
      dispatch(addSiteToFolio(rows)).unwrap();

    // dispatch(addSiteToFolio(sitesToAdd[0])).unwrap();
  };

  useEffect(() => {
    dispatch(fetchFolioItems(loggedInUser?.profile.sub ?? ""));
  }, []);
  
  return (
    <div className={className}>
      <SearchInput
        label={"Search Folios"}
        placeHolderText={"Search Folios"}
        searchTerm={folioSearchTerm}
        clearSearch={() => {
          SetFolioSearchTeam("");
          //SetAddToFolioVisible(false);
        }}
        handleSearchChange={(e) => {
          if (e.target) {
            SetFolioSearchTeam(e.target.value);
          } else {
            SetFolioSearchTeam(e);
          }
        }}
        options={folioDetails
          .filter(
            (y: any) =>
              y.folioId.toLowerCase().indexOf(folioSearchTerm.toLowerCase()) !==
              -1
          )
          .map((x: any) => x.folioId)}
        optionSelectHandler={(value) => {
          handleFolioSelect(value);
          //SetAddToFolioVisible(false);
        }}
      />
    </div>
  );
};

export default AddToFolio;

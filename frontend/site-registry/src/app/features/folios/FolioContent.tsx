import React from 'react'
import PageContainer from '../../components/simple/PageContainer'
import CustomLabel from '../../components/simple/CustomLabel';
import Table from '../../components/table/Table';
import { RequestStatus } from '../../helpers/requests/status';
import { FolioContentTableColumns } from './FolioContentTableConfig';

const FolioContents = () => {
  return (
    <PageContainer role='Folio Contents'>
         <div>
        <CustomLabel label="Folio Contents" labelType="b-h1" />
        </div>
    <div className="col-12">
    <Table
          label="Folios"
          isLoading={RequestStatus.success}
          columns={FolioContentTableColumns}
          data={[]}
          totalResults={[].length}
          allowRowsSelect={false}
          showPageOptions={false}
          changeHandler={(event) => {
            console.log("change event", event);
          }}
          editMode={false}
          idColumnName="id"
          delteHandler={()=>{}}
        />
      </div>  
    </PageContainer>
  )
}

export default FolioContents;
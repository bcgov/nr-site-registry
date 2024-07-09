import React from 'react'
import CustomLabel from '../../components/simple/CustomLabel'
import PageContainer from '../../components/simple/PageContainer'
import Table from '../../components/table/Table'
import { RequestStatus } from '../../helpers/requests/status'
import { FolioTableColumns } from './FolioTableConfig'

const Folios = () => {
  return (
    <PageContainer role='Folios'>
    <div>
        <CustomLabel label="Folios" labelType="b-h1" />
    </div>
    <div className="col-12">
    <Table
          label="Folios"
          isLoading={RequestStatus.success}
          columns={FolioTableColumns}
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

export default Folios
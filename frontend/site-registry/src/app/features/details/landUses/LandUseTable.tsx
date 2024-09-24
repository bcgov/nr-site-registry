import React from 'react'
import Table from '../../../components/table/Table'
import { RequestStatus } from '../../../helpers/requests/status'
import { TableColumn } from '../../../components/table/TableColumn'
import { ApproveRejectButtons } from '../../../components/approve/ApproveReject'

interface ILandUseTable
{
    fetchRequestStatus: RequestStatus.idle | RequestStatus.success | RequestStatus.failed | RequestStatus.pending,
    columns: TableColumn[],
    landUsesData: any,
    approveRejectHandler?: (value:boolean) => void,
    showApproveRejectSection?: boolean
}

const LandUseTable: React.FC<ILandUseTable> = ({
    fetchRequestStatus,
    columns,
    landUsesData,
    approveRejectHandler,
    showApproveRejectSection
}) => {

    showApproveRejectSection= showApproveRejectSection ?? false;

    approveRejectHandler = approveRejectHandler ?? ((value)=>{console.log('Approve/Reject Handler not provided')})

  return (
    <React.Fragment>
    <Table
    label="Search Results"
    isLoading={fetchRequestStatus}
    columns={columns}
    data={landUsesData}
    totalResults={landUsesData.length}
    changeHandler={() => {}}
    editMode={false}
    idColumnName="id"
  />
     {/* {showApproveRejectSection &&   <ApproveRejectButtons
                    approveRejectHandler={approveRejectHandler}
                    />} */}
  </React.Fragment>
  )
}

export default LandUseTable
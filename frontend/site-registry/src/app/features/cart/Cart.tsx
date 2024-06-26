import CustomLabel from "../../components/simple/CustomLabel";
import PageContainer from "../../components/simple/PageContainer";
import Table from "../../components/table/Table";
import { RequestStatus } from "../../helpers/requests/status";
import "./Cart.css";
import { CartTableColumns } from "./CartTableConfig";

import React from "react";

const Cart = () => {
  return (
    <PageContainer role="cart">
      <div>
        <CustomLabel label="Cart" labelType="b-h1" />
      </div>
      <div className="col-12">
          <Table
            label="Search Results"
            isLoading={RequestStatus.success}
            columns={CartTableColumns}
            data={[]}
            totalResults={[].length}
            allowRowsSelect={false}
            showPageOptions={false}
            changeHandler={() => {}}
            editMode={false}
            idColumnName="id"
          />
        </div>
    </PageContainer>
  );
};

export default Cart;

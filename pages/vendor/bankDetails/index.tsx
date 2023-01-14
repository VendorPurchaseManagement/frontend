import {Button, Table} from "antd";
import {NextPage} from "next";
import Router from "next/router";
import {useEffect, useState} from "react";
import DynamicCols from "../../../common/dyamicColumns";
import {getRequest} from "../../../common/network";
import {URLs} from "../../../common/network/URLs";
import useBreadcrumbs from "../../../common/utils/useBreadcrumbs";

const columns: any[] = [
  {
    title: "Acc Number",
    dataIndex: "acc_number",
    key: "acc_number",
  },
  {
    title: "Acc Name",
    dataIndex: "acc_name",
    key: "acc_name",
  },
  {
    title: "Vendor",
    dataIndex: "vendor",
    key: "vendor",
  },
  {
    title: "Bank Name",
    dataIndex: "bank_name",
    key: "bank_name",
  },
  {
    title: "Bank Address",
    dataIndex: "bank_address",
    key: "bank_address",
  },
  {
    title: "Added By",
    dataIndex: "added_by",
    key: "added_by",
  },
];

interface initialStateI {
  columns: any[];
  data: any[];
  drawerOpen: boolean;
  loading: boolean;
}

const initialState: initialStateI = {
  columns: columns,
  data: [],
  drawerOpen: false,
  loading: false,
};

const Vendor: NextPage = () => {
  const setPath = useBreadcrumbs((state) => state.setPath);
  const [state, setState] = useState(initialState);
  useEffect(() => {
    setPath([
      {
        label: "Vendors",
        link: "/vendor",
      },
      {
        label: "Bank Details",
      },
    ]);
    setState((prev) => ({...prev, loading: true}));
    getRequest<any[]>({
      url: URLs.bankDetail,
    })
      .then((res) => {
        console.log(res);

        if (res.data) setState((prev) => ({...prev, data: res.data}));
      })
      .finally(() => {
        setState((prev) => ({...prev, loading: false}));
      });
  }, []);
  return (
    <>
      <div className="flex justify-between">
        <Button
          type="primary"
          onClick={() => Router.push("/vendor/bankDetails/add")}
        >
          Add Bank Details
        </Button>
        <Button
          type="primary"
          onClick={() => setState((prev) => ({...prev, drawerOpen: true}))}
        >
          Customize Table
        </Button>
      </div>
      <Table
        loading={state.loading}
        className="my-4"
        dataSource={state.data}
        rowKey={(row) => row.acc_number}
        columns={state.columns}
        scroll={{x: "max-content"}}
      />
      <DynamicCols
        openCols={state.drawerOpen}
        closeDrawer={() => setState((prev) => ({...prev, drawerOpen: false}))}
        columns={state.columns}
        updateCols={(arr) => setState((prev) => ({...prev, columns: arr}))}
      />
    </>
  );
};

export default Vendor;

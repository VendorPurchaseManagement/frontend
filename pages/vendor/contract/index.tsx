import { Button, Table, Tooltip } from "antd";
import { NextPage } from "next";
import Router from "next/router";
import { useEffect, useState } from "react";
import DynamicCols from "../../../common/dyamicColumns";
import { getRequest } from "../../../common/network";
import { mediaURL, URLs } from "../../../common/network/URLs";
import useBreadcrumbs from "../../../common/utils/useBreadcrumbs";

const columns: any[] = [
  {
    title: "Vendor",
    dataIndex: "vendor",
    key: "vendor",
  },
  {
    title: "From Date",
    dataIndex: "from_date",
    key: "from_date",
  },
  {
    title: "To Date",
    dataIndex: "to_date",
    key: "to_date",
  },
  {
    title: "Remarks",
    dataIndex: "remarks",
    key: "remarks",
  },
  {
    title: "Authorized Signatory",
    dataIndex: "authorized_signatory",
    key: "authorized_signatory",
  },
  {
    title: "Registered E-Mail",
    dataIndex: "registered_email",
    key: "registered_email",
  },
  {
    title: "Added By",
    dataIndex: "added_by",
    key: "added_by",
  },
  {
    title: "Contract",
    dataIndex: "contract",
    key: "contract",
    render: (contract: string | null) => (
      <Tooltip title={contract ? "" : "Not Provided!"}>
        <Button disabled={!contract} href={mediaURL + contract} target="_blank">
          View
        </Button>
      </Tooltip>
    ),
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
        label: "Contract",
      },
    ]);
    setState((prev) => ({ ...prev, loading: true }));
    getRequest<any[]>({
      url: URLs.contract,
    })
      .then((res) => {
        console.log(res);

        if (res.data) setState((prev) => ({ ...prev, data: res.data }));
      })
      .finally(() => {
        setState((prev) => ({ ...prev, loading: false }));
      });
  }, []);
  return (
    <>
      <div className="flex justify-between">
        <Button
          type="primary"
          onClick={() => Router.push("/vendor/contract/add")}
        >
          Add Contract
        </Button>
        <Button
          type="primary"
          onClick={() => setState((prev) => ({ ...prev, drawerOpen: true }))}
        >
          Customize Table
        </Button>
      </div>
      <Table
        loading={state.loading}
        className="my-4"
        dataSource={state.data}
        rowKey={(row) => row.id}
        columns={state.columns}
        scroll={{ x: "max-content" }}
      />
      <DynamicCols
        openCols={state.drawerOpen}
        closeDrawer={() => setState((prev) => ({ ...prev, drawerOpen: false }))}
        columns={state.columns}
        updateCols={(arr) => setState((prev) => ({ ...prev, columns: arr }))}
      />
    </>
  );
};

export default Vendor;

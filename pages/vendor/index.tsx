import { DownloadOutlined } from "@ant-design/icons";
import { Button, Drawer, Table, Tooltip } from "antd";
import tableExport from "antd-table-export";
import { NextPage } from "next";
import Router from "next/router";
import { useEffect, useState } from "react";
import UpdateVendor from "../../common/components/vendor/updateVendor";
import DynamicCols from "../../common/dyamicColumns";
import { deleteRequest, getRequest } from "../../common/network";
import { mediaURL, URLs } from "../../common/network/URLs";
import useBreadcrumbs from "../../common/utils/useBreadcrumbs";

const columns: any[] = [
  {
    title: "Title",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "GST Number",
    dataIndex: "gst_number",
    key: "gst",
    render: (gst: string) => (gst === "" ? "--" : gst),
  },
  {
    title: "Pan Number",
    dataIndex: "pan_number",
    key: "pan",
    render: (pan: string) => (pan === "" ? "--" : pan),
  },
  {
    title: "Contact Person",
    dataIndex: "contact_person",
    key: "contact_person",
    render: (contact_person: string) =>
      contact_person === "" ? "--" : contact_person,
  },
  {
    title: "E-Mail",
    dataIndex: "email",
    key: "email",
    render: (email: string) => (email === "" ? "--" : email),
  },
  {
    title: "Payment Cycle",
    dataIndex: "payment_cycle",
    key: "payment_cycle",
  },
  {
    title: "Location",
    dataIndex: "location",
    key: "location",
  },
  {
    title: "Category",
    dataIndex: "category",
    key: "category",
    render: (categories: { name: string }[]) =>
      categories.map((item, index) => item.name).join(", "),
  },
  {
    title: "Sub-Category",
    dataIndex: "sub_category",
    key: "sub_category",
    render: (sub_category: string) =>
      sub_category === "" ? "--" : sub_category,
  },
  {
    title: "MSME Certified",
    dataIndex: "msme_certified",
    key: "msme_certified",
    render: (msme_certified: boolean) => (msme_certified ? "Yes" : "No"),
  },
  {
    title: "MSME Certificate",
    dataIndex: "msme_certificate",
    key: "msme_certificate",
    render: (msme_certificate: string | null) => (
      <Tooltip title={msme_certificate ? "" : "Not Provided!"}>
        <Button
          disabled={!msme_certificate}
          href={mediaURL + msme_certificate}
          target="_blank"
        >
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
  isEditing: boolean;
  editingId: number;
}

const initialState: initialStateI = {
  columns: columns,
  data: [],
  drawerOpen: false,
  loading: false,
  isEditing: false,
  editingId: -1,
};

const Vendor: NextPage = () => {
  const setPath = useBreadcrumbs((state) => state.setPath);
  const [state, setState] = useState(initialState);
  const getData = () => {
    getRequest<any[]>({
      url: URLs.vendor,
    })
      .then((res) => {
        if (res.data) setState((prev) => ({ ...prev, data: res.data }));
      })
      .finally(() => {
        setState((prev) => ({ ...prev, loading: false }));
      });
  };
  useEffect(() => {
    setPath([
      {
        label: "Vendors",
      },
    ]);
    setState((prev) => ({ ...prev, loading: true }));
    getData();
  }, []);
  return (
    <>
      <div className="flex justify-between">
        <Button type="primary" onClick={() => Router.push("/vendor/add")}>
          Add Vendor
        </Button>
        <div className="flex">
          <Button
            type="primary"
            onClick={() => setState((prev) => ({ ...prev, drawerOpen: true }))}
          >
            Customize Table
          </Button>
          <Button
            className="!ml-2"
            icon={<DownloadOutlined />}
            onClick={() => {
              const exportInstance = new tableExport(state.data, state.columns);
              exportInstance.download("Vendors", "xlsx");
            }}
          />
        </div>
      </div>
      <Table
        loading={state.loading}
        className="my-4"
        dataSource={state.data}
        rowKey={(row) => row.id}
        columns={[
          {
            title: "Actions",
            key: "actions",
            dataIndex: "id",
            render: (id) => (
              <>
                <Button
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      isEditing: true,
                      editingId: id,
                    }))
                  }
                >
                  Edit
                </Button>
                <Button
                  danger
                  type="primary"
                  className="ml-2"
                  onClick={() => {
                    deleteRequest({
                      url: URLs.vendor,
                      reqData: {
                        vendor: id,
                      },
                    }).then(({ data }) => {
                      if (data) getData();
                    });
                  }}
                >
                  Delete
                </Button>
              </>
            ),
          },
          ...state.columns,
        ]}
        scroll={{ x: "max-content" }}
      />
      <DynamicCols
        openCols={state.drawerOpen}
        closeDrawer={() => setState((prev) => ({ ...prev, drawerOpen: false }))}
        columns={state.columns}
        updateCols={(arr) => setState((prev) => ({ ...prev, columns: arr }))}
      />
      <Drawer
        title="Update Vendor"
        width={"100%"}
        onClose={() =>
          setState((prev) => ({ ...prev, isEditing: false, editingId: -1 }))
        }
        open={state.isEditing}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <UpdateVendor
          id={state.editingId}
          onUpdate={() => {
            getData();
            setState((prev) => ({
              ...prev,
              isEditing: false,
              editingId: -1,
            }));
          }}
        />
      </Drawer>
    </>
  );
};

export default Vendor;

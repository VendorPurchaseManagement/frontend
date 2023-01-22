import {DownloadOutlined} from "@ant-design/icons";
import {Button, Table} from "antd";
import tableExport from "antd-table-export";
import {NextPage} from "next";
import Router from "next/router";
import {useEffect, useState} from "react";
import DynamicCols from "../../../common/dyamicColumns";
import {deleteRequest, getRequest} from "../../../common/network";
import {URLs} from "../../../common/network/URLs";
import useBreadcrumbs from "../../../common/utils/useBreadcrumbs";
export const columns: any[] = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
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

const Category: NextPage = () => {
  const setPath = useBreadcrumbs((state) => state.setPath);
  const [state, setState] = useState(initialState);
  const getData = () => {
    setState((prev) => ({...prev, loading: true}));
    getRequest<any[]>({
      url: URLs.category,
    })
      .then((res) => {
        console.log(res);

        if (res.data) setState((prev) => ({...prev, data: res.data}));
      })
      .finally(() => {
        setState((prev) => ({...prev, loading: false}));
      });
  };
  useEffect(() => {
    setPath([
      {
        label: "Master",
      },
      {
        label: "Category",
      },
    ]);
    getData();
  }, []);
  return (
    <>
      <div className="flex justify-between">
        <Button
          type="primary"
          onClick={() => Router.push("/master/category/add")}
        >
          Add Category
        </Button>

        <Button
          type="primary"
          onClick={() => setState((prev) => ({...prev, drawerOpen: true}))}
        >
          Customize Table
        </Button>
        <div className="flex">
          <Button
            icon={<DownloadOutlined />}
            onClick={() => {
              const exportInstance = new tableExport(
                state.data,
                state.columns.filter((value) => value.key !== "invoice")
              );
              exportInstance.download(`Categories`, "xlsx");
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
            dataIndex: "name",
            render: (name) => (
              <>
                <Button
                  danger
                  type="primary"
                  className="ml-2"
                  onClick={() => {
                    deleteRequest({
                      url: URLs.category,
                      reqData: {
                        category: name,
                      },
                    }).then(({data}) => {
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

export default Category;

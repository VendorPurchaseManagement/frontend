import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Select,
  Tooltip,
  Upload,
  UploadFile,
} from "antd";
import {NextPage} from "next";
import {useEffect, useState} from "react";
import {getRequest, postRequest} from "../../../common/network";
import fileUpload from "../../../common/network/fileUpload";
import {URLs} from "../../../common/network/URLs";
import {SelectWithChildren} from "../../../common/utils/getSelectOptions";
import useBreadcrumbs from "../../../common/utils/useBreadcrumbs";

interface initialStateI {
  vendors: SelectWithChildren[];
  uploadProgress: number;
  contracts: number;
  loading: boolean;
  verification: {
    verified: boolean;
    inProgress: boolean;
  };
}

const initialState: initialStateI = {
  contracts: 0,
  vendors: [],
  uploadProgress: 0,
  loading: false,
  verification: {
    verified: false,
    inProgress: false,
  },
};

const AddBankDetails: NextPage = () => {
  const {useForm, useWatch} = Form;
  const [form] = useForm();
  const [state, setState] = useState(initialState);
  const setPath = useBreadcrumbs((state) => state.setPath);
  const {RangePicker} = DatePicker;
  const {TextArea} = Input;
  const addBankDetails = (values: any) => {
    values = {
      ...values,
      from_date: values.range_date[0].format("YYYY-MM-DD"),
      to_date: values.range_date[1].format("YYYY-MM-DD"),
    };

    setState((prev) => ({...prev, loading: true}));
    postRequest({
      url: URLs.contract,
      reqData: values,
    })
      .then((res) => {
        console.log(res);

        if (res.data) form.resetFields();
      })
      .finally(() => {
        setState((prev) => ({...prev, loading: false}));
      });
  };

  const uploadContract = (uploadedFile: any) => {
    console.log(uploadedFile);
    console.log("hello");

    const {file, onProgress, onSuccess, onError} = uploadedFile;
    const formData = new FormData();
    formData.append("file", file);
    setState((prev) => ({...prev, uploadProgress: 0}));
    fileUpload<{id: number}>({
      formData: formData,
      onUpload: (event) => {
        const progress = Math.round(
          (100 * event.loaded) / (event.total ? event.total : 100)
        );
        setState((prev) => ({
          ...prev,
          uploadProgress: progress,
        }));
        onProgress({percent: progress});
      },
    })
      .then((response) => {
        onSuccess("Ok");
        form.setFieldValue("contract", response.data.id);
      })
      .catch((err) => {
        message.error("An Error has occurred!");
        setState((prev) => ({
          ...prev,
          uploadProgress: 0,
        }));
        onError({err});
      });
  };
  const deleteFile = () => {
    let fileData = new FormData();
    let pk = form.getFieldValue("contract");
    if (pk) {
      fileData.append("id", pk);
    }
    return fileUpload({
      formData: fileData,
      onUpload: () => {},
      isDelete: true,
    }).then(() => {
      setState((prev) => ({
        ...prev,
        uploadProgress: 0,
      }));
      form.resetFields(["contract"]);
    });
  };
  useEffect(() => {
    setPath([
      {
        label: "Vendors",
        link: "/vendor",
      },
      {
        label: "Contract",
        link: "/vendor/contract",
      },
      {
        label: "Add Contract",
      },
    ]);
    getRequest<any[]>({
      url: URLs.vendor,
    }).then((res) => {
      if (res.data)
        setState((prev) => ({
          ...prev,
          vendors: res.data.map((item, index) => ({
            value: item.id,
            label: item.name,
            children: [],
          })),
        }));
      else setState((prev) => ({...prev, vendors: []}));
    });
  }, []);
  return (
    <>
      <Form
        name="addBankDetails"
        labelCol={{span: 6}}
        wrapperCol={{span: 16, offset: 2}}
        form={form}
        onFinish={addBankDetails}
        className="flex items-center flex-col"
        autoComplete="off"
        disabled={state.loading}
      >
        <div className="flex flex-col sm:flex-row w-full justify-between">
          <Form.Item
            wrapperCol={{
              xs: {
                offset: 0,
              },
              md: {
                offset: 2,
              },
            }}
            name="vendor"
            label="Vendor"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[{required: true, message: "Please select a vendor!"}]}
          >
            <Select
              options={state.vendors}
              onChange={() => {
                console.log(form.getFieldValue("vendor"));

                getRequest<any[]>({
                  url: URLs.contract,
                  params: {
                    vendor: form.getFieldValue("vendor"),
                  },
                }).then((res) => {
                  if (res.data)
                    setState((prev) => ({
                      ...prev,
                      contracts: res.data.success
                        ? Number.parseInt(res.data.success)
                        : 0,
                    }));
                  else setState((prev) => ({...prev, contracts: 0}));
                });
              }}
            />
          </Form.Item>
          <Form.Item
            wrapperCol={{
              xs: {
                offset: 0,
              },
              md: {
                offset: 2,
              },
            }}
            label="Existing Contracts"
            className="w-full sm:w-[45%]"
            labelAlign="left"
          >
            <Tooltip title={state.contracts ? "" : "No Active Contracts"}>
              <Button disabled={!state.contracts}>View</Button>
            </Tooltip>
            {/* <Input disabled value={`${state.contracts} active contracts.`} /> */}
          </Form.Item>
        </div>

        <div className="flex flex-col sm:flex-row w-full justify-between">
          <Form.Item
            wrapperCol={{
              xs: {
                offset: 0,
              },
              md: {
                offset: 2,
              },
            }}
            name="range_date"
            label="Contract Range"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[{required: true, message: "Please enter from date!"}]}
          >
            <RangePicker />
          </Form.Item>
          <Form.Item
            wrapperCol={{
              xs: {
                offset: 0,
              },
              md: {
                offset: 2,
              },
            }}
            name="remarks"
            label="Remarks"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[
              {
                required: true,
                message: "Please enter a remark!",
              },
            ]}
          >
            <TextArea autoSize={{maxRows: 4, minRows: 1}} />
          </Form.Item>
        </div>
        <div className="flex flex-col sm:flex-row w-full justify-between">
          <Form.Item
            wrapperCol={{
              xs: {
                offset: 0,
              },
              md: {
                offset: 2,
              },
            }}
            name="contract"
            label="Contract"
            className="w-full sm:w-[45%]"
            labelAlign="left"
          >
            <Upload
              maxCount={1}
              customRequest={uploadContract}
              onRemove={deleteFile}
              onPreview={(file: UploadFile) => {
                if (file.originFileObj)
                  window.open(URL.createObjectURL(file.originFileObj));
              }}
              previewFile={(file: File | Blob) => {
                return Promise.resolve(URL.createObjectURL(file));
              }}
              //   listType={"picture"}
              showUploadList={{
                showPreviewIcon: true,
              }}
            >
              <Button disabled={state.uploadProgress !== 0}>
                Click to Upload
              </Button>
            </Upload>
            <Input type="hidden" />
          </Form.Item>
        </div>

        <Button type="primary" htmlType="submit" loading={state.loading}>
          Submit
        </Button>
      </Form>
    </>
  );
};

export default AddBankDetails;

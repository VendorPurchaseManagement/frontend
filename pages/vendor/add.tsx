import {Button, Form, Input, message, Select, Upload, UploadFile} from "antd";
import {NextPage} from "next";
import {useEffect, useMemo, useState} from "react";
import {postRequest} from "../../common/network";
import fileUpload from "../../common/network/fileUpload";
import {URLs} from "../../common/network/URLs";
import getSelectOptions, {
  SelectWithChildren,
} from "../../common/utils/getSelectOptions";
import useBreadcrumbs from "../../common/utils/useBreadcrumbs";

interface initialStateI {
  locations: SelectWithChildren[];
  paymentCycles: SelectWithChildren[];
  categories: SelectWithChildren[];
  uploadProgress: number;
  loading: boolean;
}

const initialState: initialStateI = {
  locations: [],
  paymentCycles: [],
  categories: [],
  uploadProgress: 0,
  loading: false,
};

const AddVendor: NextPage = () => {
  const {useForm, useWatch} = Form;
  const [form] = useForm();
  const msme_certified = useWatch("msme_certified", form);
  const [state, setState] = useState(initialState);
  const setPath = useBreadcrumbs((state) => state.setPath);
  const msme_certified_options = useMemo(
    () => [
      {
        label: "Yes",
        value: true,
      },
      {
        label: "No",
        value: false,
      },
    ],
    []
  );

  const uploadMSME = (uploadedFile: any) => {
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
        form.setFieldValue("msme_certificate", response.data.id);
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

  const addVendor = (values: object) => {
    console.log(values);

    setState((prev) => ({...prev, loading: true}));
    postRequest({
      url: URLs.vendor,
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

  const deleteFile = () => {
    let fileData = new FormData();
    let pk = form.getFieldValue("msme_certificate");
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
      form.resetFields(["msme_certificate"]);
    });
  };

  useEffect(() => {
    setPath([
      {
        label: "Vendors",
        link: "/vendor",
      },
      {
        label: "Add Vendor",
      },
    ]);
    getSelectOptions("category").then((data) => {
      setState((prev) => ({...prev, categories: data}));
    });
    getSelectOptions("location").then((data) => {
      setState((prev) => ({...prev, locations: data}));
    });
    getSelectOptions("payment_cycle").then((data) => {
      setState((prev) => ({...prev, paymentCycles: data}));
    });
  }, []);
  return (
    <>
      <Form
        name="addVendor"
        labelCol={{span: 6}}
        wrapperCol={{span: 16, offset: 2}}
        form={form}
        onFinish={addVendor}
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
            name="name"
            label="Name"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[{required: true, message: "Please select a vendor name!"}]}
          >
            <Input />
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
            name="location"
            label="Location"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[
              {required: true, message: "Please select a vendor location!"},
            ]}
          >
            <Select options={state.locations} />
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
            name="category"
            label="Category"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[
              {required: true, message: "Please select a vendor category!"},
            ]}
          >
            <Select mode="multiple" className="" options={state.categories} />
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
            name="pan_number"
            label="Pan Number"
            className="w-full sm:w-[45%]"
            labelAlign="left"
          >
            <Input />
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
            name="gst_number"
            label="GST Number"
            className="w-full sm:w-[45%]"
            labelAlign="left"
          >
            <Input />
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
            name="payment_cycle"
            label="Payment Cycle"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[
              {
                required: true,
                message: "Please select a vendor payment cycle!",
              },
            ]}
          >
            <Select options={state.paymentCycles} />
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
            name="msme_certified"
            label="MSME Certified"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[{required: true, message: "Please select an option!"}]}
          >
            <Select options={msme_certified_options} />
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
            name="msme_certificate"
            label="MSME Certificate"
            className="w-full sm:w-[45%]"
            labelAlign="left"
          >
            <Upload
              maxCount={1}
              customRequest={uploadMSME}
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
              <Button disabled={!msme_certified || state.uploadProgress !== 0}>
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

export default AddVendor;

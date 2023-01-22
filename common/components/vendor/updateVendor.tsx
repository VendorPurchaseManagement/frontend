import {DeleteOutlined, EyeOutlined} from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  message,
  Select,
  Tooltip,
  Upload,
  UploadFile,
} from "antd";
import {useEffect, useMemo, useState} from "react";
import {
  initialState as vendorState,
  initialStateI as vendorI,
} from "../../../pages/vendor/add";
import {deleteRequest, getRequest, putRequest} from "../../network";
import fileUpload from "../../network/fileUpload";
import {mediaURL, URLs} from "../../network/URLs";
import getSelectOptions from "../../utils/getSelectOptions";
import {componentDataI, updateComponentI} from "../utility";

type initialStateI = vendorI & {
  uploaded_msme: string | null;
};

const initialState: initialStateI = {
  ...vendorState,
  uploaded_msme: null,
};

const {useForm, useWatch} = Form;

const UpdateVendor = ({id, onUpdate}: updateComponentI) => {
  const [state, setState] = useState<initialStateI>(initialState);
  const [form] = useForm();
  const msme_certified = useWatch("msme_certified", form);
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

  const updateVendor = (values: object) => {
    console.log(values);

    setState((prev) => ({...prev, loading: true}));
    putRequest({
      url: URLs.vendor,
      reqData: {...values, vendor: id},
    })
      .then((res) => {
        console.log(res);

        if (res.data) {
          form.resetFields();
          onUpdate();
        }
      })
      .finally(() => {
        setState((prev) => ({...prev, loading: false}));
      });
  };

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
    setState((prev) => ({...prev, loading: true}));
    getRequest<componentDataI>({
      url: URLs.vendor,
      params: {
        request_type: "get_details",
        vendor: id,
      },
    }).then(({data}) => {
      if (data) {
        form.setFieldsValue({
          ...data,
          msme_certificate: null,
        });
        setState((prev) => ({
          ...prev,
          uploaded_msme: data.msme_certificate
            ? `${data.msme_certificate}`
            : null,
        }));
      }

      console.log(form.getFieldValue("uploaded_msme"));

      setState((prev) => ({...prev, loading: false}));
    });
    getSelectOptions("category").then((data) => {
      setState((prev) => ({...prev, categories: data}));
    });
    getSelectOptions("location").then((data) => {
      setState((prev) => ({...prev, locations: data}));
    });
    getSelectOptions("payment_cycle").then((data) => {
      setState((prev) => ({...prev, paymentCycles: data}));
    });
  }, [id]);
  return (
    <>
      <Form
        name="addVendor"
        labelCol={{span: 6}}
        wrapperCol={{span: 16, offset: 2}}
        form={form}
        onFinish={updateVendor}
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
            <div className="flex justify-between">
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
                showUploadList={{
                  showPreviewIcon: true,
                }}
              >
                <Button
                  disabled={!msme_certified || state.uploadProgress !== 0}
                >
                  Click to Upload
                </Button>
              </Upload>
              <Input type="hidden" />
              <div className="flex gap-x-2">
                <Tooltip title="View Previous MSME Certificate">
                  <Button
                    type="primary"
                    disabled={!state.uploaded_msme}
                    icon={<EyeOutlined />}
                    onClick={() =>
                      window.open(mediaURL + state.uploaded_msme, "_blank")
                    }
                    className="!flex items-center justify-center"
                  />
                </Tooltip>
                <Tooltip title="Delete Previous MSME Certificate">
                  <Button
                    danger
                    type="primary"
                    disabled={!state.uploaded_msme}
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      deleteRequest({
                        url: URLs.vendor,
                        reqData: {
                          request_type: "delete_msme",
                          vendor: id,
                        },
                      }).then(({data}) => {
                        if (data)
                          setState((prev) => ({
                            ...prev,
                            uploaded_msme: null,
                          }));
                      });
                    }}
                    className="!flex items-center justify-center"
                  />
                </Tooltip>
              </div>
            </div>
          </Form.Item>
        </div>

        <Button type="primary" htmlType="submit" loading={state.loading}>
          Update
        </Button>
      </Form>
    </>
  );
};

export default UpdateVendor;

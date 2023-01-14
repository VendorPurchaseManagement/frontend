import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Upload,
  UploadFile,
} from "antd";
import {NextPage} from "next";
import {useEffect, useMemo, useState} from "react";
import {getRequest, postRequest} from "../../common/network";
import fileUpload from "../../common/network/fileUpload";
import {URLs} from "../../common/network/URLs";
import getSelectOptions, {
  SelectWithChildren,
} from "../../common/utils/getSelectOptions";
import useBreadcrumbs from "../../common/utils/useBreadcrumbs";

interface initialStateI {
  categories: SelectWithChildren[];
  banks: SelectWithChildren[];
  vendors: SelectWithChildren[];
  mode: SelectWithChildren[];
  uploadProgress: number;
  loading: boolean;
}

const initialState: initialStateI = {
  categories: [],
  banks: [],
  vendors: [],
  mode: [],
  uploadProgress: 0,
  loading: false,
};

const AddPurchase: NextPage = () => {
  const {useForm, useWatch} = Form;
  const {TextArea} = Input;
  const [form] = useForm();
  const inv_amount = useWatch("inv_amount", form);
  const gst_perc = useWatch("gst_perc", form);
  const payment_status = useWatch("payment_status", form);
  const [state, setState] = useState(initialState);
  const setPath = useBreadcrumbs((state) => state.setPath);
  const payment_status_options = useMemo(
    () => [
      {
        label: "Done",
        value: true,
      },
      {
        label: "Pending",
        value: false,
      },
    ],
    []
  );

  const uploadInvoice = (uploadedFile: any) => {
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

  const addPurchase = (values: any) => {
    console.log(values);
    values = {
      ...values,
      inv_date: values.inv_date.format("YYYY-MM-DD"),
      payment_date: values.payment_date
        ? values.payment_date.format("YYYY-MM-DD")
        : null,
    };
    console.log(values);

    setState((prev) => ({...prev, loading: true}));
    postRequest({
      url: URLs.purchase,
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
        label: "Purchase",
        link: "/purchase",
      },
      {
        label: "Add Purchase",
      },
    ]);
    getSelectOptions("mode").then((data) => {
      setState((prev) => ({...prev, mode: data}));
    });
    getRequest<any[]>({
      url: URLs.vendor,
    }).then((res) => {
      if (res.data)
        setState((prev) => ({
          ...prev,
          vendors: res.data.map((item) => ({
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
        name="addPurchase"
        labelCol={{span: 6}}
        wrapperCol={{span: 16, offset: 2}}
        form={form}
        onFinish={addPurchase}
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
                form.resetFields(["category", "bank"]);
                getSelectOptions("category", form.getFieldValue("vendor")).then(
                  (data) => {
                    setState((prev) => ({...prev, categories: data}));
                  }
                );

                getRequest<any[]>({
                  url: URLs.bankDetail,
                  params: {
                    vendor: form.getFieldValue("vendor"),
                  },
                }).then((res) => {
                  if (res.data)
                    setState((prev) => ({
                      ...prev,
                      banks: res.data.map((item) => ({
                        value: item.acc_number,
                        label: item.acc_name,
                        children: [],
                      })),
                    }));
                  else setState((prev) => ({...prev, banks: []}));
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
            name="category"
            label="Category"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[
              {required: true, message: "Please select a vendor category!"},
            ]}
          >
            <Select options={state.categories} />
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
            name="po"
            label="PO"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[{required: true, message: "Please enter PO!"}]}
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
            name="remarks"
            label="Remarks"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[{required: true, message: "Please enter Remarks!"}]}
          >
            <TextArea autoSize={{minRows: 1, maxRows: 3}} />
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
            name="inv_number"
            label="Invoice Number"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[{required: true, message: "Please enter Invoice Number!"}]}
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
            name="inv_date"
            label="Invoice Date"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[{required: true, message: "Please select a invoice date!"}]}
          >
            <DatePicker className="!w-full" />
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
            name="inv_amount"
            label="Invoice Amount"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[
              {required: true, message: "Please select a invoice amount!"},
            ]}
          >
            <InputNumber min={0} />
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
            name="gst_perc"
            label="GST %"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required
            rules={[
              {
                required: true,
                message: "Please enter GST %!",
              },
            ]}
          >
            <InputNumber min={0} />
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
            name="invoice"
            label="Invoice"
            className="w-full sm:w-[45%]"
            labelAlign="left"
          >
            <Upload
              maxCount={1}
              customRequest={uploadInvoice}
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
              <Button disabled={state.uploadProgress !== 0}>
                Click to Upload
              </Button>
            </Upload>
            <Input type="hidden" />
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
            label="Final Amount"
            className="w-full sm:w-[45%]"
            labelAlign="left"
          >
            <Input
              disabled
              value={
                inv_amount && gst_perc !== undefined
                  ? inv_amount + inv_amount * (gst_perc / 100)
                  : "-"
              }
            />
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
            name="payment_status"
            label="Payment Status"
            className="w-full sm:w-[45%]"
            labelAlign="left"
          >
            <Select
              options={payment_status_options}
              onChange={() => {
                form.resetFields([
                  "payment_date",
                  "payment_amount",
                  "payment_remarks",
                  "mode",
                  "bank",
                ]);
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
            name="payment_date"
            label="Payment Date"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required={payment_status}
            rules={[
              {
                required: payment_status,
                message: "Please select a payment date!",
              },
            ]}
          >
            <DatePicker className="!w-full" disabled={!payment_status} />
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
            name="payment_amount"
            label="Payment Amount"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required={payment_status}
            rules={[
              {
                required: payment_status,
                message: "Please select a payment amount!",
              },
            ]}
          >
            <Input disabled={!payment_status} />
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
            name="payment_remarks"
            label="Payment Remarks"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required={payment_status}
            rules={[
              {
                required: payment_status,
                message: "Please enter a payment remarks!",
              },
            ]}
          >
            <Input disabled={!payment_status} />
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
            name="mode"
            label="Mode"
            className="w-full sm:w-[45%]"
            labelAlign="left"
            required={payment_status}
            rules={[
              {
                required: payment_status,
                message: "Please select a payment mode!",
              },
            ]}
          >
            <Select options={state.mode} disabled={!payment_status} />
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
            name="bank"
            label="Bank"
            className="w-full sm:w-[45%]"
            labelAlign="left"
          >
            <Select options={state.banks} disabled={!payment_status} />
          </Form.Item>
        </div>
        <Button type="primary" htmlType="submit" loading={state.loading}>
          Submit
        </Button>
      </Form>
    </>
  );
};

export default AddPurchase;

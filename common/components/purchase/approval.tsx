import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Tooltip,
  Upload,
  UploadFile,
} from "antd";
import { useEffect, useState } from "react";
import { postRequest } from "../../network";
import fileUpload from "../../network/fileUpload";
import { mediaURL, URLs } from "../../network/URLs";
import getSelectOptions, {
  SelectWithChildren,
} from "../../utils/getSelectOptions";
import dayjs from "dayjs";

interface viewProps {
  data: any;
}

interface defaultProps {
  data?: never;
}

type ApprovalRequestProps = viewProps | defaultProps;

interface initialStateInterface {
  loading: boolean;
  location: SelectWithChildren[];
  uploadProgress: number;
}

const { useForm } = Form;

const initialState: initialStateInterface = {
  loading: false,
  location: [],
  uploadProgress: 0,
};

const expenseTypeOptions: SelectWithChildren[] = [
  "Travel",
  "Rental",
  "Pantry",
  "Stationary",
  "Medicine",
  "CEO Expenses",
  "Running & Maintainance",
  "Courier & Logistics",
].map((each) => ({
  label: each,
  value: each.replaceAll("&", "and").toLocaleLowerCase().split(" ").join("_"),
  children: [],
}));

const ApprovalRequest = ({ data }: ApprovalRequestProps) => {
  const [state, setState] = useState(initialState);
  const [form] = useForm();
  console.log(data);
  useEffect(() => {
    getSelectOptions("location").then((data) =>
      setState((prev) => ({ ...prev, location: data }))
    );
  }, []);

  useEffect(() => {
    form.resetFields();
    if (data)
      form.setFieldsValue({
        ...data,
        date: dayjs(data.date),
      });
  }, [data]);

  const uploadAttachment = (uploadedFile: any) => {
    console.log(uploadedFile);
    console.log("hello");

    const { file, onProgress, onSuccess, onError } = uploadedFile;
    const formData = new FormData();
    formData.append("file", file);
    setState((prev) => ({ ...prev, uploadProgress: 0 }));
    fileUpload<{ id: number }>({
      formData: formData,
      onUpload: (event) => {
        const progress = Math.round(
          (100 * event.loaded) / (event.total ? event.total : 100)
        );
        setState((prev) => ({
          ...prev,
          uploadProgress: progress,
        }));
        onProgress({ percent: progress });
      },
    })
      .then((response) => {
        onSuccess("Ok");
        form.setFieldValue("attachment", response.data.id);
      })
      .catch((err) => {
        message.error("An Error has occurred!");
        setState((prev) => ({
          ...prev,
          uploadProgress: 0,
        }));
        onError({ err });
      });
  };
  const deleteFile = () => {
    let fileData = new FormData();
    let pk = form.getFieldValue("attachment");
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
      form.resetFields(["attachment"]);
    });
  };

  const addRequest = (values: any) => {
    console.log(values);
    values = {
      ...values,
      date: values.date ? values.date.format("YYYY-MM-DD") : null,
    };
    setState((prev) => ({ ...prev, loading: true }));
    postRequest({
      url: URLs.approval,
      reqData: values,
    })
      .then((res) => {
        console.log(res);

        if (res.data) form.resetFields();
      })
      .finally(() => {
        setState((prev) => ({ ...prev, loading: false }));
      });
  };

  return (
    <Form
      name="addApproval"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16, offset: 2 }}
      form={form}
      onFinish={addRequest}
      className="flex items-center flex-col"
      autoComplete="off"
      disabled={state.loading || data}
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
          name="date"
          label="Requested Date"
          className="w-full sm:w-[45%]"
          labelAlign="left"
          required
          rules={[{ required: true, message: "Please input a date!" }]}
        >
          <DatePicker className="!w-full" />
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
          name="emp_name"
          label="Reqester Employee Name"
          className="w-full sm:w-[45%]"
          labelAlign="left"
          required
          rules={[{ required: true, message: "Please input a employee name!" }]}
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
          name="team"
          label="Team"
          className="w-full sm:w-[45%]"
          labelAlign="left"
          required
          rules={[{ required: true, message: "Please input a team name!" }]}
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
          rules={[{ required: true, message: "Please select a location!" }]}
        >
          <Select options={state.location} />
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
          name="expense_type"
          label="Expense Type"
          className="w-full sm:w-[45%]"
          labelAlign="left"
          required
          rules={[{ required: true, message: "Please input a team name!" }]}
        >
          <Select options={expenseTypeOptions} />
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
          name="total_amount"
          label="Total Amount(est.)"
          className="w-full sm:w-[45%]"
          labelAlign="left"
          required
          rules={[
            { required: true, message: "Please enter approx total amount!" },
          ]}
        >
          <InputNumber className="!w-full" min={0} />
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
          name="attachment"
          label="Attachment"
          className="w-full sm:w-[45%]"
          labelAlign="left"
        >
          {data ? (
            <Tooltip title={data.attachment ? "" : "Not Provided!"}>
              <Button
                disabled={!data.attachment}
                href={mediaURL + data.attachment}
                target="_blank"
              >
                View Attachment
              </Button>
            </Tooltip>
          ) : (
            <>
              <Upload
                maxCount={1}
                customRequest={uploadAttachment}
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
            </>
          )}
        </Form.Item>
      </div>
      {!data && (
        <Button type="primary" htmlType="submit" loading={state.loading}>
          Submit
        </Button>
      )}
    </Form>
  );
};

export default ApprovalRequest;

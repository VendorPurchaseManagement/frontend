import {AxiosProgressEvent} from "axios";
import {client} from "./index";
import {URLs} from "./URLs";

interface fileUploadI {
  formData: object;
  onUpload: (event: AxiosProgressEvent) => void;
  isDelete?: boolean;
}

const fileUpload = ({formData, onUpload, isDelete = false}: fileUploadI) => {
  return client({
    method: isDelete ? "DELETE" : "POST",
    url: URLs.upload,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: formData,
    onUploadProgress: onUpload,
  });
};

export default fileUpload;

import React, { useState } from "react";
import { uploadFiles } from "../store/features/Auth/Auth";
import { toast } from "material-react-toastify";

const documentsTypes = [
  {
    name: "Register_of_commerce",
    type: "register-of-commerce",
    uploaded: false,
  },
  {
    name: "Articles_of_association",
    type: "article-of-association",
    uploaded: false,
  },
  {
    name: "Beneficiary_owner",
    type: "beneficiary-owners-id-document",
    uploaded: false,
  },
  {
    name: "Directors_IDs",
    type: "directors-id-document",
    uploaded: false,
  },
  {
    name: "Proof_of_address",
    type: "proof-of-address",
    uploaded: false,
  },
];

const FileUploadComp: React.FC<any> = ({ company_id, t }) => {
  const [documents, setDocuments] = useState(documentsTypes);
  const [activeIndex, setActiveIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);

  const selectDocument = (index: number) => {
    setActiveIndex(index);
  };

  const upload = (event: any) => {
    const files = Object.values(event.target.files);
    if (files.length > 0) {
      files.map((selectedFile: any) => {
        const size = selectedFile.size;

        if (size < 5000000) {
          const formData = new FormData();
          formData.append("file", selectedFile, selectedFile.name);
          formData.append("type", documents[activeIndex].type);
          setUploading(true);
          uploadFiles(formData, company_id)
            .then((res) => {
              setUploading(false);
              const all = [...documents];
              all[activeIndex].uploaded = true;
              setDocuments(all);
            })
            .catch((error) => {
              setUploading(false);
              setError(error?.data?.message);
            });
        } else {
          toast.error(t("file_to_large"));
        }
      });
    }
  };

  return (
    <div className="border rounded mt-4">
      <div className="row">
        <div className="col-md-4 p-0">
          <ul className="divide-y divide-gray-300">
            {documents.map((type: any, index: number) => (
              <li
                className="p-4 hover:bg-gray-50 cursor-pointer"
                key={index}
                onClick={() => selectDocument(index)}
                style={{
                  backgroundColor: index === activeIndex ? "#eee" : "#fff",
                }}
              >
                <i
                  className="fa fa-file-pdf-o text-gray-200 200 p-2 rounded-full font-bold"
                  style={{
                    backgroundColor: type.uploaded
                      ? "rgba(150, 232, 74, 0.32)"
                      : " rgba(0, 0, 0, 0.32)",
                    color: type.uploaded ? "green" : "#fff",
                  }}
                ></i>
                <small>{t(type.name)}</small>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-md-8 bg-gray-200 p-6">
          <p>
            <b>
              {t("upload")} {t(documents[activeIndex].name)}
            </b>
          </p>
          <small>{t("select_files")}...</small>
          <hr className="mt-3 mbt-3" />
          {documents[activeIndex].uploaded ? (
            <div className="flex flex-col justify-center items-center p-6">
              <i
                className="fa fa-check-circle text-green-500 mb-3 mt-3"
                style={{ fontSize: 70 }}
                aria-hidden="true"
              ></i>
              <small>
                <b>
                  {t(documents[activeIndex].name)} {t("uploaded_successfully")}.
                </b>
              </small>
            </div>
          ) : (
            <div>
              <div className="border border-dashed border-gray-500 relative">
                {uploading ? (
                  <>
                    <div className="flex justify-center items-center">
                      <img src="./uploading.gif" style={{ height: 230 }} />
                    </div>
                  </>
                ) : (
                  <>
                    <input
                      type="file"
                      className="cursor-pointer relative block opacity-0 w-full h-full p-20 z-50"
                      onChange={upload}
                      accept="image/png, image/jpeg, application/pdf"
                      multiple
                    />
                    <div className="text-center p-10 absolute top-0 right-0 left-0 m-auto">
                      <h4>
                        {t("Drop_file_to_upload")}
                        <br />
                        {t("or")}
                      </h4>
                      <p
                        style={{ color: "rgb(3, 115, 117)" }}
                        className="font-bold"
                      >
                        {t("select_files")}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadComp;

import React from "react";
interface Props {
  body: any;
  t: any;
}

const StatusComp: React.FC<Props> = ({ body, t }) => {
  return (
    <>
      {body.map((status: any, index: number) => {
        return (
          <div className="flex flex-row border-1 border-white py-1">
            <div style={{ width: "30%", textAlign: "right", paddingRight: 20 }}>
              <small>
                <b>{status.datetime}</b>
              </small>
            </div>
            <div
              className="border-blue-400 border-l-4 px-2"
              style={{ borderLeftColor: "rgb(3, 115, 117)", width: "70%" }}
            >
              <small>
                {t(
                  status.message
                    .trim()
                    .toLowerCase()
                    .replaceAll(" ", "_")
                    .replaceAll(".", "")
                )}
              </small>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default StatusComp;

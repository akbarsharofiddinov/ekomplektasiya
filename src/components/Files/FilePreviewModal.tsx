import React from "react";
import { Modal, Button } from "antd";
import FilePreviewer from "./FilePreviewer";

type Props = {
  open: boolean;
  file: File | null;
  onClose: () => void;
  onDownload?: () => void;
};

const FilePreviewModal: React.FC<Props> = ({ open, file, onClose, onDownload }) => {
  return (
    <Modal
      title={file?.name || "Preview"}
      open={open}
      onCancel={onClose}
      width="85vw"
      styles={{ body: { height: "84vh", padding: 0 } }}
      style={{ top: 10 }}
      footer={[
        <Button key="download" type="primary" onClick={onDownload} disabled={!file}>
          Yuklab olish
        </Button>,
        <Button key="close" onClick={onClose}>Yopish</Button>,
      ]}
    >
      {file ? (
        <div style={{ height: "100%" }}>
          <FilePreviewer file={file} />
        </div>
      ) : (
        <div style={{ padding: 16 }}>Fayl tanlanmagan.</div>
      )}
    </Modal>
  );
};

export default FilePreviewModal;

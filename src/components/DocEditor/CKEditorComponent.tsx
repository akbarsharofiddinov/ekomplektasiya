import React, { useEffect, useRef, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useAppDispatch, useAppSelector } from "@/store/hooks/hooks";
import { setHtmlContent } from "@/store/infoSlice/infoSlice";
import { axiosAPI } from "@/services/axiosAPI";

type Props = {
    apiUrl?: string;
};

const CKEditorComponent: React.FC<Props> = ({
    apiUrl = "https://ekomplektasiya.uz/ekomplektasiya_backend/hs/write-offs/80ba33b4-a1d4-11f0-adb6-244bfe93ba23/invoice",
}) => {
    const dispatch = useAppDispatch();
    const { htmlContent } = useAppSelector((state) => state.info);

    const editorRef = useRef<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // === 1. API’dan HTML olish ===
    useEffect(() => {
        const getHTMLContent = async () => {
            try {
                const response = await axiosAPI.get(apiUrl);
                if (response.status === 200) {
                    const data = response.data;
                    // ⚠️ Backend'dan kelgan obyektni tekshir (data.contect yoki data.content)
                    const html = data.contect;
                    dispatch(setHtmlContent(html));
                } else {
                    console.error("Failed to fetch HTML content");
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        getHTMLContent();
    }, [apiUrl]);

    // === 2. Editor HTML o‘zgarsa Redux’ga yozamiz ===
    const handleEditorChange = (_event: any, editor: any) => {
        const data = editor.getData();
        dispatch(setHtmlContent(data.contect));
    };

    return (
        <div>
            {loading ? (
                <div>Yuklanmoqda...</div>
            ) : (
                <CKEditor
                    editor={ClassicEditor}
                    data={htmlContent}
                    onInit={(editor) => {
                        editorRef.current = editor;
                    }}
                    onChange={handleEditorChange}
                    config={{
                        toolbar: [
                            "heading",
                            "|",
                            "bold",
                            "italic",
                            "link",
                            "bulletedList",
                            "numberedList",
                            "|",
                            "outdent",
                            "indent",
                            "|",
                            "blockQuote",
                            "insertTable",
                            "undo",
                            "redo",
                            "|",
                            "imageUpload",
                            "mediaEmbed",
                        ],
                        table: {
                            contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
                        },
                        mediaEmbed: {
                            previewsInData: true,
                        },
                    }}
                />
            )}
        </div>
    );
};

export default CKEditorComponent;  
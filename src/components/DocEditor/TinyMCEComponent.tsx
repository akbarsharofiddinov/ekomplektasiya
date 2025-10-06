import React from 'react'
import { Editor } from '@tinymce/tinymce-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks';
import { setHtmlContent } from '@/store/infoSlice/infoSlice';
import { axiosAPI } from '@/services/axiosAPI';

const TinyMCEComponent: React.FC = () => {
  const dispatch = useAppDispatch()
  const { htmlContent } = useAppSelector(state => state.info)

  React.useEffect(() => {
    const getHTMLContent = async () => {
      try {
        const response = await axiosAPI.get('https://ekomplektasiya.uz/ekomplektasiya_backend/hs/write-offs/80ba33b4-a1d4-11f0-adb6-244bfe93ba23/invoice');
        if (response.status === 200) {
          const data = await response.data;
          dispatch(setHtmlContent(data.contect))
        } else {
          console.error("Failed to fetch HTML content");
        }
      } catch (error) {
        console.error(error);
      }
    };

    getHTMLContent();
  }, []);

  return (
    <>
      <Editor
        apiKey={"w5r7itiyjj0lexjq5qk5mum8isb823emihupu6mg7p11w6s2"}
        initialValue={htmlContent}
        init={{
          height: 600,
          menubar: true,
          plugins:
            "advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table paste help wordcount",
          toolbar:
            "undo redo | formatselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | code | fullscreen | preview | help",
          paste_data_images: true,
          // any other TinyMCE options...
        }}
        onEditorChange={(newHtml) => dispatch(setHtmlContent(newHtml))}
      />
    </>
  )
}

export default TinyMCEComponent
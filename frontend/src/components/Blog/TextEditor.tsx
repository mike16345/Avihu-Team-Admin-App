import { useRef, useEffect, FC } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const formats = [
  "font",
  "size",
  "color",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "align",
];

interface TextEditorProps {
  content: string;
  onChange: (value: string) => void;
}

const TextEditor: FC<TextEditorProps> = ({ content, onChange }) => {
  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    if (!quillRef.current) return;

    const editor = quillRef.current.getEditor();
    editor.format("align", "right");
  }, [quillRef]);

  return (
    <ReactQuill
      id="editor"
      ref={quillRef}
      value={content}
      modules={{
        toolbar: [
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
          ["link"],
          ["clean"],
          [{ align: "" }, { align: "center" }, { align: "right" }, { align: "justify" }],
        ],
      }}
      formats={formats}
      className="flex-1 "
      onChange={onChange}
    />
  );
};

export default TextEditor;

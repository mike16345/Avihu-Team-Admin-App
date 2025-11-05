import React, { useEffect, useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const formats: ReactQuill.ReactQuillProps["formats"] = [
  "font",
  "size",
  "color",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "indent",
  "link",
  "align",
  "direction",
];

const modules: ReactQuill.ReactQuillProps["modules"] = {
  toolbar: [
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }, { align: [] }],
    ["link", "clean"],
  ],
};

const TextEditor: React.FC<ReactQuill.ReactQuillProps> = (props) => {
  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    editor.format("direction", "rtl");
    editor.format("align", "right");
  }, []);

  return (
    <ReactQuill
      id="editor"
      ref={quillRef}
      theme="snow"
      modules={modules}
      formats={formats}
      className="flex-1"
      {...props}
    />
  );
};

export default TextEditor;

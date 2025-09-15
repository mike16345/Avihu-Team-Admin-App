import React, { useEffect, useRef } from "react";
import ReactQuill from "react-quill-new";

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

const TextEditor: React.FC<ReactQuill.ReactQuillProps> = (props) => {
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
      {...props}
    />
  );
};

export default TextEditor;

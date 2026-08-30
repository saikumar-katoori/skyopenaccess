import { Editor } from "@tinymce/tinymce-react";

export const RichTextEditor = ({ value, onChange, placeholder = "Start typing..." }) => (
  <div className="rte-shell">
    <Editor
      apiKey="xvdhin5hm54steqpolucvg2aum3j1uqcxch9g2y22uhtpqcm"
      value={value}
      onEditorChange={(content) => onChange(content)}
      init={{
        height: 280,
        menubar: "file edit view insert format tools table help",
        toolbar:
          "undo redo | blocks | bold italic underline | alignleft aligncenter alignright | " +
          "bullist numlist outdent indent | removeformat | help",
        placeholder,
        branding: false,
        statusbar: true,
        content_style:
          "body { font-family: 'Space Grotesk', sans-serif; font-size: 16px; line-height: 1.6; }"
      }}
    />
  </div>
);

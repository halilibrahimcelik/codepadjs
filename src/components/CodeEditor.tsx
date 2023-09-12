import Editor from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { useRef } from "react";
import { GridLoader } from "react-spinners";
import prettier from "prettier/standalone";
import babelPlugin from "prettier/plugins/babel";
import estreePlugin from "prettier/plugins/estree";

interface CodeEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
}
const CodeEditor: React.FC<CodeEditorProps> = ({ initialValue, onChange }) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    editor.onDidChangeModelContent(() => {
      onChange(editor.getValue());
    });

    editor.getModel()?.updateOptions({
      tabSize: 1,
    });
  };
  const handleFormat = async () => {
    //unformated code
    const unformated = editorRef?.current?.getValue() as string;

    try {
      //formated code
      const formated = await prettier.format(unformated, {
        parser: "babel",
        plugins: [babelPlugin, estreePlugin],
        useTabs: false,
        semi: true,
        singleQuote: true,
      });

      //set formated code to editor
      editorRef?.current?.setValue(formated);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section className="text-white px-4 sm:px-8 py-2 sm:py-3 dark:bg-primaryBgLight  ">
      <button className="text-orange text-3xl " onClick={handleFormat}>
        Format
      </button>
      <h1 className="text-3xl text-primaryBgDark dark:text-white">Hello</h1>

      <Editor
        theme="vs-dark"
        height={"500px"}
        language="javascript"
        onMount={handleEditorDidMount}
        value={initialValue}
        options={{
          wordWrap: "on",
          minimap: { enabled: false },
          showUnused: false,
          folding: false,
          lineNumbersMinChars: 3,
          fontSize: 16,
          scrollBeyondLastLine: false,
          fontFamily: "Consolas",
          automaticLayout: true,
        }}
        loading={<GridLoader color="#36d7b7" margin={3} />}
      />
    </section>
  );
};

export default CodeEditor;

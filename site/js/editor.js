const textarea = document.getElementById("code")

const editor = CodeMirror.fromTextArea(textarea, {
    lineNumbers: true,
    mode: 'text/x-csrc',
    // extraKeys: {
    //     "Tab": function(cm){
    //         cm.replaceSelection("    " , "end");
    //     }
    // },
    indentUnit: 4,
    indentWithTabs: false,
    foldOptions: {
        rangeFinder: CodeMirror.fold.brace
    },
    foldGutter: true,
    // gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"], // disabled for now
    placeholder: 'Enter your C code here...',
})

editor.setSize(null, "100%");

editor.on("scroll", () => {
    stepLineSet(dbg_lineNo)
})

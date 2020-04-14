import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import MonacoEditor from 'react-monaco-editor';
import debouncer from '../../core/debounce';
import { useResize } from '../../core/hooks';

const editorOptions = {
  selectOnLineNumbers: true,
  tabSize: 2,
};

function skipUpdate(prev, now) {
  if (now.skipCodeUpdate) {
    return true;
  }
  return false;
}

const EditorArea = React.memo(({ code, onCodeChange }) => {
  const codeEditor = React.useRef();
  const container = React.useRef();
  const codeDebouncer = React.useRef();

  React.useEffect(() => {
    codeDebouncer.current = debouncer(onCodeChange, 200);
  }, [onCodeChange]);

  React.useEffect(() => {
    if (code && codeEditor && codeEditor.current) {
      codeEditor.current.setPosition({ lineNumber: 0, column: 0 });
      codeEditor.current.focus();
    }
  }, [code, codeEditor]);

  const handleCodeChange = React.useCallback(
    newCode => {
      codeDebouncer.current(newCode);
    },
    [codeDebouncer]
  );

  const codeEditorMounted = editor => {
    codeEditor.current = editor;
  };

  const layoutEditorCallback = React.useCallback(
    dimension => {
      if (codeEditor && codeEditor.current) {
        codeEditor.current.layout(dimension);
      }
    },
    [codeEditor]
  );

  useResize(container, layoutEditorCallback);

  return (
    <Box width="100%" height="100%" ref={container}>
      <MonacoEditor
        language="javascript"
        theme="vs-dark"
        value={code}
        options={editorOptions}
        onChange={handleCodeChange}
        editorDidMount={codeEditorMounted}
      />
    </Box>
  );
}, skipUpdate);

EditorArea.defaultProps = {
  skipCodeUpdate: false,
  onCodeChange: () => {},
};

EditorArea.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  skipCodeUpdate: PropTypes.bool,
  code: PropTypes.string.isRequired,
  onCodeChange: PropTypes.func,
};

export default EditorArea;

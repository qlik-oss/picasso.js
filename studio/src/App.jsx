import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ExampleList from './components/ExampleList/ExampleList';
import CodeArea from './components/CodeArea/CodeArea';
import examples from './examples';
import localRepo from './core/local-repo';

const useClasses = makeStyles({
  list: {
    width: '200px',
    overflow: 'hidden',
  },
  code: {
    overflow: 'hidden',
  },
});

const App = ({ location, history }) => {
  const { pathname } = location;
  const classes = useClasses();
  const [localList, setLocalList] = React.useState(localRepo.list());
  const [selected, setSelected] = React.useState({ code: '', data: '', title: '' });

  React.useEffect(() => {
    if (selected && selected.id !== pathname.substr(1) && localList) {
      let [sel] = examples.concat(localList).filter((ex) => ex.id === pathname.substr(1));
      if (!sel) {
        [sel] = examples;
      }
      if (sel !== selected) {
        setSelected(sel);
      }
    }
  }, [selected, pathname, localList]);

  const onItemAdded = (title) => {
    const result = localRepo.new({ title });
    if (result && result.id) {
      setLocalList(localRepo.list());
      history.push(`/${result.id}`);
    }
  };

  const onItemRemoved = (id) => {
    const result = localRepo.delete(id);
    const next = (result && result.id) || (examples && examples[examples.length - 1].id) || '';
    setLocalList(localRepo.list());
    history.push(`/${next}`);
  };

  const onCodeUpdated = React.useCallback(
    (codeData) => {
      if (selected) {
        let { code, data } = codeData;
        if (typeof code === 'undefined') {
          code = selected.code;
        }
        if (typeof data === 'undefined') {
          data = selected.data;
        }
        const isLocal = localList.filter((l) => selected.id === l.id).length === 1;
        if (isLocal) {
          localRepo.update({ id: selected.id, code, data });
        } else {
          const result = localRepo.fork(selected, code, data);
          if (result && result.id) {
            setLocalList(localRepo.list());
            history.push(`/${result.id}`);
          }
        }
      }
    },
    [selected, localList, history]
  );
  return (
    <Box flexGrow={1} display="flex">
      <Box display="flex" className={classes.list}>
        <ExampleList
          entries={examples}
          locals={localList}
          selected={selected}
          onItemAdded={onItemAdded}
          onItemRemoved={onItemRemoved}
        />
      </Box>
      <Box display="flex" flexGrow={1} className={classes.code}>
        <CodeArea selected={selected} codeUpdated={onCodeUpdated} />
      </Box>
    </Box>
  );
};

App.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

export default App;

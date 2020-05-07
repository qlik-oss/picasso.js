import React from 'react';
import PropTypes from 'prop-types';
import Split from 'react-split-pane';
import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Paper from '@material-ui/core/Paper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import EditorArea from '../EditorArea/EditorArea';
import RenderingArea from '../RenderingArea/RenderingArea';
import SettingsArea from '../SettingsArea/SettingsArea';
import storage from '../../core/storage';

const defaultPicassoSettings = {
  api: {
    chart: true,
    compose: false,
  },
  renderer: {
    prio: ['svg'],
  },
  logger: 2,
};

const initialPicassoSettings = storage.getLocalStorage('pic.studio.settings', defaultPicassoSettings);
const storedTab = storage.getLocalStorage('pic.studio.tab', 0);

const useClasses = makeStyles({
  root: {
    position: 'relative',
  },
  code: {
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
  render: {
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
  tab: {
    minWidth: '130px',
  },
});

const TabPanel = (props) => {
  const { children, value, index } = props;
  if (value === index) {
    return <>{children}</>;
  }
  return null;
};

TabPanel.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  value: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
};

const CodeArea = ({ selected, codeUpdated }) => {
  const classes = useClasses();
  const [currentTab, setCurrentTab] = React.useState(storedTab);
  const [renderCode, setRenderCode] = React.useState('');
  const [renderData, setRenderData] = React.useState('');
  const [renderTitle, setRenderTitle] = React.useState('');
  const [settings, setSettings] = React.useState(initialPicassoSettings);
  const [codeModified, setCodeModified] = React.useState(false);

  React.useEffect(() => {
    if (selected) {
      setCodeModified(false);
      if (typeof selected.code === 'string') {
        setRenderCode(selected.code);
      }
      if (typeof selected.data === 'string') {
        setRenderData(selected.data);
      }
      if (typeof selected.title === 'string') {
        setRenderTitle(selected.title);
      }
    }
  }, [selected]);

  const onCodeChange = React.useCallback(
    (newCode) => {
      setCodeModified(true);
      setRenderCode(newCode);
      codeUpdated({ code: newCode });
    },
    [codeUpdated]
  );

  const onDataChange = React.useCallback(
    (newData) => {
      setCodeModified(true);
      setRenderData(newData);
      codeUpdated({ data: newData });
    },
    [codeUpdated]
  );

  const onTabChange = (e, v) => {
    storage.setLocalStorage('pic.studio.tab', v);
    setCodeModified(false);
    setCurrentTab(v);
  };

  const onSettingsChanged = (newSettings) => {
    storage.setLocalStorage('pic.studio.settings', newSettings);
    setCodeModified(false);
    setSettings(newSettings);
  };

  return (
    <Box flexGrow={1} display="flex" className={classes.root}>
      <Split className={classes.split} minSize={100} defaultSize="50%" split="vertical">
        <Box display="flex" flexDirection="column" className={`codebox ${classes.code}`}>
          <Box component={Paper} square>
            <Tabs value={currentTab} onChange={onTabChange} indicatorColor="primary" centered>
              <Tab label="Code" className={classes.tab} />
              <Tab label="Data" className={classes.tab} />
              <Tab label="Settings" className={classes.tab} />
            </Tabs>
          </Box>
          <Box display="flex" flexGrow={1}>
            <TabPanel value={currentTab} index={0}>
              <EditorArea code={renderCode} onCodeChange={onCodeChange} skipCodeUpdate={codeModified} />
            </TabPanel>
            <TabPanel value={currentTab} index={1}>
              <EditorArea code={renderData} onCodeChange={onDataChange} skipCodeUpdate={codeModified} />
            </TabPanel>
            <TabPanel value={currentTab} index={2}>
              <SettingsArea settings={settings} onSettingsChanged={onSettingsChanged} />
            </TabPanel>
          </Box>
        </Box>
        <Box display="flex" className={classes.render}>
          <RenderingArea
            key="chart"
            api="chart"
            title={renderTitle}
            code={renderCode}
            data={renderData}
            settings={settings}
          />
        </Box>
      </Split>
    </Box>
  );
};

CodeArea.defaultProps = {
  codeUpdated: () => {},
};

CodeArea.propTypes = {
  selected: PropTypes.shape({
    code: PropTypes.string,
    data: PropTypes.string,
    title: PropTypes.string,
  }).isRequired,
  codeUpdated: PropTypes.func,
};

export default CodeArea;

/* eslint-disable prefer-destructuring */
/* eslint-disable react/prop-types */
/* eslint-disable no-param-reassign */
import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
// import FormGroup from '@material-ui/core/FormGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import Checkbox from '@material-ui/core/Checkbox';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import makeStyles from '@material-ui/core/styles/makeStyles';
import SettingsType from '../../core/types';
import connect from '../../core/sense/connect';
import debouncer from '../../core/debounce';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    margin: 'auto',
  },
  formControl: {
    margin: theme.spacing(4),
  },
  button: {
    marginLeft: theme.spacing(4),
  },
  title: {
    color: 'white',
    marginLeft: theme.spacing(4),
  },
}));

const QDataArea = ({ onQDataChange }) => {
  const classes = useStyles();
  const [qApps, setQApps] = React.useState([]);
  const [appId, setAppId] = React.useState('');
  const [connectedApp, setConnectedApp] = React.useState();
  const [sheets, setSheets] = React.useState([]);
  const [sheetId, setSheetId] = React.useState('');
  const [charts, setCharts] = React.useState([]);
  const [chartId, setChartId] = React.useState('');
  const [objectLayout, setObjectLayout] = React.useState();
  const [disabledGetQApps, setDisabledGetQApps] = React.useState(false);
  const codeDebouncer = React.useRef();
  let liveObject;

  React.useEffect(() => {
    codeDebouncer.current = debouncer(onQDataChange, 200);
  }, [onQDataChange]);

  React.useEffect(() => {
    if (objectLayout) {
      const qData = [
        {
          type: 'q',
          key: 'qHyperCube',
          data: objectLayout.box ? objectLayout.generated.box.qHyperCube : objectLayout.qHyperCube,
        },
      ];
      codeDebouncer.current(qData);
    }
  }, [objectLayout]);

  const getQApps = () => {
    setDisabledGetQApps(true);
    connect
      .getDocs()
      .then((docs) => {
        setDisabledGetQApps(false);
        setQApps(docs);
      })
      .catch(() => {
        setDisabledGetQApps(false);
        setQApps([]);
      });
  };

  const onAppSelect = (appPath) => {
    if (+appPath < 0) {
      return;
    }
    connect.openApp(appPath).then((app) => {
      setConnectedApp(app);
      app.getSheetList().then((sheetList) => {
        if (sheetList.qAppObjectList) {
          sheetList = sheetList.qAppObjectList.qItems;
        }
        setSheets(sheetList);
      });
    });
  };

  const onAppIdSelect = (e) => {
    setAppId(e.target.value);
    onAppSelect(e.target.value);
  };

  const getSheetFromId = (id) => {
    for (let i = 0; i < sheets.length; i++) {
      if (sheets[i].qInfo.qId === id) {
        return sheets[i];
      }
    }
    return undefined;
  };

  const onSheetIdSelect = (e) => {
    setSheetId(e.target.value);
    const sheet = getSheetFromId(e.target.value);
    const promises = sheet.qData.cells.map((cell) => {
      const obj = {
        type: cell.type,
        id: cell.name,
        title: '',
      };
      return connectedApp.getObject(cell.name).then((object) => {
        return object.getProperties().then((props) => {
          obj.title = props.title || '[no title]';
          return obj;
        });
      });
    });
    Promise.all(promises).then((results) => {
      setCharts(results);
      console.log('11111:', results);
    });
  };

  function resolve(path, obj) {
    const arr = path.replace(/^\//, '').split(/\//);
    let container = obj;
    for (let i = 0; i < arr.length; i++) {
      if (!arr[i] && Array.isArray(container)) {
        return container.map((v) => resolve(arr.slice(i + 1).join('/'), v));
      }
      if (arr[i] in container) {
        container = container[arr[i]];
      }
    }

    return container;
  }

  const getData = (path, obj, layout, rect) => {
    const p = path.replace('qHyperCubeDef', 'qHyperCube');
    const cube = resolve(p, layout);
    const numCols = cube.qDimensionInfo.length + cube.qMeasureInfo.length;
    const numRows = Math.floor(10000 / numCols);
    if (cube.qMode === 'K') {
      return obj.getHyperCubeStackData(path, [
        { qLeft: rect.left || 0, qTop: 0, qHeight: numRows, qWidth: numCols - (rect.left || 0) },
      ]);
    }
    return obj.getHyperCubeData(path, [
      { qLeft: rect.left || 0, qTop: 0, qHeight: numRows, qWidth: numCols - (rect.left || 0) },
    ]);
  };

  const loadChart = (objectId) => {
    if (liveObject) {
      liveObject.observed.dispose();
      liveObject = null;
    }
    connectedApp
      .getLiveObject(objectId, (layout) => {
        if (liveObject && !layout.qSelectionInfo.qInSelections) {
          if (layout.box) {
            Promise.all([
              getData('/generated/box/qHyperCubeDef', liveObject.obj, layout, {}),
              getData('/generated/outliers/qHyperCubeDef', liveObject.obj, layout, { left: 1 }),
            ]).then((values) => {
              layout.generated.box.qHyperCube[
                layout.generated.box.qHyperCube.qMode === 'K' ? 'qStackedDataPages' : 'qDataPages'
              ] = values[0];
              layout.generated.outliers.qHyperCube[
                layout.generated.outliers.qHyperCube.qMode === 'K' ? 'qStackedDataPages' : 'qDataPages'
              ] = values[1];
              setObjectLayout(layout);
            });
          } else {
            getData('/qHyperCubeDef', liveObject.obj, layout, {}).then((pages) => {
              layout.qHyperCube[layout.qHyperCube.qMode === 'K' ? 'qStackedDataPages' : 'qDataPages'] = pages;
              setObjectLayout(layout);
            });
          }
        }
      })
      .then((o) => {
        liveObject = o;
      });
  };

  const onChartIdSelect = (e) => {
    setChartId(e.target.value);
    loadChart(e.target.value);
  };

  return (
    <Grid container spacing={1} direction="column">
      <Grid item>
        <Button className={classes.button} color="primary" onClick={getQApps} disabled={disabledGetQApps}>
          Click here to get apps
        </Button>
      </Grid>
      {qApps.length ? (
        <>
          <Grid item>
            <Divider />
          </Grid>
          <Grid item>
            <FormControl className={classes.formControl}>
              <FormLabel>Select an app</FormLabel>
              <Select labelId="app-select" value={appId} onChange={onAppIdSelect}>
                {qApps.map((item) => (
                  <MenuItem value={item.qDocId} key={item.qDocId}>
                    {item.qTitle}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </>
      ) : undefined}
      {qApps.length && sheets.length ? (
        <>
          <Grid item>
            <Divider />
          </Grid>
          <Grid item>
            <FormControl className={classes.formControl}>
              <FormLabel>Select a sheet</FormLabel>
              <Select labelId="sheet-select" value={sheetId} onChange={onSheetIdSelect}>
                {sheets.map((item) => (
                  <MenuItem value={item.qInfo.qId} key={item.qInfo.qId}>
                    {item.qMeta.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </>
      ) : undefined}
      {qApps.length && sheets.length && charts.length ? (
        <>
          <Grid item>
            <Divider />
          </Grid>
          <Grid item>
            <FormControl className={classes.formControl}>
              <FormLabel>Select a chart</FormLabel>
              <Select labelId="chart-select" value={chartId} onChange={onChartIdSelect}>
                {charts.map((item) => (
                  <MenuItem value={item.id} key={item.id}>
                    {`${item.type} - ${item.title}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </>
      ) : undefined}
    </Grid>
  );
};

QDataArea.propTypes = {
  onQDataChange: SettingsType.isRequired,
};

export default QDataArea;

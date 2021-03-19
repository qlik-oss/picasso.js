/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-destructuring */
/* eslint-disable react/prop-types */
/* eslint-disable no-param-reassign */
import 'regenerator-runtime/runtime'; // Polyfill for using async/await
import React from 'react';
import Grid from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
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
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(4),
  },
  title: {
    color: 'white',
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(4),
  },
}));

const QDataArea = ({ loadedData = {}, setLoadedData, qDataSettings = {}, onQDataSettingsChange, onQDataChange }) => {
  const classes = useStyles();
  const [qApps, setQApps] = React.useState(loadedData.qApps || []);
  const [sheets, setSheets] = React.useState(loadedData.selectedApp?.sheets || []);
  const [objects, setObjects] = React.useState(loadedData.selectedApp?.selectedSheet?.objects || []);
  const [appId, setAppId] = React.useState(qDataSettings.appId || '');
  const [sheetId, setSheetId] = React.useState(qDataSettings.sheetId || '');
  const [objectId, setObjectId] = React.useState(qDataSettings.objectId || '');
  const [objectLayout, setObjectLayout] = React.useState(loadedData.selectedApp?.selectedSheet?.selectedObject?.layout);
  const [disabledGetQApps, setDisabledGetQApps] = React.useState(false);
  const codeDebouncer = React.useRef();
  let connectedApp;
  let liveObject;

  const getQApps = () => {
    setDisabledGetQApps(true);
    connect
      .getDocs()
      .then((docs) => {
        setDisabledGetQApps(false);
        setLoadedData({ ...loadedData, qApps: docs });
      })
      .catch(() => {
        setDisabledGetQApps(false);
        setLoadedData({ ...loadedData, qApps: [] });
      });
  };

  const connectApp = () => {
    return connect.openApp(appId).then((app) => {
      return app;
    });
  };

  const onAppIdSelect = (e) => {
    setAppId(e.target.value);
    if (appId !== e.target.value) {
      setSheetId('');
      setObjectId('');
      onQDataSettingsChange({ appId: e.target.value, sheetId: '', objectId: '' });
    } else {
      onQDataSettingsChange({ appId: e.target.value, sheetId, objectId });
    }
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
    if (sheetId !== e.target.value) {
      setObjectId('');
      onQDataSettingsChange({ appId, sheetId: e.target.value, objectId: '' });
    } else {
      onQDataSettingsChange({ appId, sheetId: e.target.value, objectId });
    }
  };

  const onObjectIdSelect = (e) => {
    setObjectId(e.target.value);
    onQDataSettingsChange({ appId, sheetId, objectId: e.target.value });
  };

  const resolve = (path, obj) => {
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
  };

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

  React.useEffect(() => {
    setQApps(loadedData.qApps || []);
    setSheets(loadedData.selectedApp?.sheets || []);
    setObjects(loadedData.selectedApp?.selectedSheet?.objects || []);
    setObjectLayout(loadedData.selectedApp?.selectedSheet?.selectedObject?.layout);
  }, [loadedData]);

  React.useEffect(() => {
    setAppId(qDataSettings.appId || '');
    setSheetId(qDataSettings.sheetId || '');
    setObjectId(qDataSettings.objectId || '');
  }, [qDataSettings]);

  React.useEffect(() => {
    if (!appId || !qApps?.length) {
      return;
    }
    if (qApps.every((item) => item.qDocId !== appId)) {
      setAppId('');
      onQDataSettingsChange({ appId: '', sheetId, objectId });
      return;
    }
    if (appId === loadedData?.selectedApp?.id) {
      return;
    }
    const getSheetList = async () => {
      const loadApp = async () => {
        if (!connectedApp) {
          connectedApp = await connectApp();
        }
        return connectedApp.getSheetList().then((sheetList) => {
          if (sheetList.qAppObjectList) {
            sheetList = sheetList.qAppObjectList.qItems;
          }
          return sheetList;
        });
      };
      const sheetList = await loadApp();
      setSheets(sheetList);
      setLoadedData({ ...loadedData, selectedApp: { id: appId, sheets: sheetList } });
    };
    getSheetList();
  }, [appId, qApps]);

  React.useEffect(() => {
    if (!sheetId || !sheets?.length) {
      return;
    }
    if (sheets.every((item) => item.qInfo.qId !== sheetId)) {
      setSheetId('');
      onQDataSettingsChange({ appId, sheetId: '', objectId });
      return;
    }
    if (appId === loadedData?.selectedApp?.id && sheetId === loadedData?.selectedApp?.selectedSheet?.id) {
      return;
    }
    const getObjectList = async () => {
      const loadSheet = async () => {
        if (!connectedApp) {
          connectedApp = await connectApp();
        }
        const sheet = getSheetFromId(sheetId);
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
        return Promise.all(promises).then((results) => {
          return results;
        });
      };
      const objectList = await loadSheet();
      setLoadedData({
        ...loadedData,
        selectedApp: {
          ...loadedData.selectedApp,
          selectedSheet: { id: sheetId, objects: objectList },
        },
      });
    };
    getObjectList();
  }, [appId, sheetId, sheets]);

  React.useEffect(() => {
    if (!objectId || !objects?.length) {
      return;
    }
    if (objects.every((item) => item.id !== objectId)) {
      setObjectId('');
      onQDataSettingsChange({ appId, sheetId, objectId: '' });
      return;
    }
    if (
      appId === loadedData?.selectedApp?.id &&
      sheetId === loadedData?.selectedApp?.selectedSheet?.id &&
      objectId === loadedData?.selectedApp?.selectedSheet?.selectedObject?.id
    ) {
      return;
    }
    const getObjectLayout = async () => {
      const loadObject = async () => {
        if (!connectedApp) {
          connectedApp = await connectApp();
        }
        if (liveObject) {
          liveObject.observed.dispose();
          liveObject = null;
        }
        return connectedApp
          .getLiveObject(objectId, (layout) => {
            if (liveObject && !layout.qSelectionInfo.qInSelections) {
              if (layout.box) {
                return Promise.all([
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
                  setLoadedData({
                    ...loadedData,
                    selectedApp: {
                      ...loadedData.selectedApp,
                      selectedSheet: {
                        ...(loadedData.selectedApp?.selectedSheet || {}),
                        selectedObject: { id: objectId, layout },
                      },
                    },
                  });
                });
              }
              return getData('/qHyperCubeDef', liveObject.obj, layout, {}).then((pages) => {
                layout.qHyperCube[layout.qHyperCube.qMode === 'K' ? 'qStackedDataPages' : 'qDataPages'] = pages;
                setObjectLayout(layout);
                setLoadedData({
                  ...loadedData,
                  selectedApp: {
                    ...loadedData.selectedApp,
                    selectedSheet: {
                      ...(loadedData.selectedApp?.selectedSheet || {}),
                      selectedObject: { id: objectId, layout },
                    },
                  },
                });
              });
            }
            return Promise.resolve(undefined);
          })
          .then((o) => {
            liveObject = o;
            return liveObject;
          });
      };
      await loadObject();
    };
    getObjectLayout();
  }, [appId, sheetId, objectId, objects]);

  React.useEffect(() => {
    if (objectLayout) {
      const qData = [
        {
          type: 'q',
          key: 'qHyperCube',
          data: objectLayout.box ? objectLayout.generated.box.qHyperCube : objectLayout.qHyperCube,
        },
      ];
      if (!codeDebouncer.current) {
        codeDebouncer.current = debouncer(onQDataChange, 200);
      }
      codeDebouncer.current(qData);
    }
  }, [objectLayout, onQDataChange]);

  React.useEffect(() => {
    codeDebouncer.current = debouncer(onQDataChange, 200);
  }, [onQDataChange]);

  return (
    <Grid container spacing={1} direction="column">
      <Grid item>
        <Typography className={classes.title} variant="body1">
          Default connection: ws://localhost:9076/app/engineData
        </Typography>
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
                    {item.qDocName}
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
      {qApps.length && sheets.length && objects.length ? (
        <>
          <Grid item>
            <Divider />
          </Grid>
          <Grid item>
            <FormControl className={classes.formControl}>
              <FormLabel>Select a chart</FormLabel>
              <Select labelId="chart-select" value={objectId} onChange={onObjectIdSelect}>
                {objects.map((item) => (
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
  onQDataSettingsChange: SettingsType.isRequired,
  onQDataChange: SettingsType.isRequired,
};

export default QDataArea;

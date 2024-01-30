import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
// import enigma from 'enigma.js';
// import enigmaSchema from 'enigma.js/schemas/12.20.0.json';

import runScript from 'run-script';
import 'hammerjs';

import picasso from 'picasso.js/src';
import picQ from 'picasso-plugin-q/src';
import picHammer from 'picasso-plugin-hammer/src';

import { useResize } from '../../core/hooks';

import customGenerator from '../../generators/custom-generator';
import generator from '../../generators/hypercube-generator';
import SettingsType from '../../core/types';

// Use picasso plugins
picasso.use(picQ);
picasso.use(picHammer);

const useClasses = makeStyles((theme) => ({
  root: {
    background: 'white',
  },
  render: {
    position: 'relative',
  },
  message: {
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
}));

const RenderingArea = ({ title, code, data, api, settings, dataSource }) => {
  const element = React.useRef(null);
  const [chart, setChart] = React.useState();

  const [message, setMessage] = React.useState('Loading...');

  const prevComposition = React.useRef();
  const prevData = React.useRef();
  const prevCodeScript = React.useRef();
  const prevDataScript = React.useRef();

  const hashFromString = (str) => {
    let hash = 0;
    if (!str || !str.length) {
      return hash;
    }
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i);
      /* eslint-disable no-bitwise */
      hash = (hash << 5) - hash + chr;
      hash &= hash;
      /* eslint-enable no-bitwise */
    }
    return hash;
  };

  React.useEffect(() => {
    let ch;
    if (api === 'chart') {
      ch = picasso(settings).chart({
        element: element.current,
      });
    } else {
      ch = picasso(settings).compose({
        element: element.current,
      });
    }
    prevDataScript.current = '';
    prevCodeScript.current = '';
    setChart(ch);
    return () => {
      if (ch) {
        ch.destroy();
        ch = null;
      }
    };
  }, [settings, api, title]);

  React.useEffect(() => {
    if ((dataSource === 0 && typeof data !== 'string') || (dataSource === 1 && typeof data !== 'object')) {
      // Data not arrived yet
      return;
    }
    if (chart && chart.update && typeof code === 'string' && (typeof data === 'string' || typeof data === 'object')) {
      let doRun = false;
      let composition = prevComposition.current;
      let theData = prevData.current;
      const isQDataDeclare = `const isQData = ${dataSource};${String.fromCharCode(10)}`;
      const dataHashId = typeof data === 'string' ? data : hashFromString(JSON.stringify(data));
      const updatedCode = isQDataDeclare + (typeof data === 'string' ? '' : dataHashId) + code;

      if (updatedCode !== prevCodeScript.current) {
        doRun = true;
        composition =
          runScript(code, {
            picasso,
            chart,
            isQData: !!dataSource,
            qLayout: !!dataSource ? data : undefined,
          }) || {};
        prevCodeScript.current = updatedCode;
        prevComposition.current = composition;
      }
      if (dataHashId !== prevDataScript.current) {
        doRun = true;
        theData =
          (typeof data === 'string'
            ? runScript(data, {
                customGenerator,
                generator,
              })
            : [
                {
                  type: 'q',
                  key: 'qHyperCube',
                  data: data.box ? data.generated.box.qHyperCube : data.qHyperCube,
                },
              ]) || {};
        prevDataScript.current = dataHashId;
        prevData.current = theData;
      }

      if (!doRun) {
        return;
      }

      if (composition && composition.error) {
        setMessage(`${api}: ${title} > Code error: ${composition.error.name}`);
      } else if (theData && theData.error) {
        setMessage(`${api}: ${title} > Data error: ${theData.error.name}`);
      } else {
        try {
          chart.update({ settings: composition, data: theData });
          setMessage(`${api}: ${title} > Success`);
        } catch (error) {
          setMessage(`Rendering error: ${error.message}`);
          console.error(error); // eslint-disable-line no-console
        }
      }
    }
  }, [code, data, chart, api, title, dataSource]);

  const updateChart = React.useCallback(() => {
    if ((dataSource === 0 && typeof data !== 'string') || (dataSource === 1 && typeof data !== 'object')) {
      // Data not arrived yet
      return;
    }
    if (chart && chart.update) {
      chart.update();
    }
  }, [chart, data, dataSource]);

  useResize(element, updateChart);

  const classes = useClasses();

  // render
  return (
    <Box display="flex" flexDirection="column" flexGrow={1} className={classes.root}>
      <Box flexGrow={1} ref={element} className={classes.render} />
      <Box className={classes.message} p={1}>
        <Typography>{message}</Typography>
      </Box>
    </Box>
  );
};

RenderingArea.defaultProps = {
  api: 'chart',
};

RenderingArea.propTypes = {
  title: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
  data: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  api: PropTypes.string,
  settings: SettingsType.isRequired,
  dataSource: PropTypes.number.isRequired,
};

export default RenderingArea;

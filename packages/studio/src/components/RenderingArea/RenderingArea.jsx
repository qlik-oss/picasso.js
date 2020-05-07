import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
// import enigma from 'enigma.js';
// import enigmaSchema from 'enigma.js/schemas/12.20.0.json';

import runScript from 'run-script';
import 'hammerjs';

import picasso from '../../../../picasso.js/src';
import picQ from '../../../../../plugins/q/src';
import picHammer from '../../../../../plugins/hammer/src';

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

const RenderingArea = ({ title, code, data, api, settings }) => {
  const element = React.useRef(null);
  const [chart, setChart] = React.useState();

  const [message, setMessage] = React.useState('Loading...');

  const prevComposition = React.useRef();
  const prevData = React.useRef();
  const prevCodeScript = React.useRef();
  const prevDataScript = React.useRef();

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
    if (chart && chart.update && typeof code === 'string' && typeof data === 'string') {
      let doRun = false;
      let composition = prevComposition.current;
      let theData = prevData.current;

      if (code !== prevCodeScript.current) {
        doRun = true;
        composition =
          runScript(code, {
            picasso,
            chart,
          }) || {};
        prevCodeScript.current = code;
        prevComposition.current = composition;
      }
      if (data !== prevDataScript.current) {
        doRun = true;
        theData =
          runScript(data, {
            customGenerator,
            generator,
          }) || {};
        prevDataScript.current = data;
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
  }, [code, data, chart, api, title]);

  const updateChart = React.useCallback(() => {
    if (chart && chart.update) {
      chart.update();
    }
  }, [chart]);

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
  data: PropTypes.string.isRequired,
  api: PropTypes.string,
  settings: SettingsType.isRequired,
};

export default RenderingArea;

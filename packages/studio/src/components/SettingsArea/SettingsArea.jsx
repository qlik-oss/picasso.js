import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
// import FormGroup from '@material-ui/core/FormGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import Checkbox from '@material-ui/core/Checkbox';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import makeStyles from '@material-ui/core/styles/makeStyles';
import SettingsType from '../../core/types';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(4),
    margin: 'auto',
  },
  formControl: {
    margin: theme.spacing(4),
  },
}));

const SettingsArea = ({ settings, onSettingsChanged }) => {
  const classes = useStyles();
  // const [state, setState] = React.useState(settings);

  const handleChange = React.useCallback(
    event => {
      const { name, value, checked } = event.target;
      const paths = name.split('.');
      const lastPath = paths.splice(paths.length - 1, 1);
      const newSettings = JSON.parse(JSON.stringify(settings));
      const prop = paths.reduce((p, c) => p[c], newSettings);
      prop[lastPath] = typeof checked !== 'undefined' ? checked : value;
      onSettingsChanged(newSettings);
    },
    [onSettingsChanged, settings]
  );

  // const { chart, compose } = settings.api;
  const { renderer, logger } = settings;

  return (
    <Box display="flex" flexGrow={1} flexDirection="column" className={classes.root}>
      {/* <FormControl className={classes.formControl}>
        <FormLabel>Picasso API&apos;s</FormLabel>
        <FormGroup row>
          <FormControlLabel
            control={<Checkbox checked={chart} onChange={handleChange} name="api.chart" color="primary" />}
            label="Chart API"
          />
          <FormControlLabel
            control={<Checkbox checked={compose} onChange={handleChange} name="api.compose" color="primary" />}
            label="Compose API"
          />
        </FormGroup>
      </FormControl> */}
      <Divider />
      <Box display="flex">
        <FormControl className={classes.formControl}>
          <FormLabel>Renderer</FormLabel>
          <Select labelId="renderer-select" value={renderer.prio[0]} name="renderer.prio.0" onChange={handleChange}>
            <MenuItem value="svg">SVG</MenuItem>
            <MenuItem value="canvas">Canvas</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Divider />
      <Box display="flex">
        <FormControl className={classes.formControl}>
          <FormLabel>Logging Level</FormLabel>
          <Select labelId="logger-select" value={logger} name="logger" onChange={handleChange}>
            <MenuItem value={0}>off</MenuItem>
            <MenuItem value={1}>error</MenuItem>
            <MenuItem value={2}>warning</MenuItem>
            <MenuItem value={3}>info</MenuItem>
            <MenuItem value={4}>debug</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

SettingsArea.propTypes = {
  settings: SettingsType.isRequired,
  onSettingsChanged: PropTypes.func.isRequired,
};

export default SettingsArea;

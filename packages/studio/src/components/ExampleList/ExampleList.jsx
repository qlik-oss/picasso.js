import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import SvgIcon from '@material-ui/core/SvgIcon';
import Popover from '@material-ui/core/Popover';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DoneIcon from '@material-ui/icons/Done';
import ClearIcon from '@material-ui/icons/Clear';
import RemoveIcon from '@material-ui/icons/Remove';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import SubDivider from '../SubDivider/SubDivider';
import ListItemLink from '../ListItemLink/ListItemLink';
import PicassoIcon from './picasso-logo.svg';

const useClasses = makeStyles((theme) => ({
  root: {
    width: '100%',
    color: theme.palette.text.primary,
    overflow: 'auto',
  },
  header: {
    padding: '1em',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
}));

const ExampleList = ({ entries, locals, selected, onItemAdded, onItemRemoved }) => {
  const [showNameInput, setShowNameInput] = React.useState(false);
  const [showConfirmRemove, setShowConfirmRemove] = React.useState(false);
  const removeAnchorEl = React.useRef(null);
  const addAnchorEl = React.useRef(null);
  const inputEl = React.useRef(null);
  const classes = useClasses();

  const onAddClicked = () => {
    setShowNameInput(true);
  };

  const onRemoveClicked = React.useCallback(() => {
    if (selected && locals.filter((l) => l.id === selected.id).length) {
      setShowConfirmRemove(true);
    }
  }, [selected, locals]);

  const handleConfirmAdd = () => {
    const name = inputEl.current ? inputEl.current.value : '';
    if (name !== '') {
      onItemAdded(name);
      setShowNameInput(false);
    }
  };

  const handleConfirmRemove = React.useCallback(() => {
    if (selected) {
      onItemRemoved(selected.id);
      setShowConfirmRemove(false);
    }
  }, [selected, onItemRemoved]);

  const handleClosePopup = () => {
    setShowNameInput(false);
    setShowConfirmRemove(false);
  };

  const handleKeyPressed = (event) => {
    if (event.key === 'Enter') {
      const name = event.target.value;
      if (name !== '') {
        onItemAdded(name);
        setShowNameInput(false);
      }
      event.preventDefault();
    }
  };

  const exampleEntries = entries.map((entry) => (
    <ListItemLink
      key={entry.id}
      to={`/${entry.id}`}
      selected={selected && selected.id === entry.id}
      primary={entry.title}
    />
  ));
  const localEntries = locals.map((entry) => (
    <ListItemLink
      key={entry.id}
      to={`/${entry.id}`}
      selected={selected && selected.id === entry.id}
      primary={entry.title}
    />
  ));
  return (
    <Paper square variant="outlined" elevation={2} className={classes.root}>
      <div className={classes.header}>
        <SvgIcon className={classes.logo} component={PicassoIcon} viewBox="0 0 480 128" />
      </div>
      <SubDivider text="Picasso Examples" />
      <List dense className={classes.list} component="nav">
        {exampleEntries}
      </List>
      <SubDivider text="Custom Examples" />
      <List dense className={classes.list} component="nav">
        {localEntries}
      </List>
      <Divider />
      <List dense className={classes.list} component="nav">
        <ListItem dense button onClick={onAddClicked} ref={addAnchorEl}>
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary="Add" />
        </ListItem>
        <ListItem button onClick={onRemoveClicked} ref={removeAnchorEl}>
          <ListItemIcon>
            <RemoveIcon />
          </ListItemIcon>
          <ListItemText primary="Remove" />
        </ListItem>
      </List>
      <Popover
        open={showNameInput}
        anchorEl={addAnchorEl.current}
        onClose={handleClosePopup}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box display="flex" alignItems="center" p={1}>
          <TextField
            label="Name"
            onKeyPress={handleKeyPressed}
            margin="dense"
            size="small"
            inputRef={inputEl}
            autoFocus
          />
          <IconButton size="small" color="primary" onClick={handleConfirmAdd}>
            <DoneIcon />
          </IconButton>
          <IconButton size="small" color="secondary" onClick={handleClosePopup}>
            <ClearIcon />
          </IconButton>
        </Box>
      </Popover>
      <Popover
        open={showConfirmRemove}
        anchorEl={removeAnchorEl.current}
        onClose={handleClosePopup}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box display="flex" alignItems="center" p={1}>
          <Typography component="h4">{`Remove "${selected && selected.title}"?`}</Typography>
          <IconButton size="small" color="primary" onClick={handleConfirmRemove}>
            <DoneIcon />
          </IconButton>
          <IconButton size="small" color="secondary" onClick={handleClosePopup}>
            <ClearIcon />
          </IconButton>
        </Box>
      </Popover>
    </Paper>
  );
};

const entry = {
  id: PropTypes.string,
  title: PropTypes.string,
  code: PropTypes.string,
  data: PropTypes.string,
};

ExampleList.defaultProps = {
  locals: [],
  selected: null,
  onItemAdded: () => {},
  onItemRemoved: () => {},
};

ExampleList.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.shape(entry)).isRequired,
  locals: PropTypes.arrayOf(PropTypes.shape(entry)),
  selected: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
  }),
  onItemAdded: PropTypes.func,
  onItemRemoved: PropTypes.func,
};

export default ExampleList;

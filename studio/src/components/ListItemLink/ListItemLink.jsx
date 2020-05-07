import React from 'react';
import PropTypes from 'prop-types';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Link as RouterLink } from 'react-router-dom';

const ListItemLink = ({ primary, to, selected }) => {
  const renderLink = React.useMemo(
    () => React.forwardRef((itemProps, ref) => <RouterLink to={to} ref={ref} {...itemProps} />), // eslint-disable-line react/jsx-props-no-spreading
    [to]
  );

  return (
    <ListItem button selected={selected} component={renderLink}>
      <ListItemText primary={primary} />
    </ListItem>
  );
};

ListItemLink.defaultProps = {
  selected: false,
};

ListItemLink.propTypes = {
  primary: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  selected: PropTypes.bool,
};

export default ListItemLink;

import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Divider from '@material-ui/core/Divider';

const useClasses = makeStyles((theme) => ({
  subDivider: {
    color: theme.palette.primary.main,
    padding: '3px 3px 3px 3px',
    fontSize: '11px',
  },
}));

const SubDivider = ({ text }) => {
  const classes = useClasses();
  return (
    <>
      <Divider />
      <div className={classes.subDivider}>{text}</div>
      <Divider />
    </>
  );
};
SubDivider.propTypes = {
  text: PropTypes.string.isRequired,
};

export default SubDivider;

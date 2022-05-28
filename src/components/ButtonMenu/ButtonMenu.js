import { Button, Menu, MenuItem } from '@mui/material';
import { useState, cloneElement } from 'react';


const ButtonMenu = (props) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = anchorEl;
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    }

    const handleMenuClick = (child) => {
        child.props.onClick();
        setAnchorEl(null);
    };
    return (
        <div>
            <Button
                id="basic-button"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                variant="contained"
            >
                {props.buttonLabel}
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                {
                    props.children.map((child) => {
                        return cloneElement(child, { onClick: () => handleMenuClick(child) })
                    })
                }
            </Menu>
        </div>
    )
}

export default ButtonMenu;
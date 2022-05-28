import './Button.scss';
import { useState, useRef } from 'react';

const Button2 = (props) => {
    const isIcon = props.children.type ? true : false;

    function clickHandler(e) {
        if (props.type !== 'submit') {
            e.preventDefault();
        }
        if (props.click) {
            props.click();
        }
    }

    function mouseEnterHandler(e) {
        if (props.mouseEnter) {
            props.mouseEnter();
        }
    }

    function mouseLeaveHandler(e) {
        if (props.mouseLeave) {
            props.mouseLeave();
        }
    }

    return (
        // <button type={props.type === 'submit' ? 'submit' : ''} className={"button button-level" + props.level + " button-size" + props.size + " " + (isIcon ? "button-icon" : "")} onClick={(e) => { clickHandler(e) }} style={props.style} onMouseEnter={(e) => { mouseEnterHandler(e) }} onMouseLeave={(e) => { mouseLeaveHandler(e) }} >
        //     {props.children}
        // </button>
        <div></div>
    );
}

const ButtonDropdown2 = (props) => {
    const dropdown = useRef(null);
    const [showDropdown, setShowDropdown] = useState(false);

    function mouseEnterHandler(e) {
        if (props.hover) {
            setShowDropdown(true);
        }
    }

    function mouseLeaveHandler(e) {
        if (props.hover) {
            setShowDropdown(false);
        }
    }

    function toggleDropdown(e) {
        if (!props.hover) {
            setShowDropdown(!showDropdown);
        }
    }

    if (!props.hover) {
        window.addEventListener('click', (e) => {
            if (showDropdown && !dropdown.current.contains(e.target)) {
                setShowDropdown(false);
            }
        });
    }

    return (
        <div ref={dropdown}>
            {/* <Button
                size={props.size}
                level={props.level}
                mouseEnter={(e) => mouseEnterHandler(e)}
                mouseLeave={(e) => mouseLeaveHandler(e)}
                click={(e) => toggleDropdown(e)}
            >
                {props.children}
            </Button>
            {showDropdown &&
                <div className='dropdown'>
                    {props.dropdown}
                </div>
            } */}
        </div>
    )
}

export { Button2, ButtonDropdown2 }; 